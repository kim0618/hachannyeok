$ErrorActionPreference = 'Stop'
$target = (Invoke-RestMethod 'http://127.0.0.1:9333/json/list')[0]
$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
$script:id = 0
function Send-Cdp($method, $params) {
  $script:id++; $requestId = $script:id
  $json = @{ id = $requestId; method = $method; params = $params } | ConvertTo-Json -Depth 8 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $socket.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  while ($true) {
    $stream = [IO.MemoryStream]::new()
    do { $buffer = New-Object byte[] 1048576; $result = $socket.ReceiveAsync([ArraySegment[byte]]$buffer, [Threading.CancellationToken]::None).GetAwaiter().GetResult(); $stream.Write($buffer, 0, $result.Count) } while (-not $result.EndOfMessage)
    $response = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
    if ($response.id -eq $requestId) { return $response }
  }
}
Send-Cdp 'Page.enable' @{} | Out-Null
Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5174/artifacts/day2-plain-running-22.2/capture.html' } | Out-Null
Start-Sleep -Milliseconds 800
Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('.primary-button').click()" } | Out-Null
Start-Sleep -Milliseconds 250
Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('.day2-ready-action .primary-button').click()" } | Out-Null
Start-Sleep -Milliseconds 250
$out = 'C:\Users\user\Downloads\day2-plain-running-22.2'
New-Item -ItemType Directory -Force $out | Out-Null
foreach ($viewport in @(@{ width = 360; height = 800 }, @{ width = 412; height = 786 })) {
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Start-Sleep -Milliseconds 250
  Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')" } | Out-Null
  $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $true }
  [IO.File]::WriteAllBytes("$out\day2-plain-running-$($viewport.width)x$($viewport.height).png", [Convert]::FromBase64String($shot.result.data))
  $expression = "JSON.stringify((()=>{const d=document.documentElement,b=document.querySelector('.day2-running-action .now-button').getBoundingClientRect(),i=document.querySelector('.day2-empty-dial').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],clientWidth:d.clientWidth,scrollWidth:d.scrollWidth,documentHeight:d.scrollHeight,overflow:d.scrollWidth-d.clientWidth,referenceText:document.body.innerText.includes('3.000'),cta:{left:b.left,right:b.right,width:b.width,bottom:b.bottom},dial:{left:i.left,right:i.right,width:i.width}}})())"
  $metrics = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
  Write-Output "$($viewport.width): $($metrics.result.result.value)"
}
$socket.Dispose()
