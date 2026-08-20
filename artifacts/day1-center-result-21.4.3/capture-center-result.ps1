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
function Eval($expression) { Send-Cdp 'Runtime.evaluate' @{ expression = $expression } | Out-Null; Start-Sleep -Milliseconds 100 }
Send-Cdp 'Page.enable' @{} | Out-Null
Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5173/' } | Out-Null
Start-Sleep -Milliseconds 800
Eval "localStorage.clear(); location.reload()"
Start-Sleep -Milliseconds 700
Eval "document.querySelector('.home-reference-cta').click()"
Eval "document.querySelector('.intro-reference-start').click()"
Eval "document.querySelector('.time-ready-reference-start').click()"
Eval "document.querySelector('.time-running-action button').click()"
Eval "document.querySelector('.time-result-poster .bottom-action button').click()"
Eval "document.querySelector('.time-running-action button').click()"
Eval "document.querySelector('.time-result-poster .bottom-action button').click()"
Eval "document.querySelector('.time-running-action button').click()"
Eval "document.querySelector('.summary-screen .bottom-action button').click()"
Eval "document.querySelector('.center-ready-action button').click()"
Eval "(()=>{const e=document.querySelector('.center-shape'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width*.37,clientY:r.top+r.height*.33}))})()"
Start-Sleep -Milliseconds 250
foreach ($viewport in @(@{ width = 320; height = 800 }, @{ width = 360; height = 800 }, @{ width = 390; height = 844 }, @{ width = 412; height = 786 }, @{ width = 430; height = 932 })) {
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Start-Sleep -Milliseconds 250
  Eval "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')"
  $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $false }
  $path = "C:\Users\user\Downloads\center-result-$($viewport.width)x$($viewport.height).png"
  [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($shot.result.data))
  $expression = "JSON.stringify((()=>{const d=document.documentElement,f=document.querySelector('.center-result-field').getBoundingClientRect(),b=document.querySelector('.center-result-poster .bottom-action button').getBoundingClientRect(),s=document.querySelector('.center-selected-marker'),t=document.querySelector('.center-true-marker'),l=document.querySelector('.center-result-connection line');return{viewport:[innerWidth,innerHeight],clientWidth:d.clientWidth,scrollWidth:d.scrollWidth,documentHeight:d.scrollHeight,overflow:d.scrollWidth-d.clientWidth,field:{left:f.left,right:f.right,top:f.top,bottom:f.bottom},button:{top:b.top,bottom:b.bottom},selected:[s.style.left,s.style.top],target:[t.style.left,t.style.top],line:[l.getAttribute('x1'),l.getAttribute('y1'),l.getAttribute('x2'),l.getAttribute('y2')]}})())"
  $metrics = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
  Write-Output "$($viewport.width): $($metrics.result.result.value)"
}
$socket.Dispose()
