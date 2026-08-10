# Hachannyeok Project Handoff

이 문서는 Codex와 Claude Code가 공통으로 읽는 현재 프로젝트 상태의 단일 인수인계 문서다. 새 작업은 이 문서부터 읽는다.

## 1. Current Phase

- 현재 단계: **5단계 — 홈/초기 사용자 흐름 구현 완료**
- 다음 단계: **6단계 — DAY 1 실제 행동 검사 UI/세션 구현**
- `src/domain`에 문서의 calibration, math, raw union/runtime validation, completion, LocalDateKey/STATE, session/checkpoint, persisted schema/migration/idempotency/StoragePort 및 scoring engine 타입 경계를 구현함
- Calibration/math/normalizer부터 baseline·daily·final score, stability, tendency, DAY 7 selector, profile, certification, final metric, Cross Insight, raw replay `deriveAnalysis`까지 구현함
- 최초 사용자 홈/검사 안내/첫 측정 준비 UI를 구현함. 실제 행동 검사, 한국어 결과 content table, Apps in Toss Storage adapter는 아직 구현하지 않음

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

- `src/domain/assessment`: DAY 1~7 raw trial/result union, runtime validator, assessment completion validator
- `src/domain/scoring`: calibration v1 registry, explicit-result math helpers, scoring engine input/output interface
- `src/domain/progression`: LocalDateKey 생성/검증과 raw persisted data 기반 STATE A~F 파생
- `src/domain/session`: lifecycle transition과 DAY 1 checkpoint/date-change discard helper
- `src/domain/storage`: persisted root/record 타입, runtime schema, migration skeleton, semantic idempotency, SDK 비결합 StoragePort
- domain 회귀 테스트 45개와 기존 React smoke test 1개가 통과함
- 홈/검사/결과 UI, 실제 점수 계산 및 profile/insight 콘텐츠 엔진, 실제 SDK adapter는 미구현

## 6. Files To Read Before Work

1. `HANDOFF.md`
2. `AGENTS.md` 또는 `CLAUDE.md`
3. `templates/PROGRESS.md`, `templates/PROJECT_VARIABLES.md`
4. 관련 `docs/*`
5. 현재 `git status`, `git diff`, `git log -1 --oneline`

이전 AI 설명보다 실제 저장소와 검증 결과를 우선한다. 문서와 코드가 충돌하면 먼저 보고하고 임의로 범위를 넓히지 않는다.

## 7. Git State

- 3단계 작업 시작 시 최신 커밋: `9836d21 검수`
- 3단계 domain 코드, 테스트, 이 HANDOFF와 `templates/PROGRESS.md` 변경은 미커밋
- 기존 dependency와 Apps in Toss 설정은 변경하지 않음

## 8. 3단계 리뷰 결과와 다음 작업

3단계 독립 코드 리뷰에서 Critical 0건, Major 4건, Minor 2건이 확인됐다. Final assessment arm literal mapping, unknown assessmentType 안전 거부, DAY 1 checkpoint 완료성, invalid Focus optional `correct` runtime 타입 검증을 모두 수정하고 회귀 테스트를 추가했다. finalFocus 고정 구성 테스트에서 발견된 focus composition bucket 오류도 함께 수정했다.

다음 단계는 문서의 결정적 replay 계약에 따른 4단계 점수/분석 엔진 구현이다.

이번 단계에서 의도적으로 남긴 항목:

- 실제 Ability/Profile/Insight/Certification 계산 엔진은 후속 scoring 구현 단계
- 실제 Apps in Toss Storage SDK adapter와 share/entry/deep-link 검증은 integration 단계
- Home/검사/결과 UI, 라우팅, TDS, 상태관리 연동은 UI 단계

`CALIBRATION_VERSION = 1` 수치는 문서 값을 그대로 사용했으며 새 외부 라이브러리는 추가하지 않았다.

남은 Minor TODO:

- persisted `ISODateTime` runtime 형식 검증 강화
- validated persisted data 전제를 벗어나는 consumer에서 `dailyRecords` 물리 배열 순서를 신뢰하지 않도록 `analysisDay` 정렬 명시

마지막 전체 검증: typecheck, lint, 9 files / 46 tests, build:web, build:ait, build 모두 통과했다.

## 9. 4단계 구현 결과

- `src/domain/scoring`에 provisional calibration v1, median/Euclidean helper, 6개 assessment normalizer를 구현
- DAY 1 baseline, DAY 2~6 equivalent와 baseline 대비 ±8 guardrail, DAY 7 final equivalent와 preFinal 대비 ±6 guardrail 구현
- normalized trial error stability, 고정 tendency registry/dominant selector, DAY 7 confidence tuple/target selector 구현
- raw record의 `analysisDay` 정렬 replay, profile hysteresis, certification tier, final metrics, Cross Insight 0~2개 및 `DerivedAnalysis` 구현
- 근거 부족은 0점 대신 `insufficientEvidence` explicit result로 반환
- 새 dependency, UI, Storage SDK, TDS/라우팅/상태관리 변경 없음
- scoring 포함 전체 회귀 테스트 71개 작성/통과

## 10. 4단계 독립 코드 리뷰 및 종료

- 독립 코드 리뷰 결과 Critical 0건, Major 2건, Minor 1건을 확인함
- Balance condition sensitivity를 DAY 1 two-way와 DAY 4 three-way mean error의 positive degradation 전용 계산으로 분리함. `multiPartitionBias`의 terminal segment bias는 condition sensitivity에 포함하지 않음
- mean은 max-absolute scaling과 incremental mean, median은 overflow-safe midpoint, populationStdDev는 scaling된 Welford 방식으로 보강함
- 극단 finite evidence는 throw하거나 0점으로 임의 변환하지 않고 normalizer/deriveAnalysis의 explicit result 계약으로 전달함
- Minor였던 DAY 7 condition coverage도 assessment 존재 여부 대신 실제 valid condition minimum을 검사하도록 수정함
- Balance metric 분리, finite overflow, deriveAnalysis throw 방지·결정성, condition coverage 회귀 테스트를 추가함
- 전체 typecheck, lint, 11 files / 71 tests, build:web, build:ait, build 및 `git diff --check` 통과
- 4단계를 종료하고 5단계 홈/초기 사용자 흐름 구현으로 진행 가능

## 11. 5단계 홈/초기 사용자 흐름 구현 결과

- 기존 `<div>하찮력</div>` placeholder를 최초 사용자용 홈 화면으로 교체함
- 홈 → 검사 안내 → 첫 번째 시간 감각 측정 준비까지 `AppScreen` local navigation state로 연결함
- navigation state는 향후 Storage에서 파생할 사용자 상태와 분리했으며, `EntryMode` 경계를 두되 실제 persisted Storage는 연결하지 않음
- `AppShell`, `PrimaryButton`, `InfoPill`, `AssessmentPreviewItem`과 화면 3개를 과도하지 않은 단위로 분리함
- 360×800 mobile-first, 최대 너비 480px, safe area, 하단 고정 Primary CTA, 340px 이하/낮은 화면 대응, 44px 이상 터치 영역과 focus-visible을 적용함
- DESIGN_SYSTEM의 Navy/Background/Surface/Accent/Border 색상을 사용함
- TDS는 현재 미설치 상태이며 새 패키지 승인 전 설치 금지 조건에 따라 React + CSS로 구현함. dependency 변경 없음
- 실제 timer, `performance.now()`, invalidation, scoring, result, storage, router는 구현하거나 import하지 않음
- Testing Library 진입 흐름 테스트 4개를 추가하고 공통 cleanup으로 테스트 DOM 격리를 보완함
- typecheck, lint, 11 files / 74 tests, web/AIT build 및 `git diff --check` 통과
