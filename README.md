# 하찮력 AI 개발 키트

Claude Code를 **주 구현자**, Codex를 **리뷰·테스트·UI 정밀수정 담당**으로 사용해 앱인토스용 정적 비게임 검사 앱 `하찮력`을 순서대로 구현하기 위한 파일 모음입니다.

## 권장 사용 순서

1. 앱인토스 콘솔에서 `appName`을 먼저 확정합니다.
2. 공식 명령으로 React + TypeScript + TDS 프로젝트를 생성합니다.
3. 이 압축파일의 내용 전체를 프로젝트 루트에 복사합니다.
4. `templates/PROJECT_VARIABLES.md`의 값을 실제 프로젝트 정보로 바꿉니다.
5. `prompts/claude/00_project_audit.md`부터 번호 순서대로 Claude Code에 입력합니다.
6. 각 구현 단계가 끝날 때 해당 번호의 Codex 리뷰 프롬프트를 실행합니다.
7. 한 단계가 빌드·테스트를 모두 통과한 뒤에만 다음 단계로 이동합니다.

## 공식 앱인토스 AI 개발 설정

Windows PowerShell 기준:

```powershell
# Claude Code 설치
irm https://claude.ai/install.ps1 | iex

# Codex 설치
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"

# Scoop 및 앱인토스 ax 설치
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add toss https://github.com/toss/scoop-bucket.git
scoop install ax

# 앱인토스 MCP 연결
claude mcp add --transport stdio apps-in-toss ax mcp start
codex mcp add apps-in-toss -- ax mcp start
```

앱인토스 콘솔 MCP는 현재 Claude에서 연결할 수 있습니다.

```powershell
claude mcp add --transport http apps-in-toss-console `
  https://mcp.toss.im/adapters/apps-in-toss-console/mcp `
  --client-id mcp-gateway
```

## 프로젝트 생성 예시

```powershell
npx create-ait-app <APP_NAME>
```

권장 선택:

- 패키지 매니저: npm
- 템플릿: react-ts
- TDS: 사용
- AI skills: Claude Code, Codex 모두 추가
- 결제·광고 예제: 선택하지 않음

## 역할 분담

### Claude Code

- 프로젝트 구조와 상태 흐름 설계
- 검사 기능 구현
- 결과 엔진 구현
- 화면 연결과 로컬 저장
- 앱인토스 SDK 연결

### Codex

- 단계별 코드 리뷰
- 타입·테스트·경계값 검증
- 작은 화면 UI 정밀수정
- 접근성·회귀·빌드 점검
- 출시 전 최종 감사

## 필수 원칙

- 서버, Supabase, 로그인, 랭킹, 결제, 광고를 추가하지 않습니다.
- 앱은 게임이 아니라 순차형 행동 검사 앱입니다.
- 실제 전국 순위나 가짜 통계를 표시하지 않습니다.
- 점수와 결과는 실제 측정값에 근거합니다.
- 한 번에 하나의 구현 단계만 진행합니다.
- 매 단계 종료 후 반드시 typecheck, lint, test, build를 실행합니다.
- 같은 파일을 Claude Code와 Codex가 동시에 수정하지 않습니다.

## 파일 구성

- `CLAUDE.md`: Claude Code 상시 메모리
- `AGENTS.md`: Codex 상시 지침
- `docs/`: 제품·화면·점수·디자인·카피·저장·QA 명세
- `prompts/claude/`: 순차 구현 프롬프트
- `prompts/codex/`: 단계별 리뷰 및 수정 프롬프트
- `prompts/shared/`: 공통 프롬프트와 작업 종료 프롬프트
- `checklists/`: 수동 QA 및 출시 전 체크리스트
- `templates/`: 환경 변수와 진행상태 템플릿

## 공식 참고 문서

- https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html
- https://developers-apps-in-toss.toss.im/checklist/app-nongame.html
- https://developers-apps-in-toss.toss.im/development/deploy.html
- https://developers-apps-in-toss.toss.im/prepare/console-mcp.html
