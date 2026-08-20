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
  while ($true) { $stream = [IO.MemoryStream]::new(); do { $buffer = New-Object byte[] 1048576; $result = $socket.ReceiveAsync([ArraySegment[byte]]$buffer, [Threading.CancellationToken]::None).GetAwaiter().GetResult(); $stream.Write($buffer, 0, $result.Count) } while (-not $result.EndOfMessage); $response = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json; if ($response.id -eq $requestId) { return $response } }
}
function Click($selector) { Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('$selector').click()" } | Out-Null }
function Capture-Condition($condition) {
  foreach ($viewport in @(@{ width = 360; height = 800 }, @{ width = 412; height = 786 })) {
    Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null
    Start-Sleep -Milliseconds 200
    Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')" } | Out-Null
    $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $false }
    [IO.File]::WriteAllBytes("C:\Users\user\Downloads\day2-trial-result-22.3\day2-$condition-result-$($viewport.width)x$($viewport.height).png", [Convert]::FromBase64String($shot.result.data))
    $expression = "JSON.stringify((()=>{const d=document.documentElement,b=document.querySelector('.day2-result-action .primary-button').getBoundingClientRect(),m=document.querySelector('.day2-result-metrics').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],scrollWidth:d.scrollWidth,clientWidth:d.clientWidth,documentHeight:d.scrollHeight,overflow:d.scrollWidth-d.clientWidth,condition:document.querySelector('.day2-result-condition h2').textContent,cta:{left:b.left,right:b.right,bottom:b.bottom},metrics:{left:m.left,right:m.right}}})())"
    $metrics = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
    Write-Output "$condition-$($viewport.width): $($metrics.result.result.value)"
  }
}
New-Item -ItemType Directory -Force 'C:\Users\user\Downloads\day2-trial-result-22.3' | Out-Null
Send-Cdp 'Page.enable' @{} | Out-Null
Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5174/artifacts/day2-trial-result-22.3/capture.html' } | Out-Null
Start-Sleep -Milliseconds 800
Click '.primary-button'; Start-Sleep -Milliseconds 200; Click '.day2-ready-action .primary-button'; Start-Sleep -Milliseconds 3127; Click '.day2-running-action .now-button'; Start-Sleep -Milliseconds 250
Capture-Condition 'plain'
Click '.day2-result-action .primary-button'; Start-Sleep -Milliseconds 2941; Click '.day2-running .now-button'; Start-Sleep -Milliseconds 250
Capture-Condition 'distracted'
$socket.Dispose()
