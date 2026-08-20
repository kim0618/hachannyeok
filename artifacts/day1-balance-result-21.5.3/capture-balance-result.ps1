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
function Eval($expression) { Send-Cdp 'Runtime.evaluate' @{ expression = $expression } | Out-Null; Start-Sleep -Milliseconds 120 }
function Reach-BalanceReady() {
  Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5173/' } | Out-Null; Start-Sleep -Milliseconds 700
  Eval "localStorage.clear(); location.reload()"; Start-Sleep -Milliseconds 650
  Eval "document.querySelector('.home-reference-cta').click()"; Eval "document.querySelector('.intro-reference-start').click()"; Eval "document.querySelector('.time-ready-reference-start').click()"
  Eval "document.querySelector('.time-running-action button').click()"; Eval "document.querySelector('.time-result-poster .bottom-action button').click()"; Eval "document.querySelector('.time-running-action button').click()"; Eval "document.querySelector('.time-result-poster .bottom-action button').click()"; Eval "document.querySelector('.time-running-action button').click()"; Eval "document.querySelector('.summary-screen .bottom-action button').click()"
  Eval "document.querySelector('.center-ready-action button').click()"
  foreach ($trial in 1..3) { Eval "(()=>{const e=document.querySelector('.center-shape'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width*.37,clientY:r.top+r.height*.33}))})()"; if ($trial -lt 3) { Eval "document.querySelector('.center-result-poster .bottom-action button').click()" } }
  Eval "document.querySelector('.summary-screen .bottom-action button').click()"
}
function Capture($orientation) {
  foreach ($viewport in @(@{ width = 360; height = 800 }, @{ width = 412; height = 786 })) {
    Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null; Start-Sleep -Milliseconds 250
    Eval "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')"
    $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $false }
    [IO.File]::WriteAllBytes("C:\Users\user\Downloads\balance-result-$orientation-$($viewport.width)x$($viewport.height).png",[Convert]::FromBase64String($shot.result.data))
    $expression = "JSON.stringify((()=>{const d=document.documentElement,f=document.querySelector('.balance-result-area').getBoundingClientRect(),a=document.querySelector('.balance-result-actual'),t=document.querySelector('.balance-result-target'),q=document.querySelector('.balance-result-distance'),b=document.querySelector('.balance-result-action button').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],overflow:d.scrollWidth-d.clientWidth,documentHeight:d.scrollHeight,field:{left:f.left,right:f.right,top:f.top,bottom:f.bottom},actual:a.getAttribute('style'),target:t.getAttribute('style'),distance:q.getAttribute('style'),button:{top:b.top,bottom:b.bottom},metric:document.querySelector('.balance-result-metric h1').innerText,legend:document.querySelector('.balance-result-legend').innerText}})())"
    $metrics=Send-Cdp 'Runtime.evaluate' @{expression=$expression;returnByValue=$true}; Write-Output "$orientation-$($viewport.width): $($metrics.result.result.value)"
  }
}
Send-Cdp 'Page.enable' @{} | Out-Null
Reach-BalanceReady; Eval "document.querySelector('.balance-ready-action button').click()"; foreach ($step in 1..17) { Eval "document.querySelector('.balance-area').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowRight'}))" }; Eval "document.querySelector('.balance-running-action button').click()"; Capture 'vertical'
Reach-BalanceReady; Eval "document.querySelector('.balance-ready-action button').click()"; Eval "Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'))"; Eval "Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'})"; Eval "document.querySelector('.result-screen .bottom-action button').click()"; foreach ($step in 1..19) { Eval "document.querySelector('.balance-area').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowUp'}))" }; Eval "document.querySelector('.balance-running-action button').click()"; Capture 'horizontal'
$socket.Dispose()
