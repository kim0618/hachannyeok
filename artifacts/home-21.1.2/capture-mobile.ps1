$ErrorActionPreference = 'Stop'
$target = (Invoke-RestMethod 'http://127.0.0.1:9333/json/list')[0]
$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
$script:id = 0

function Send-Cdp($method, $params) {
  $script:id++
  $requestId = $script:id
  $json = @{ id = $requestId; method = $method; params = $params } | ConvertTo-Json -Depth 8 -Compress
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

Send-Cdp 'Page.enable' @{} | Out-Null
Send-Cdp 'Page.navigate' @{ url = 'http://127.0.0.1:5173/' } | Out-Null
Start-Sleep -Milliseconds 900

foreach ($viewport in @(@{ width = 360; height = 800 }, @{ width = 390; height = 844 }, @{ width = 412; height = 786 }, @{ width = 430; height = 932 }, @{ width = 1280; height = 1200 })) {
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Start-Sleep -Milliseconds 250
  Send-Cdp 'Runtime.evaluate' @{ expression = "document.querySelectorAll('.ait-panel-root,.ait-panel-toggle').forEach(element=>element.style.display='none')" } | Out-Null
  $shot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $true }
  $path = "C:\Users\jinsung\Downloads\home-21.1.2-$($viewport.width)-exact.png"
  [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($shot.result.data))
  $expression = "JSON.stringify((()=>{const d=document.documentElement,b=document.querySelector('.home-reference-cta').getBoundingClientRect(),h=document.querySelector('.home-reference-poster img').getBoundingClientRect(),s=document.querySelector('.home-reference-secondary').getBoundingClientRect();return{viewport:[innerWidth,innerHeight],scrollWidth:d.scrollWidth,documentHeight:d.scrollHeight,overflow:d.scrollWidth-innerWidth,cta:{x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom},secondary:{x:s.x,y:s.y,width:s.width,height:s.height,bottom:s.bottom},poster:{x:h.x,y:h.y,width:h.width,height:h.height,bottom:h.bottom}}})())"
  $metrics = Send-Cdp 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
  Write-Output "$($viewport.width): $($metrics.result.result.value)"
}
$socket.Dispose()
