$ErrorActionPreference = 'Stop'
$target = Invoke-RestMethod -Method Put 'http://127.0.0.1:9333/json/new?http://127.0.0.1:5174/artifacts/day5-fast-reconstruction-25.0/capture.html'
$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
$script:id = 0
function Send-Cdp($method,$params){
  $script:id++;$requestId=$script:id
  $json=@{id=$requestId;method=$method;params=$params}|ConvertTo-Json -Depth 8 -Compress
  $bytes=[Text.Encoding]::UTF8.GetBytes($json)
  $socket.SendAsync([ArraySegment[byte]]$bytes,[System.Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
  while($true){$stream=[IO.MemoryStream]::new();do{$buffer=New-Object byte[] 1048576;$result=$socket.ReceiveAsync([ArraySegment[byte]]$buffer,[Threading.CancellationToken]::None).GetAwaiter().GetResult();$stream.Write($buffer,0,$result.Count)}while(-not $result.EndOfMessage);$response=[Text.Encoding]::UTF8.GetString($stream.ToArray())|ConvertFrom-Json;if($response.id -eq $requestId){return $response}}
}
function Eval($expression){$response=Send-Cdp 'Runtime.evaluate' @{expression=$expression;returnByValue=$true};return $response.result.result.value}
function Click($selector){Eval("document.querySelector('$selector').click()")|Out-Null;Start-Sleep -Milliseconds 180;Eval('scrollTo(0,0)')|Out-Null}
function Capture($name){
  Eval("document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(e=>e.style.display='none')")|Out-Null
  $shot=Send-Cdp 'Page.captureScreenshot' @{format='png';fromSurface=$true;captureBeyondViewport=$false}
  [IO.File]::WriteAllBytes("C:\Users\user\Downloads\day5-fast-reconstruction-25.0\$name.png",[Convert]::FromBase64String($shot.result.data))
  $metrics=Eval("JSON.stringify((()=>{const d=document.documentElement,cta=document.querySelector('.primary-button')?.getBoundingClientRect(),rail=document.querySelector('.day5-control-rail')?.getBoundingClientRect(),marker=document.querySelector('.control-marker')?.getBoundingClientRect(),target=document.querySelector('.control-target')?.getBoundingClientRect();return{stage:'$name',viewport:[innerWidth,innerHeight],documentHeight:d.scrollHeight,scrollWidth:d.scrollWidth,clientWidth:d.clientWidth,overflow:d.scrollWidth-d.clientWidth,cta:cta?{top:cta.top,bottom:cta.bottom,remaining:innerHeight-cta.bottom,visible:cta.top>=0&&cta.bottom<=innerHeight}:null,rail:rail?{left:rail.left,right:rail.right,top:rail.top,bottom:rail.bottom,visible:rail.top>=0&&rail.bottom<=innerHeight}:null,marker:marker?{left:marker.left,right:marker.right,visible:marker.left>=0&&marker.right<=innerWidth}:null,target:target?{left:target.left,right:target.right}:null,condition:document.querySelector('.day5-condition-card h2')?.textContent,proximity:!!document.querySelector('[class*=proximity],[class*=near-target]'),forbidden:/elapsed|countdown|speed|distance|남은 거리|현재 위치/.test(document.body.innerText)}})())")
  Write-Output $metrics
}
function Navigate($width,$height){Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$width;height=$height;deviceScaleFactor=1;mobile=$true}|Out-Null;Send-Cdp 'Page.navigate' @{url='http://127.0.0.1:5174/artifacts/day5-fast-reconstruction-25.0/capture.html'}|Out-Null;Start-Sleep -Milliseconds 700}
function Run-Flow($width,$height,$detailed){
  Navigate $width $height;Click '.home-screen .primary-button';Click '.daily-intro-screen .primary-button'
  Capture $(if($detailed){"01-ready-$($width)x$($height)"}else{"responsive-$width-ready"})
  Click '.day5-ready-action .primary-button';Start-Sleep -Milliseconds 420
  Capture $(if($detailed){"02-predictable-running-$($width)x$($height)"}else{"responsive-$width-running"})
  Click '.day5-running-action .primary-button';Capture $(if($detailed){"03-predictable-result-$($width)x$($height)"}else{"responsive-$width-result"})
  Click '.day5-result-action .primary-button';Start-Sleep -Milliseconds 850
  if($detailed){Capture "04-surprise-before-transition-$($width)x$($height)"}
  Start-Sleep -Milliseconds 520
  if($detailed){Capture "05-surprise-after-transition-$($width)x$($height)"}
  Click '.day5-running-action .primary-button';if($detailed){Capture "06-surprise-result-$($width)x$($height)"}
  Click '.day5-result-action .primary-button';Start-Sleep -Milliseconds 650;Click '.day5-running-action .primary-button';Click '.day5-result-action .primary-button';Start-Sleep -Milliseconds 1150;Click '.day5-running-action .primary-button';Click '.day5-result-action .primary-button';Click '.summary-screen .primary-button';Start-Sleep -Milliseconds 300
  Capture "07-analysis-top-$($width)x$($height)"
  if($detailed){Eval('scrollTo(0,document.documentElement.scrollHeight)')|Out-Null;Start-Sleep -Milliseconds 150;Capture "08-analysis-bottom-$($width)x$($height)";Eval('scrollTo(0,0)')|Out-Null;$layout=Send-Cdp 'Page.getLayoutMetrics' @{};$fullHeight=[Math]::Ceiling($layout.result.cssContentSize.height);$full=Send-Cdp 'Page.captureScreenshot' @{format='png';fromSurface=$true;captureBeyondViewport=$true;clip=@{x=0;y=0;width=$width;height=$fullHeight;scale=1}};[IO.File]::WriteAllBytes("C:\Users\user\Downloads\day5-fast-reconstruction-25.0\analysis-full-$($width)x$($height).png",[Convert]::FromBase64String($full.result.data))}
}
New-Item -ItemType Directory -Force 'C:\Users\user\Downloads\day5-fast-reconstruction-25.0'|Out-Null
Send-Cdp 'Page.enable' @{}|Out-Null
Run-Flow 360 800 $true;Run-Flow 412 786 $true
foreach($size in @(@{w=320;h=800},@{w=390;h=844},@{w=430;h=932})){Run-Flow $size.w $size.h $false}
$socket.Dispose()
