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
  while ($true) { $stream = [IO.MemoryStream]::new(); do { $buffer = New-Object byte[] 1048576; $result = $socket.ReceiveAsync([ArraySegment[byte]]$buffer,[Threading.CancellationToken]::None).GetAwaiter().GetResult(); $stream.Write($buffer,0,$result.Count) } while (-not $result.EndOfMessage); $response=[Text.Encoding]::UTF8.GetString($stream.ToArray())|ConvertFrom-Json; if($response.id -eq $requestId){return $response} }
}
function Eval($expression) { Send-Cdp 'Runtime.evaluate' @{ expression=$expression } | Out-Null; Start-Sleep -Milliseconds 120 }
Send-Cdp 'Page.enable' @{} | Out-Null; Send-Cdp 'Page.navigate' @{url='http://127.0.0.1:5173/'} | Out-Null; Start-Sleep -Milliseconds 800
Eval "localStorage.clear();location.reload()"; Start-Sleep -Milliseconds 700; Eval "window.__controlNow=0;Object.defineProperty(performance,'now',{configurable:true,value:()=>window.__controlNow})"
Eval "document.querySelector('.home-reference-cta').click()"; Eval "document.querySelector('.intro-reference-start').click()"; Eval "document.querySelector('.time-ready-reference-start').click()"
Eval "document.querySelector('.time-running-action button').click()"; Eval "document.querySelector('.time-result-poster .bottom-action button').click()"; Eval "document.querySelector('.time-running-action button').click()"; Eval "document.querySelector('.time-result-poster .bottom-action button').click()"; Eval "document.querySelector('.time-running-action button').click()"; Eval "document.querySelector('.summary-screen .bottom-action button').click()"
Eval "document.querySelector('.center-ready-action button').click()"; foreach($trial in 1..3){Eval "(()=>{const e=document.querySelector('.center-shape'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width*.37,clientY:r.top+r.height*.33}))})()";if($trial -lt 3){Eval "document.querySelector('.center-result-poster .bottom-action button').click()"}}
Eval "document.querySelector('.summary-screen .bottom-action button').click()"; Eval "document.querySelector('.balance-ready-action button').click()"; Eval "document.querySelector('.balance-running-action button').click()"; Eval "document.querySelector('.balance-result-action button').click()"; Eval "document.querySelector('.balance-running-action button').click()"; Eval "document.querySelector('.summary-screen .bottom-action button').click()"; Eval "document.querySelector('.control-ready-action button').click()"
foreach($timestamp in @(500,850)){
  Eval "window.__controlNow=$timestamp"; Start-Sleep -Milliseconds 150
  $viewports=if($timestamp -eq 500){@(@{width=320;height=800},@{width=360;height=800},@{width=390;height=844},@{width=412;height=786},@{width=430;height=932})}else{@(@{width=360;height=800},@{width=412;height=786})}
  foreach($viewport in $viewports){
    Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$viewport.width;height=$viewport.height;deviceScaleFactor=1;mobile=$true}|Out-Null;Start-Sleep -Milliseconds 180
    Eval "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(e=>e.style.display='none')"
    $shot=Send-Cdp 'Page.captureScreenshot' @{format='png';fromSurface=$true;captureBeyondViewport=$false};[IO.File]::WriteAllBytes("C:\Users\user\Downloads\control-running-$($timestamp)ms-$($viewport.width)x$($viewport.height).png",[Convert]::FromBase64String($shot.result.data))
    $expression="JSON.stringify((()=>{const d=document.documentElement,f=document.querySelector('.control-running-instrument').getBoundingClientRect(),m=document.querySelector('.control-marker'),s=document.querySelector('.control-start'),t=document.querySelector('.control-target'),n=document.querySelector('.control-running-note').getBoundingClientRect(),b=document.querySelector('.control-running-action button').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],overflow:d.scrollWidth-d.clientWidth,documentHeight:d.scrollHeight,field:{left:f.left,right:f.right,top:f.top,bottom:f.bottom},marker:m.getAttribute('style'),markerClass:m.className,start:s.getAttribute('style'),target:t.getAttribute('style'),note:{top:n.top,bottom:n.bottom},button:{top:b.top,bottom:b.bottom},resultCue:document.body.innerText.includes('%')}})())";$metrics=Send-Cdp 'Runtime.evaluate' @{expression=$expression;returnByValue=$true};Write-Output "$timestamp-$($viewport.width): $($metrics.result.result.value)"
  }
}
$socket.Dispose()
