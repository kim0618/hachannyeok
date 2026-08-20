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
function Click($selector) { Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelector('$selector').click()" } | Out-Null; Start-Sleep -Milliseconds 140 }
function Click-Text($text) { Send-Cdp 'Runtime.evaluate' @{ expression = "[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='$text').click()" } | Out-Null; Start-Sleep -Milliseconds 220 }
New-Item -ItemType Directory -Force 'C:\Users\user\Downloads\day2-analysis-22.5' | Out-Null
Send-Cdp 'Page.enable' @{} | Out-Null
Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5174/artifacts/day2-analysis-22.5/capture.html' } | Out-Null
Start-Sleep -Milliseconds 900
foreach ($viewport in @(@{ width = 360; height = 800 }, @{ width = 412; height = 786 })) {
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none');scrollTo(0,0)" } | Out-Null
  Start-Sleep -Milliseconds 250
  $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $false }
  [IO.File]::WriteAllBytes("C:\Users\user\Downloads\day2-analysis-22.5\day2-analysis-$($viewport.width)x$($viewport.height).png", [Convert]::FromBase64String($shot.result.data))
  $layout = Send-Cdp 'Page.getLayoutMetrics' @{}
  $height = [Math]::Ceiling($layout.result.cssContentSize.height)
  $full = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $true; clip = @{ x = 0; y = 0; width = $viewport.width; height = $height; scale = 1 } }
  [IO.File]::WriteAllBytes("C:\Users\user\Downloads\day2-analysis-22.5\day2-analysis-$($viewport.width)x$($viewport.height)-full.png", [Convert]::FromBase64String($full.result.data))
  $expression = "JSON.stringify((()=>{const d=document.documentElement,b=document.querySelector('.day2-analysis-actions .primary-button').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],scrollWidth:d.scrollWidth,clientWidth:d.clientWidth,documentHeight:d.scrollHeight,overflow:d.scrollWidth-d.clientWidth,ctaWidth:b.width,ctaLeft:b.left,ctaRight:b.right}})())"
  $metrics = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
  Write-Output "$($viewport.width)x$($viewport.height): $($metrics.result.result.value)"
}
$socket.Dispose()
