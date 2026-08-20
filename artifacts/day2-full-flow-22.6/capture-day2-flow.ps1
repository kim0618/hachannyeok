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
function Eval($expression) { $response = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }; return $response.result.result.value }
function Click-Text($text) { Eval("[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='$text').click()") | Out-Null; Start-Sleep -Milliseconds 180 }
function Click-Includes($text) { Eval("[...document.querySelectorAll('button')].find(button=>button.textContent.includes('$text')).click()") | Out-Null; Start-Sleep -Milliseconds 180 }
function Click($selector) { Eval("document.querySelector('$selector').click()") | Out-Null; Start-Sleep -Milliseconds 180 }
function Capture($name) {
  Eval("document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')") | Out-Null
  $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $false }
  [IO.File]::WriteAllBytes("C:\Users\user\Downloads\day2-full-flow-22.6\$name.png", [Convert]::FromBase64String($shot.result.data))
  $metrics = Eval("JSON.stringify((()=>{const d=document.documentElement,cta=document.querySelector('.primary-button'),progress=[...document.querySelectorAll('.day2-condition-progress strong')].map(x=>x.getBoundingClientRect()),dial=document.querySelector('.day2-running-dial,.day2-plain-dial'),metric=document.querySelector('.day2-result-metrics'),particles=document.querySelectorAll('.day2-particle').length,c=cta?.getBoundingClientRect();return{stage:'$name',viewport:[innerWidth,innerHeight],overflow:d.scrollWidth-d.clientWidth,documentHeight:d.scrollHeight,progressOverlap:progress.some((r,i)=>i&&r.left<progress[i-1].right),cta:c?{left:c.left,right:c.right,top:c.top,bottom:c.bottom,height:c.height,remaining:innerHeight-c.bottom}:null,dial:dial?{left:dial.getBoundingClientRect().left,right:dial.getBoundingClientRect().right}:null,metric:metric?{left:metric.getBoundingClientRect().left,right:metric.getBoundingClientRect().right}:null,particles,text:document.body.innerText}})())")
  Write-Output $metrics
}
function Navigate($width,$height) {
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $width; height = $height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5174/artifacts/day2-full-flow-22.6/capture.html' } | Out-Null
  Start-Sleep -Milliseconds 650
}
function Run-Flow($width,$height,$detailed) {
  Navigate $width $height
  Click '.home-screen .primary-button'
  if ($detailed) { Capture($(if($width -eq 360){'01-intro-ready-360x800'}else{'intro-ready-412x786'})) }
  else { Capture "responsive-$width-intro" }
  Click '.day2-ready-action .primary-button'
  if ($detailed) { Capture($(if($width -eq 360){'02-plain-running-1of4-360x800'}else{'plain-running-1of4-412x786'})) }
  else { Capture "responsive-$width-plain-running" }
  Click '.day2-running-action .now-button'
  if ($detailed) { Capture($(if($width -eq 360){'03-plain-result-1of4-360x800'}else{'trial-result-1of4-412x786'})) }
  else { Capture "responsive-$width-result" }
  Click '.day2-result-action .primary-button'
  if ($detailed) { Capture($(if($width -eq 360){'04-distracted-running-2of4-360x800'}else{'distracted-running-2of4-412x786'})) }
  else { Capture "responsive-$width-distracted-running" }
  Click '.day2-running-action .now-button'
  if ($detailed -and $width -eq 360) { Capture '05-distracted-result-2of4-360x800' }
  Click '.day2-result-action .primary-button'
  if ($detailed -and $width -eq 360) { Capture '06-plain-running-3of4-360x800' }
  Click '.day2-running-action .now-button'
  if ($detailed -and $width -eq 360) { Capture '07-plain-result-3of4-360x800' }
  Click '.day2-result-action .primary-button'
  if ($detailed -and $width -eq 360) { Capture '08-distracted-running-4of4-360x800' }
  Click '.day2-running-action .now-button'; Click '.day2-result-action .primary-button'; Click '.summary-screen .bottom-action .primary-button'; Start-Sleep -Milliseconds 350
  if ($detailed) {
    Capture($(if($width -eq 360){'09-analysis-top-360x800'}else{'analysis-top-412x786'}))
    Eval('scrollTo(0,document.documentElement.scrollHeight)') | Out-Null; Start-Sleep -Milliseconds 150
    if ($width -eq 360) { Capture '10-analysis-bottom-360x800' }
    Eval('scrollTo(0,0)') | Out-Null
    $layout = Send-Cdp 'Page.getLayoutMetrics' @{}; $fullHeight = [Math]::Ceiling($layout.result.cssContentSize.height)
    $full = Send-Cdp 'Page.captureScreenshot' @{ format='png'; fromSurface=$true; captureBeyondViewport=$true; clip=@{x=0;y=0;width=$width;height=$fullHeight;scale=1} }
    [IO.File]::WriteAllBytes("C:\Users\user\Downloads\day2-full-flow-22.6\analysis-full-$($width)x$($height).png",[Convert]::FromBase64String($full.result.data))
  } else { Capture "responsive-analysis-$($width)x$($height)" }
}
New-Item -ItemType Directory -Force 'C:\Users\user\Downloads\day2-full-flow-22.6' | Out-Null
Send-Cdp 'Page.enable' @{} | Out-Null
Run-Flow 360 800 $true
Run-Flow 412 786 $true
foreach($size in @(@{w=320;h=800},@{w=390;h=844},@{w=430;h=932})) { Run-Flow $size.w $size.h $false }
$socket.Dispose()
