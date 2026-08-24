$ErrorActionPreference = 'Stop'
$target = (Invoke-RestMethod 'http://127.0.0.1:9333/json/list')[0]
$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
$script:id = 0
$output = 'C:\Users\jinsung\Downloads\final-27.1'
New-Item -ItemType Directory -Force $output | Out-Null

function Send-Cdp($method, $params) {
  $script:id++
  $requestId = $script:id
  $json = @{ id = $requestId; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $socket.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  while ($true) {
    $stream = [IO.MemoryStream]::new()
    do {
      $buffer = New-Object byte[] 1048576
      $result = $socket.ReceiveAsync([ArraySegment[byte]]$buffer, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
      $stream.Write($buffer, 0, $result.Count)
    } while (-not $result.EndOfMessage)
    $response = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
    if ($response.id -eq $requestId) { return $response }
  }
}

function Evaluate($expression) { (Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }).result.result.value }
function ClickText($text) { Evaluate "document.querySelector('.app-shell .primary-button').click()" | Out-Null; Start-Sleep -Milliseconds 180 }
function Set-Viewport($width,$height) { Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width=$width; height=$height; deviceScaleFactor=1; mobile=$true } | Out-Null; Start-Sleep -Milliseconds 120 }
function Shot($name,$full=$false) { Evaluate "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(e=>e.style.display='none')" | Out-Null; $params=@{format='png';fromSurface=$true};if($full){$params.captureBeyondViewport=$true};$shot=Send-Cdp 'Page.captureScreenshot' $params;[IO.File]::WriteAllBytes((Join-Path $output "$name.png"),[Convert]::FromBase64String($shot.result.data)) }
function Navigate($url) { Send-Cdp 'Page.navigate' @{url=$url}|Out-Null;Start-Sleep -Milliseconds 900 }

Send-Cdp 'Page.enable' @{} | Out-Null
Navigate 'http://127.0.0.1:5174/artifacts/final-27.1/qa.html?path=focus'
Set-Viewport 360 800
ClickText '최종 분석 시작'; Shot 'focus-360-intro'
ClickText '마지막 보정 확인하기'; Shot 'focus-360-ready'
ClickText '측정 시작'; Start-Sleep -Milliseconds 100; Shot 'focus-360-running'
Evaluate "document.querySelector('[aria-label=focus-baseline-2-item-08]').click()"|Out-Null;Start-Sleep -Milliseconds 120;Shot 'focus-360-result'
ClickText '다음 측정';Start-Sleep -Milliseconds 1650
Evaluate "(()=>{const e=document.querySelector('.memory-stage'),r=e.getBoundingClientRect();[[.25,.25],[.5,.5],[.75,.7]].forEach(p=>e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width*p[0],clientY:r.top+r.height*p[1]})))})()"|Out-Null;Start-Sleep -Milliseconds 120
ClickText '결과 보기';ClickText '최종 결과 확인';Start-Sleep -Milliseconds 400
foreach($v in @(@(320,800),@(360,800),@(390,844),@(412,786),@(430,932))){Set-Viewport $v[0] $v[1];Evaluate 'scrollTo(0,0)'|Out-Null;Shot "focus-final-$($v[0])x$($v[1])-top"; $metrics=Evaluate "JSON.stringify((()=>{const d=document.documentElement,h=document.querySelector('.final-report-hero').getBoundingClientRect(),c=document.querySelector('.calibration-summary').getBoundingClientRect(),s=document.querySelector('.certification-hero').getBoundingClientRect(),a=document.querySelector('.ability-compact-summary').getBoundingClientRect(),share=document.querySelector('.analysis-actions .primary-button').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],clientWidth:d.clientWidth,scrollWidth:d.scrollWidth,overflow:d.scrollWidth-d.clientWidth,hero:{left:h.left,right:h.right,height:h.height},calibration:{left:c.left,right:c.right,top:c.top,bottom:c.bottom},certification:{left:s.left,right:s.right},abilities:{left:a.left,right:a.right},share:{top:share.top,bottom:share.bottom},documentHeight:d.scrollHeight}})())";Write-Output "focus-$($v[0])x$($v[1]): $metrics"}
Set-Viewport 360 800;Evaluate 'scrollTo(0,document.documentElement.scrollHeight*.48)'|Out-Null;Shot 'focus-360-middle';Evaluate 'scrollTo(0,document.documentElement.scrollHeight)'|Out-Null;Shot 'focus-360-bottom';Evaluate 'scrollTo(0,0)'|Out-Null;Shot 'focus-360-full' $true
Set-Viewport 412 786;Evaluate 'scrollTo(0,document.documentElement.scrollHeight)'|Out-Null;Shot 'focus-412-share'

Navigate 'http://127.0.0.1:5174/artifacts/final-27.1/qa.html?path=time'
Set-Viewport 360 800
ClickText '최종 분석 시작';ClickText '마지막 보정 확인하기';Shot 'time-360-ready';ClickText '측정 시작';Shot 'time-360-running'
foreach($i in 0..2){ClickText '지금!';if($i -lt 2){ClickText '다음 측정'}else{ClickText '결과 보기'}}
ClickText '최종 결과 확인';Start-Sleep -Milliseconds 350;Shot 'time-360-final-hero';$time=Evaluate "JSON.stringify({selected:document.querySelector('.calibration-summary>div>strong').textContent,summary:document.querySelector('.calibration-summary').innerText,hasFocus:document.querySelector('.calibration-summary').innerText.includes('집중'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth})";Write-Output "time-360x800: $time"
$socket.Dispose()
