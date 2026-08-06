# 앱인토스 AI 개발 환경 설치 예시
# 실행 전 공식 문서에서 최신 명령인지 다시 확인하세요.

irm https://claude.ai/install.ps1 | iex
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add toss https://github.com/toss/scoop-bucket.git
scoop install ax

claude mcp add --transport stdio apps-in-toss ax mcp start
codex mcp add apps-in-toss -- ax mcp start

Write-Host "설치 후 claude --version, codex --version, ax --version을 확인하세요."
