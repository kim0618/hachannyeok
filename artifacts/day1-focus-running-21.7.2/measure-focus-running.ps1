$ErrorActionPreference = 'Stop'
$target = (Invoke-RestMethod 'http://127.0.0.1:9333/json/list').Where({ $_.type -eq 'page' }, 'First')[0]
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
foreach($viewport in @(@{width=320;height=800},@{width=360;height=800},@{width=390;height=844},@{width=412;height=786},@{width=430;height=932})){
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$viewport.width;height=$viewport.height;deviceScaleFactor=1;mobile=$true}|Out-Null;Start-Sleep -Milliseconds 180
  $expression = "JSON.stringify({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,documentHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight,itemCount:document.querySelectorAll('.focus-item').length,minWidth:Math.min.apply(null,Array.from(document.querySelectorAll('.focus-item'),function(e){return e.getBoundingClientRect().width})),minHeight:Math.min.apply(null,Array.from(document.querySelectorAll('.focus-item'),function(e){return e.getBoundingClientRect().height})),gridBottom:document.querySelector('.focus-grid').getBoundingClientRect().bottom,noteBottom:document.querySelector('.focus-running-note').getBoundingClientRect().bottom,statusBottom:document.querySelector('.focus-running-status').getBoundingClientRect().bottom,statusTag:document.querySelector('.focus-running-status').tagName,statusPointer:getComputedStyle(document.querySelector('.focus-running-status')).pointerEvents,decorPointer:getComputedStyle(document.querySelector('.focus-running-decoration')).pointerEvents,disabled:document.querySelectorAll('.focus-item:disabled').length,itemClassCount:new Set(Array.from(document.querySelectorAll('.focus-item'),function(e){return e.className})).size})"
  $response=Send-Cdp 'Runtime.evaluate' @{expression=$expression;returnByValue=$true}
  Write-Output "$($viewport.width): $($response.result.result.value)"
}
$socket.Dispose()
