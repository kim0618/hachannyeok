$ErrorActionPreference = 'Stop'
$targets = Invoke-RestMethod 'http://127.0.0.1:9333/json/list'
$target = $targets.Where({ $_.type -eq 'page' }, 'First')[0]
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
Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5173/' } | Out-Null
Start-Sleep -Milliseconds 800
Send-Cdp 'Runtime.evaluate' @{ expression = "localStorage.clear(); location.reload()" } | Out-Null
Start-Sleep -Milliseconds 700
Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('.home-reference-cta').click()" } | Out-Null
Start-Sleep -Milliseconds 100
Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('.intro-reference-start').click()" } | Out-Null
Start-Sleep -Milliseconds 100
Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('.time-ready-reference-start').click()" } | Out-Null
Start-Sleep -Milliseconds 3041
Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('.time-running-action button').click()" } | Out-Null
Start-Sleep -Milliseconds 200
foreach ($viewport in @(@{ width = 360; height = 800 }, @{ width = 412; height = 786 })) {
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Start-Sleep -Milliseconds 250
  Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')" } | Out-Null
  $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $false }
  $path = "C:\Users\user\Downloads\time-result-$($viewport.width)x$($viewport.height).png"
  [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($shot.result.data))
  $expression = "JSON.stringify((()=>{const d=document.documentElement,b=document.querySelector('.time-result-poster .bottom-action button').getBoundingClientRect(),i=document.querySelector('.time-result-instrument').getBoundingClientRect(),n=document.querySelector('.time-result-note').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],clientWidth:d.clientWidth,scrollWidth:d.scrollWidth,documentHeight:d.scrollHeight,overflow:d.scrollWidth-d.clientWidth,button:{top:b.top,bottom:b.bottom},instrument:{left:i.left,right:i.right,top:i.top,bottom:i.bottom},note:{top:n.top,bottom:n.bottom}}})())"
  $metrics = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
  Write-Output "$($viewport.width): $($metrics.result.result.value)"
}
$socket.Dispose()
