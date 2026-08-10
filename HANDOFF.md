# Hachannyeok Project Handoff

이 문서는 Codex와 Claude Code가 공통으로 읽는 현재 프로젝트 상태의 단일 인수인계 문서다. 도구와 관계없이 새 작업의 첫 진입점으로 사용한다.

## 1. Current Phase

- 현재 완료 단계: 2.5단계 — 7일 누적 분석 제품 재설계
- 다음 단계: 3단계 — 공통 측정·저장·세션 계약 구현
- 2단계 Codex 최종 검수: Critical 0건 / Major 0건 / Minor 문서 불일치 정리 완료
- 2.5단계 결과: 7일 누적 분석 구조를 제품·화면·저장·점수·카피 문서에 확정, 기능 코드는 미구현

## 2. Product Direction

- Apps in Toss용 비게임 행동 기반 검사 앱
- 서버 없음, DB 없음, 로그인 없음, 랭킹 없음
- 1일차 종합검사
- 2~6일 추가 분석
- 7일 최종 분석
- 재방문 보상은 포인트가 아니라 자기 발견
- 포인트, 코인 및 게임화 금지

7일 누적 분석은 현재 확정된 제품 방향이며 상세 명세 반영을 완료했다. DAY는 연속 달력 출석이 아니라 서로 다른 로컬 날짜에 완료한 분석일 순서다. 놓친 날의 손실은 없고 같은 날짜에 여러 분석일을 몰아서 완료할 수 없다.

## 3. Technical Baseline

- Apps in Toss SDK 3.x
- `@apps-in-toss/web-framework` 3.0.2
- 설정 파일: `apps-in-toss.config.ts`
- React 18.3.1
- React DOM 18.3.1
- TypeScript strict mode
- Vite 8.2.0
- `@vitejs/plugin-react` 6.0.5
- ESLint 10.8.0
- Vitest 4.1.10
- jsdom 29.1.1
- Apps in Toss devtools unplugin 적용
- TDS 미설치
- 상태관리 라이브러리 없음
- 라우팅 라이브러리 없음

## 4. Known Special Installation Note

`@vitejs/plugin-react@6.0.5` 설치 시 optional peer resolution 문제 때문에 해당 설치 1회에만 `--legacy-peer-deps`를 사용했다.

- 지속 설정 없음
- `.npmrc` 없음
- `legacy-peer-deps` global/local config: `false`
- `@rolldown/plugin-babel` 미설치
- `babel-plugin-react-compiler` 미설치

향후 의존성을 재설치하거나 업데이트할 때 이 peer resolution 문제를 다시 확인한다.

## 5. Validation Commands

현재 다음 명령이 모두 통과한다.

```bash
npm run typecheck
npm run lint
npm run test
npm run build:web
npm run build:ait
npm run build
```

## 6. Current Source State

현재 `src`에는 최소 React 기반만 존재한다.

- `main.tsx`
- `App.tsx` placeholder
- `App.test.tsx` smoke test
- 실제 홈 UI 없음
- 검사 구현 없음
- 점수 엔진 없음
- 저장 구현 없음
- 공유 구현 없음
- 7일 누적 분석 구현 없음

## 7. Files To Read Before Any Work

모든 AI 에이전트는 작업 전에 다음을 순서대로 읽는다.

1. `HANDOFF.md`
2. `AGENTS.md` 또는 `CLAUDE.md`
3. `templates/PROGRESS.md`
4. 작업과 관련된 `docs/*`
5. 현재 `git diff`와 `git status`

도구가 Codex인지 Claude Code인지와 관계없이 `HANDOFF.md`가 현재 상태의 첫 진입점이다.

## 8. Rules For Tool Switching

- 특정 AI 세션의 이전 대화에 의존하지 않는다.
- 모든 결정은 저장소 문서에 남긴다.
- 단계 종료 시 `HANDOFF.md`와 `templates/PROGRESS.md`를 갱신한다.
- 새 도구 또는 새 세션은 반드시 `HANDOFF.md`부터 읽는다.
- 미커밋 변경이 있으면 작업 전 `git diff`를 읽는다.
- 이전 AI의 설명보다 실제 저장소와 테스트 결과를 우선한다.
- 문서와 코드가 충돌하면 먼저 보고하고 임의로 수정하지 않는다.

## 9. Git State

현재 working tree에는 2단계 기반 변경과 2.5단계 문서 변경이 함께 존재한다. 3단계 전에 검토 후 커밋해 clean 상태로 만든다.

2단계 예정 커밋 메시지:

```text
chore: establish React and quality pipeline
```

2.5단계 문서를 별도 커밋한다면 권장 메시지는 `docs: define seven-day cumulative analysis`다.

## 10. Next Step

3단계에서는 다음 공통 계약을 코드와 단위 테스트로 먼저 고정한다.

- 공통 능력·특성·원시 측정 타입
- DAY 1 baseline과 daily 증분 측정 레코드
- STATE A~F 파생과 세션 전환
- 로컬 날짜 키와 하루 중복 방지
- Apps in Toss Storage 어댑터와 `schemaVersion` 마이그레이션 골격
- 저장 실패·중단·재개·중복 제출 계약
- 모바일 좌표 정규화와 백그라운드 무효화 계약

기능 화면과 개별 검사 구현을 앞당기지 않는다. 현재 기능 코드는 여전히 미구현 상태다.

기존 번호형 구현 프롬프트는 2.5단계 이전 구조에서 작성됐다. 이후 단계에서 사용할 때는 현재 `docs/*`와 이 문서를 우선하고, 충돌하는 프롬프트는 해당 단계 착수 전에 새 7일 구조에 맞게 검토·갱신한다.
