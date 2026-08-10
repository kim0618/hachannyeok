# Hachannyeok Project Handoff

이 문서는 Codex와 Claude Code가 공통으로 읽는 현재 프로젝트 상태의 단일 인수인계 문서다. 새 작업은 이 문서부터 읽는다.

## 1. Current Phase

- 현재 단계: **10단계 — DAY 1 시각 집중 검사 구현 완료, 코드 리뷰 대기**
- 다음 단계: **10단계 독립 코드 리뷰**
- `src/domain`에 문서의 calibration, math, raw union/runtime validation, completion, LocalDateKey/STATE, session/checkpoint, persisted schema/migration/idempotency/StoragePort 및 scoring engine 타입 경계를 구현함
- Calibration/math/normalizer부터 baseline·daily·final score, stability, tendency, DAY 7 selector, profile, certification, final metric, Cross Insight, raw replay `deriveAnalysis`까지 구현함
- 최초 사용자 홈/검사 안내와 DAY 1의 Time → Center → Balance → Control → Focus 행동 검사를 구현함. 실제 DAY 1 결과 orchestration, 한국어 결과 content table, Apps in Toss Storage adapter는 아직 구현하지 않음

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

## 12. 6단계 DAY 1 시간 감각 검사 구현 결과

- 준비 화면의 CTA를 `TimeAssessmentScreen`으로 연결하고 READY → RUNNING → TRIAL RESULT → COMPLETE/INCOMPLETE 상태를 구현함
- elapsed 측정과 raw trial의 `startedAtMs`/`completedAtMs`에는 monotonic `performance.now()` clock을 사용하고 테스트용 `MeasurementClock`을 주입 가능하게 함
- `TimeTrial` raw union, `toLocalDateKey`, `validateCompletion`을 재사용함. trial은 `crypto.randomUUID()`로 식별하며 session memory에만 유지함
- RUNNING 중 `visibilitychange` hidden을 `backgrounded`, 완료 입력 시 local date 변경을 `dateChanged` invalid trial로 기록하고 scoring용 valid 목록에서 제외함
- active ref를 첫 입력에서 동기적으로 비워 double tap/duplicate completion을 방지하고 StrictMode listener cleanup을 검증함
- target 3/minimum valid 2, 최대 6 attempts의 retry/assessmentIncomplete를 domain validator로 판정함
- 유효 측정값은 소수점 둘째 자리 초, 빠름/늦음 문구로 표시하고 완료 시 평균 기록·평균 절대 오차·가장 가까운 기록만 표시함. 전체 Ability Score는 노출하지 않음
- 완료 CTA는 다음 단계의 Center 검사 대신 `NextAssessmentPlaceholder`로 임시 연결함
- Apps in Toss Storage, `activeBaselineSession`, scoring 결과 persist는 DAY 1 전체 검사 연결 전까지 의도적으로 추가하지 않음
- fake clock, background/date invalidation, duplicate input, retry/completion/incomplete, invalid scoring 제외, StrictMode cleanup 테스트를 추가함
- 마지막 전체 검증: typecheck, lint, 13 files / 87 tests, build:web, build:ait, build 및 `git diff --check` 모두 통과

## 13. 6단계 독립 코드 리뷰 수정 및 종료

- 독립 코드 리뷰 결과 Critical 0건, Major 1건, Minor 1건을 확인함
- Time Assessment 첫 trial 시작 시 assessment-level `LocalDateKey`를 고정하고 assessment가 유지되는 동안 변경하지 않도록 보강함
- trial 사이 또는 RUNNING 중 날짜가 바뀌면 전체 Time Assessment 재시작 상태로 전환하여 서로 다른 날짜의 evidence 혼합을 차단함
- 자정 변경과 visibility hidden 경쟁에서도 active trial을 한 번만 확정하고 assessment-level 날짜 invalidation을 우선하도록 처리함
- 다시 시작할 때 trials, active trial, assessment 시작 날짜와 진행 상태를 모두 초기화함
- retry가 최대 6 attempts까지 가능하므로 summary의 `세 번 중 가장 가까운 기록`을 `가장 가까운 기록`으로 수정함
- cross-date valid evidence 혼합 금지, RUNNING 날짜 변경, visibility race, 전체 reset 및 UI 안내 회귀 테스트를 추가함
- 전체 typecheck, lint, 13 files / 94 tests, web/AIT/전체 build와 `git diff --check` 통과
- 6단계를 종료하고 7단계 DAY 1 중심 인지 검사 구현으로 진행 가능

## 14. 7단계 DAY 1 중심 인지 검사 구현 결과

- Time 완료 CTA를 Center Ready에 연결하고 READY → RUNNING → TRIAL RESULT → COMPLETE/INCOMPLETE 상태를 구현함
- `rectangle → wideRectangle → square` 고정 순서와 중앙 target `(0.5, 0.5)`를 사용하며, 추가 retry도 같은 순서를 결정적으로 순환함
- `getBoundingClientRect()` 기반 순수 coordinate helper로 pointer 좌표를 0..1 normalized coordinate로 변환하고 범위 밖 입력은 clamp 없이 `outOfBounds` invalid trial로 기록함
- Pointer Event와 synchronous active ref guard로 touch/mouse 단일 경계를 사용하고 한 trial의 중복 입력을 차단함
- `CenterTrial`, monotonic `performance.now()` timestamp와 domain completion validator를 재사용해 target 3/minimum valid 2/max 6을 적용함
- RUNNING 중 background는 `backgrounded`; RUNNING 또는 trial 사이 날짜 변경은 Center 전체 restart required로 처리해 날짜가 다른 evidence 혼합을 차단함
- 결과 상태에 선택점/실제 중심 marker와 normalized Euclidean 오차 안내를 표시하고, 완료 요약은 valid trial만 사용한 평균 중심 오차와 가장 정확한 도형을 표시함
- 자유 좌표 입력 영역에 접근성 label/description을 연결하고 marker는 텍스트 정보와 함께 제공함
- Center evidence는 Storage persistence 없이 React session memory에만 유지함
- 완료 CTA는 DAY 1 세 번째 Balance placeholder로 연결함. Balance/Control/Focus 실제 검사는 구현하지 않음
- 향후 DAY 1 전체 orchestration 단계에서 Time/Center/Balance/Control/Focus가 하나의 DAY 1 session date를 공유하도록 assessment-level date를 승격해야 함
- 전체 typecheck, lint, 16 files / 107 tests, build:web, build:ait, build 및 `git diff --check` 통과

## 15. 7단계 독립 코드 리뷰 수정 및 종료

- 독립 코드 리뷰 결과 Critical 0건, Major 2건, Minor 1건을 확인함
- `rectangle`, `wideRectangle`, `square`를 각각 4:3, 16:9, 1:1로 분리하고 RUNNING과 RESULT가 동일한 shape class mapping을 사용하도록 보강함
- DAY 1 Center raw trial의 target을 valid/invalid arm 모두 정확한 `(0.5, 0.5)` literal로 runtime 검증하도록 강화함
- 자유 좌표 입력 영역에 `aria-describedby`를 직접 연결해 실행 안내가 실제 interaction element에 연계되도록 수정함
- fixed target 거부 경계, UI 생성 target, RUNNING/RESULT shape class와 접근성 설명 연결 회귀 테스트를 추가함
- 전체 typecheck, lint, 16 files / 109 tests, build:web, build:ait, build 및 `git diff --check` 통과
- 7단계를 종료하고 8단계 DAY 1 균형 분배 검사 구현으로 진행 가능

## 16. 8단계 DAY 1 균형 분배 검사 구현 결과

- Center 완료 CTA를 Balance Ready에 연결하고 READY → RUNNING → TRIAL RESULT → COMPLETE/INCOMPLETE 상태를 구현함
- DAY 1 범위는 vertical/horizontal 2등분 각 1회로 제한하고 retry도 고정 순서로 순환함. 3등분은 구현하지 않음
- 고정 비중앙 초기값 vertical 0.32/horizontal 0.68과 bounding rect 기반 순수 coordinate→ratio helper를 추가함
- Pointer Events, pointer capture, drag 영역 `touch-action: none`, keyboard arrow fallback과 slider 접근성 정보를 적용함
- 확정 CTA 시점에만 raw `BalanceTwoWayTrial`을 생성하고 synchronous guard로 중복 확정을 막음
- `targetRatio === 0.5` runtime invariant를 회귀 테스트로 고정하고 domain completion validator의 target 2/minimum valid 2/max 5 및 orientation 구성을 재사용함
- RUNNING background invalidation, RUNNING/시도 사이 날짜 변경, visibility/date race와 전체 reset을 구현함
- 결과에는 사용자 선/정답 50% 점선을 색상 외 legend와 함께 표시하고, 완료 요약은 valid-only 평균 오차와 동률 vertical 우선 방향을 표시함
- Storage persistence는 연결하지 않았으며 완료 CTA는 Control placeholder로 연결함
- 전체 typecheck, lint, 19 files / 125 tests, build:web, build:ait, build 및 `git diff --check` 통과

## 17. 8단계 독립 코드 리뷰 수정 및 종료

- 독립 코드 리뷰 결과 Critical 0건, Major 3건, Minor 1건을 확인함
- 비정상 rect와 pointer 좌표를 ratio 계산 전에 검증하고 `invalidGeometry` failure를 반환해 NaN/Infinity 또는 0/1 정상 ratio 위조를 차단함
- geometry failure에서는 UI divider를 이동하지 않으며 정상 vertical/horizontal 좌표 변환과 zero/non-finite 경계를 회귀 테스트로 고정함
- retry로 같은 orientation의 valid evidence가 여러 개 생겨도 orientation별 전체 valid absolute error 평균을 비교하고 동률은 vertical 우선으로 결정함
- Balance 완료 후 `검사 4 / 5 · 손가락 통제` placeholder로 이동하도록 과거 Balance placeholder 문구를 수정함. Control 실제 검사는 구현하지 않음
- retry 진행 표시는 `2 / 2` 반복 대신 `추가 측정 n`으로 구분함
- keyboard ratio confirm, `targetRatio: 0.50001`, unknown orientation 거부와 Balance → Control placeholder 통합 회귀 테스트를 추가함
- 전체 typecheck, lint, 19 files / 135 tests, build:web, build:ait, build 및 `git diff --check` 통과
- 8단계를 종료하고 9단계 DAY 1 손가락 통제 검사 구현으로 진행 가능

## 18. 9단계 DAY 1 손가락 통제 검사 구현 결과

- Balance 완료 CTA를 Control Ready에 연결하고 READY → RUNNING → TRIAL RESULT → COMPLETE/INCOMPLETE 상태를 구현함
- 미정이었던 DAY 1 Control 계약을 `leftToRight`, start 0.08, end 0.92와 `(speed, target)` 3개 config `(0.32, 0.40)`, `(0.40, 0.58)`, `(0.48, 0.68)`로 확정하고 SCORING_SPEC에 기록함
- `speedNormalized`를 초당 normalized 이동 거리로 정의하고 monotonic clock 기반 순수 `positionAtElapsed`를 raw measurement source of truth로 사용함
- requestAnimationFrame은 marker 시각 갱신에만 사용하며 stop 시 마지막 React state가 아니라 clock의 현재 시각으로 observedPosition을 다시 계산함
- end 도달은 `insufficientObservation` invalid trial로 자동 종료하고 wrap/왕복/end valid 위조를 금지함
- stop/end/visibility/date 경쟁을 synchronous active ref guard로 한 번만 확정하며 RAF를 trial 종료, background, date invalidation, reset, unmount에서 정리함
- target 3/minimum valid 2/max 6과 retry config 순환을 domain completion validator로 적용하고 valid-only 평균 위치 오차/가장 정확했던 시도를 표시함
- RUNNING에는 위치·속도·진행률 퍼센트나 근접 피드백을 노출하지 않고 실제 button `멈춰!`와 비-live track 설명을 제공함
- Control evidence는 session memory only이며 Storage/score UI/surprise condition을 추가하지 않음
- 완료 CTA는 `검사 5 / 5 · 시각 집중` placeholder로 연결하고 Focus 실제 검사는 구현하지 않음
- 전체 typecheck, lint, 22 files / 152 tests, build:web, build:ait, build 및 `git diff --check` 통과

## 19. 9단계 독립 코드 리뷰 수정 및 종료

- 독립 코드 리뷰 결과 Critical 0건, Major 1건, Minor 0건을 확인함
- exact end time에서 stop이 RAF보다 먼저 실행되면 end position이 valid evidence로 저장되던 경계 오류를 수정함
- RAF과 STOP이 elapsed 기반 `hasReachedControlEnd` helper를 공통으로 사용해 floating point position 결과와 이벤트 순서에 따른 valid/invalid 불일치를 차단함
- 3개 config 각각의 exact end 전 0.001ms, exact end, exact end 후 0.001ms helper 및 stop-first 경계 회귀 테스트를 추가함
- 전체 typecheck, lint, 22 files / 167 tests, build:web, build:ait, build 및 `git diff --check`를 통과하고 9단계를 종료함
- 10단계 DAY 1 시각 집중 검사 구현으로 진행 가능

## 20. 10단계 DAY 1 시각 집중 검사 구현 결과

- Control 완료 CTA를 Focus Ready에 연결하고 READY → RUNNING → TRIAL RESULT → COMPLETE/INCOMPLETE 상태를 구현함
- DAY 1 Focus stimulus를 4×3 row-major grid, 12개 선택지, target 1개와 distractor 11개로 확정하고 SCORING_SPEC에 기록함
- `circle/square` target index 1, `triangle/circle` index 7, `diamond/triangle` index 10의 3개 config와 attempt 4~6 deterministic cycle을 구현함
- CSS/inline SVG의 동일 rendering component로 cue와 grid shape를 표시하고 target 전용 강조·animation·외부 asset을 사용하지 않음
- config helper에서 item 12개, unique ID, target ID 일치, target 1개, distractor 11개와 shape set runtime invariant를 검증함
- config render 뒤 double requestAnimationFrame을 통과한 monotonic `performance.now()` 시점부터 input을 활성화하며 stale activation과 활성화 전 tap을 차단함
- 첫 선택에서 synchronous active guard를 잠그고 선택 ID, correctness, raw unrounded reactionTimeMs를 `FocusTrial`로 생성함. 오답도 RT를 포함한 valid evidence로 보존함
- RUNNING/activation 중 background invalidation, RUNNING/시도 사이 날짜 변경 시 Focus assessment 전체 restart, visibility/date race와 RAF cleanup을 구현함
- target 3/minimum valid 2/max 6 completion/retry를 기존 domain validator로 판정하고 valid 시도 정답 수와 correct-only 평균 RT를 표시함. 정답 0개는 `정답 기록 없음`으로 구분함
- 52px 이상 동일 touch target, 정답을 노출하지 않는 `선택지 n` aria-label, 텍스트 정오답 결과와 focus-visible을 적용함
- Focus 완료 CTA를 `기본 분석 준비` placeholder에 연결함. Storage persistence와 실제 score/profile/certification 결과는 추가하지 않음
- 10단계 독립 코드 리뷰 대기
