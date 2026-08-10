# Hachannyeok Project Handoff

이 문서는 Codex와 Claude Code가 공통으로 읽는 현재 프로젝트 상태의 단일 인수인계 문서다. 새 작업은 이 문서부터 읽는다.

## 1. Current Phase

- 현재 단계: **2.5E — 수학/판정 계약 완료, 독립 최종 검수 대기**
- 다음 단계: **2.5E 독립 최종 검수**
- 직전 독립 검수: Critical 0건 / Major 4건 / Minor 3건 / 결론 B
- 이번 2.5E에서 동일 raw evidence가 동일 Ability Score, DAY 7 target, Profile, Certification, Tendency와 Final Metric을 만들도록 마지막 수학/판정 빈칸을 문서 수준에서 폐쇄했으며 3단계 구현은 아직 시작하지 않음

## 2. Product Direction

- Apps in Toss용 비게임 행동 기반 검사 앱, 서버·DB·로그인·랭킹 없음
- DAY 1: 표준 조건 5개 능력 baseline, 제품 카피 `약 90초`, 내부 QA 90~120초
- DAY 2~6: 서로 다른 날짜에 10~20초 조건 변화 evidence 하나씩
- DAY 7: lowest-confidence ability 하나의 15~20초 적응형 최종 보정
- DAY는 연속 출석이 아닌 완료 분석일 순서이며 놓친 날 손실 없음
- DAY 7은 누적 데이터 기반 Cross Insight 최대 2개와 Stable/Condition-Sensitive/Positively Updated Ability 제공. eligible insight가 없으면 fallback 사용
- 포인트·코인·캐릭터 성장·출석 보상 금지

## 3. 2.5E에서 확정한 핵심 계약

- DAILY 결과: `새로운 측정 → 해석 → 기존 baseline과의 관계`; 점수·유형·자격은 threshold를 넘을 때만 변경
- 분석 단계: `기본 분석 완료`, `심화 분석 n/5`, `최종 분석 준비 완료`, `최종 분석 완료`; UI 퍼센트 없음
- 저장 source of truth: raw evidence + `activeBaselineSession` + 최소 metadata
- 저장하지 않음: userState, scores, traits, insights, certifications, profileType, analysisStage, finalReport
- session lifecycle: idle/inProgress/invalidated/computedPendingSave/saved
- LocalDateKey: local Y/M/D 직접 조립한 `YYYY-MM-DD`; 날짜 역행 해금 금지
- DAY 1 날짜 변경: 기존 checkpoint 폐기 후 새 session으로 전체 재시작
- STATE A~F는 raw record와 오늘 날짜에서 우선순위대로 파생; DAY 6 당일 D, 다음 유효 날짜 E
- scoring: Raw → Normalized → Ability → Meta/Derived Tendencies → Insights/Certifications/Profile
- 공유: 공식 share/entry/deep-link API 검증 전에는 제품 계약과 integration gate를 분리
- MVP 재검사: baseline overwrite 없음. 전체 데이터 초기화 후 STATE A만 지원
- 모든 raw trial은 millisecond timestamp, valid/invalid invariant, 명시적 InvalidReason을 공유
- DAY 1~7 trial 타입·target·minimum valid·condition requirement와 최대 시도 한도 확정
- normalized raw clamp 금지/derived clamp 허용, provisional Ability 공식과 DAILY ±8 cap 확정
- DAY 7 confidence는 `(evidenceCoverage, conditionCoverage, stabilityAvailable, stability)` 우선순위 비교이며 ability별 final assessment 고정
- profile switch margin 6, certification tier, predicate 기반 insight, Most Stable 후보 요건 확정
- 동일 recordId의 semantic equality/conflict와 finalAlreadyCompleted idempotency 확정
- 제품 타입은 SDK 타입과 직접 결합하지 않고 3단계에서 `StoragePort`/`SharePort` 경계 사용
- valid/invalid raw trial은 discriminated union이며 invalid observation sentinel을 금지
- DAY 7 expected minimum evidence는 time 5/center 5/balance 4/control 5/focus 4로 고정하고 stability unavailable을 별도 처리
- DAY 7 selected Ability 점수는 preFinal/final 80/20, preFinal 대비 ±6 cap으로만 변경
- profile family/variant와 switch margin, stage별 certification eligibility, Cross Insight 0~2/fallback을 결정적으로 고정
- 검사별 normalizer 함수와 provisional worst constants, arm별 final completion validator를 고정
- population standard deviation, clamp/round 공통 함수와 Ability별 최종 normalizer를 고정
- 공통 0..1 normalized trial error 기반 stability vector와 threshold를 고정
- Derived Tendency 5개, Most Condition-Sensitive, Cross Insight 5개 registry formula와 tie-break를 고정
- Profile을 raw record의 DAY 1 → sorted DAY 2~6 → DAY 7 replay로 파생하고 high/low component별 hysteresis를 고정
- target attempt 전 조기 완료 금지와 `CALIBRATION_VERSION = 1`을 고정

## 4. Technical Baseline

- `@apps-in-toss/web-framework` 3.0.2, React/React DOM 18.3.1
- TypeScript strict, Vite 8.2.0, ESLint 10.8.0, Vitest 4.1.10, jsdom 29.1.1
- TDS·상태관리·라우팅 라이브러리 미설치
- 설정 파일: `apps-in-toss.config.ts`

`@vitejs/plugin-react@6.0.5` 설치 때 optional peer 문제로 그 설치 1회에만 `--legacy-peer-deps`를 사용했다. 지속 설정과 `.npmrc`는 없다.

## 5. Current Source State

`src`에는 React placeholder와 smoke test만 있다. 홈 UI, 검사, 점수 엔진, Storage, 공유, 7일 누적 분석은 미구현이다. 2.5E에서는 기능·설정 코드를 수정하지 않았다.

## 6. Files To Read Before Work

1. `HANDOFF.md`
2. `AGENTS.md` 또는 `CLAUDE.md`
3. `templates/PROGRESS.md`, `templates/PROJECT_VARIABLES.md`
4. 관련 `docs/*`
5. 현재 `git status`, `git diff`, `git log -1 --oneline`

이전 AI 설명보다 실제 저장소와 검증 결과를 우선한다. 문서와 코드가 충돌하면 먼저 보고하고 임의로 범위를 넓히지 않는다.

## 7. Git State

- 2.5B 작업 시작 시 working tree: clean
- 작업 시작 시 최신 커밋: `d8f9cc9 11`
- 현재 2.5B, 2.5C, 2.5D 및 2.5E 문서 보강 변경은 미커밋
- 기능·설정 코드 변경 없음

## 8. Next — 2.5E 독립 최종 검수

다음 검수는 직전 Major 4건/Minor 3건의 해소와 population stddev, Ability normalizer, stability, tendency/condition/cross registry, Profile replay/hysteresis, completion validator 및 calibration registry의 결정성을 재확인한다. 통과 전 3단계 구현 완료라고 기록하지 않는다.

재검수 통과 후 3단계 구현 계약:

- raw trial discriminated union, 좌표·millisecond 시간 validation, target/minimum valid/attempt limit
- persisted root runtime schema와 schemaVersion migration
- raw records 기반 Ability/Traits/Insights/Profile/AnalysisStage 파생 함수
- STATE A~F 파생, LocalDateKey 동일·진행·역행 및 날짜 경계 처리
- AssessmentSessionState 전환과 DAY 1 checkpoint
- sessionId/recordId 기반 idempotent save와 duplicate prevention
- provisional scoring/calibration, DAILY influence guardrail과 deterministic DAY 7 lowest-confidence selection
- Apps in Toss 공식 Storage/share/entry/deep-link 지원 검증

초기 구현 상수는 `CALIBRATION_VERSION = 1`로 문서에 모두 고정했다. 출시 전 파일럿에서는 version 증가와 함께 검사별 normalizer/worst range, composer weight, stability/tendency/condition threshold와 provisional cap/margin/tier 값을 보정한다. 구조/invariant 변경은 별도 schema/product contract 변경이다.
