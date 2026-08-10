# Codex Repository Instructions — 하찮력

## Product

앱인토스용 비게임 행동 검사 앱 `하찮력`이다. 서버 없는 정적 앱이며 사용자의 실제 행동 측정 결과를 로컬에 저장한다.

## Primary Role

Codex는 주로 다음을 담당한다.

- Claude Code가 만든 변경사항 리뷰
- 점수 계산 경계값 테스트
- TypeScript와 상태 흐름 오류 검출
- UI 간격·작은 화면·접근성 수정
- 회귀 테스트와 출시 전 감사

대규모 제품 방향 변경이나 기능 확장은 하지 않는다.

## Read First

작업 전 다음 파일을 읽는다.

- `HANDOFF.md`
- `templates/PROGRESS.md`
- `CLAUDE.md`
- `docs/PRODUCT_SPEC.md`
- `docs/SCREEN_SPEC.md`
- `docs/SCORING_SPEC.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/COPY_GUIDE.md`
- 해당 단계의 프롬프트 파일

## Review Severity

- `critical`: 실행 불가, 데이터 손실, 명백한 SDK 오용, 잘못된 측정
- `major`: 사용자 흐름 중단, 점수 오류, 모바일 잘림, 테스트 부재
- `minor`: 가독성, 중복, 명명, 경미한 접근성 문제

## Editing Rules

- 먼저 리뷰만 요청받았다면 코드를 수정하지 않는다.
- 지정된 파일 범위를 벗어나지 않는다.
- 점수 공식을 임의로 변경하지 않는다.
- 제품을 게임, 랭킹, 서버형 앱으로 확장하지 않는다.
- `any`, 무분별한 타입 단언, 숨겨진 전역 상태를 피한다.
- 새 의존성은 꼭 필요할 때만 추가한다.
- 공식 Apps in Toss MCP와 문서를 우선한다.

## Expected Commands

프로젝트 `package.json`에 존재하는 실제 명령을 먼저 확인한다. 일반적으로 다음을 실행한다.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

없는 명령을 있다고 가정하지 않는다. 필요하면 최소 수정으로 스크립트를 추가하고 이유를 보고한다.

## Definition of Done

- typecheck 성공
- lint 성공
- unit tests 성공
- production build 성공
- 변경사항과 회귀 위험 보고
- 360×800 수준 작은 화면의 레이아웃 검토
- 검사 중 백그라운드 이동, 빠른 연속 탭, 재시도 흐름 검토

## Handoff

- 단계 완료 후 `HANDOFF.md`와 `templates/PROGRESS.md`를 갱신한다.
- 다른 AI 도구가 이어서 작업할 수 있도록 결정사항을 세션 안에만 남기지 않는다.
