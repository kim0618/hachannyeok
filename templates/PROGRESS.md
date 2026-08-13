# 진행 상태

## 현재 단계

- 단계 번호: 13.5
- 단계 이름: DAY 2 UX/측정 강도 보정
- 상태: 완료

## 완료

- 1단계: Apps in Toss SDK 3.x 및 `@apps-in-toss/web-framework@3.0.2` 고정
- 2단계: React 최소 기반과 typecheck/lint/test/build 파이프라인 구성
- 2.5단계: DAY 1 → DAY 2~6 → DAY 7 누적 분석 제품 구조 수립
- 2.5B: 독립 감사 Major 8건에 대한 문서 계약 보강
  - DAY 1 표준 baseline과 DAY 2~6 조건 변화 evidence 완전 분리
  - DAILY 완료 결과를 `새로운 측정 → 해석 → baseline 관계`로 고정
  - DAY 7을 lowest-confidence ability 1개의 적응형 최종 보정으로 확정
  - raw evidence + 최소 session state만 저장하도록 source of truth 재설계
  - session lifecycle, idempotency, LocalDateKey, STATE A~F 우선순위 확정
  - scoring 계층, raw trial/좌표/최소 유효 trial, daily guardrail 확정
  - 공식 API 확인을 integration gate로 둔 공유→신규 유입 계약 추가
  - 상태별 Primary/Secondary/Tertiary CTA 확정
  - 퍼센트 분석 진행 표시 제거, 진단 경계 문구와 전체 초기화 재검사 정책 확정
- 2.5C: 직전 독립 재검수 Major 4건/Minor 3건에 대한 문서 계약 보강
  - 당시 공통 trial/InvalidReason과 DAY 1~6 raw trial 필드 초안 확정
  - DAY 1~7 target/minimum valid/condition requirement/attempt limit 확정
  - raw input clamp 금지, normalized derived clamp 허용 정책 확정
  - provisional Ability 공식, DAILY ±8 cap, profile switch margin, certification tiers 확정
  - DAY 7 tuple selector와 ability별 discriminated final assessment 확정
  - Most Stable/Condition-Sensitive/Positively Updated 최소 근거·표시 조건 확정
  - payload semantic idempotency conflict와 StoragePort/SharePort integration boundary 확정
  - invalid trial retry, interrupted short assessment restart, full data reset 용어 분리
- 2.5D: 직전 독립 재검수 Major 6건/Minor 4건에 대한 문서 계약 보강
  - valid/invalid trial discriminated union과 partial invalid observation 계약
  - DAY 7 expected minimum denominator, binary condition coverage, stability group/unavailable 계약
  - DAY 7 selected Ability 80/20 score 반영 및 preFinal 대비 ±6 cap
  - deterministic profile family/variant와 family switch margin 의사 코드
  - stage별 certification eligibility와 engine tier/content name 분리
  - Cross Insight 0~2개와 근거 없음 fallback
  - 검사별 normalizer 함수와 provisional calibration worst 초기값
  - final assessment arm별 runtime completion validator 및 time literal invariant
- 2.5E: 직전 독립 검수 Major 4건/Minor 3건에 대한 문서 계약 보강
  - population standard deviation과 공통 clamp/round 함수
  - Time/Center/Balance/Control 75/25 및 Focus 80/20 예외 normalizer
  - 공통 0..1 normalized trial error와 Ability별 stability vector
  - Derived Tendency 5개와 Most Condition-Sensitive 공통 척도
  - Cross Insight 5개 formula와 deterministic selection
  - Profile raw replay 순서와 high/low component별 hysteresis
  - target attempt 전 조기 완료 금지, calibration registry version 1
- 3단계: 공통 domain 계약 구현
  - calibration v1 registry와 finite input을 강제하는 mean/populationStdDev/clamp01/roundScore
  - DAY 1~7 valid/invalid raw trial 및 assessment result discriminated union
  - 좌표, millisecond, literal/condition, timestamp, spatial count runtime validation
  - target/minimum valid/condition/고정 구성/max attempt completion validator
  - LocalDateKey, STATE A~F, session lifecycle, DAY 1 checkpoint 폐기 helper
  - persisted root runtime schema, current-version migration skeleton
  - stable identity, semantic equality, duplicate/final save decision과 StoragePort
  - 핵심 domain helper 및 회귀 테스트 46개 작성
  - 독립 코드 리뷰 Critical 0건 / Major 4건 / Minor 2건
  - Major 4건 수정 완료: final arm literal, unknown assessmentType 안전 거부, DAY 1 checkpoint 완료성, invalid Focus `correct` 타입
  - finalFocus 고정 구성의 composition bucket 회귀 수정
- 4단계: 점수/분석 엔진 구현
  - Calibration v1 registry와 median/Euclidean math helper
  - Time/Center/Balance/Control/Focus/Spatial Memory normalizer 및 explicit insufficient evidence
  - DAY 1 baseline, DAY 2~6 equivalent/±8 guardrail, DAY 7 equivalent/±6 guardrail
  - stability, 5개 tendency registry/dominant selector, DAY 7 confidence/target selector
  - profile family/variant hysteresis replay, certification, final metrics, Cross Insight 0~2개
  - persisted raw record 기반 `deriveAnalysis`와 UI 비결합 `DerivedAnalysis` 타입
  - scoring 회귀 포함 10 files / 64 tests 통과
  - 독립 코드 리뷰 Critical 0건 / Major 2건 / Minor 1건
  - Balance condition sensitivity를 multiPartitionBias와 분리하여 positive three-way degradation만 반영
  - overflow-safe mean/median/populationStdDev와 explicit calculation failure propagation 적용
  - DAY 7 condition coverage를 실제 valid condition minimum 검사로 보완
  - 직접 회귀 테스트 보강 후 11 files / 71 tests 및 전체 빌드 통과
- 5단계: 홈/초기 사용자 흐름 구현
  - 최초 사용자 홈, 5개 검사 안내, 첫 시간 감각 측정 준비 화면 구현
  - local `AppScreen` 상태로 홈 → 안내 → 준비 및 안내 → 홈 전환 연결
  - 공통 AppShell/PrimaryButton/InfoPill/AssessmentPreviewItem 분리
  - 360×800 mobile-first, safe area, 고정 CTA, 작은 화면과 focus-visible 대응
  - TDS 미설치 및 신규 설치 승인 필요에 따라 dependency 추가 없이 React + CSS 사용
  - 실제 timer/scoring/storage/router 없이 UI navigation state만 구현
  - Testing Library 진입 흐름 4개 및 테스트 cleanup 추가
  - 11 files / 74 tests와 전체 web/AIT build 통과
- 6단계: DAY 1 시간 감각 검사 구현
  - 준비 화면 → 시간 감각 READY → RUNNING → 결과 → 완료/미완료 흐름 연결
  - `performance.now()` 기반 monotonic 측정 clock과 fake clock 주입 경계
  - Raw `TimeTrial`, `toLocalDateKey`, domain completion validator 재사용
  - visibility hidden의 `backgrounded`, local date 변경의 `dateChanged` invalidation
  - 동기 active guard로 duplicate input 방지, StrictMode listener cleanup
  - target 3/minimum valid 2, 최대 6 attempts retry와 assessmentIncomplete
  - 유효 trial만 사용한 평균 기록·평균 절대 오차·closest 중간 결과
  - persistence 없이 React session memory만 사용, 다음 Center는 placeholder 연결
  - 독립 코드 리뷰 Critical 0건 / Major 1건 / Minor 1건
  - assessment-level LocalDateKey 고정과 날짜 변경 시 전체 Time Assessment 재시작 적용
  - trial 사이·RUNNING·visibility race에서 cross-date evidence 혼합 및 duplicate append 차단
  - 전체 reset과 retry-safe closest summary 문구 수정
  - 날짜 경계/UI 회귀 보강 후 13 files / 94 tests 및 전체 빌드 통과
- 7단계: DAY 1 중심 인지 검사 구현
  - Center READY/RUNNING/TRIAL RESULT/COMPLETE/INCOMPLETE 흐름과 Time 완료 연결
  - rectangle/wideRectangle/square 3개 도형의 결정적 고정 순서
  - bounding rect 기반 0..1 normalized coordinate helper와 clamp 없는 outOfBounds invalidation
  - Pointer Event 및 synchronous ref guard를 통한 중복 입력 방지
  - background/date invalidation과 Center assessment 전체 날짜 재시작
  - target 3/minimum valid 2/max 6 completion validator 재사용
  - valid-only 평균 중심 오차/가장 정확한 도형 summary 및 marker 접근성 보완
  - Center evidence session-memory only, Balance placeholder 연결
  - 향후 DAY 1 전체 orchestration에서 5개 assessment의 shared session date로 승격 예정
  - 독립 코드 리뷰 Critical 0건 / Major 2건 / Minor 1건
  - rectangle/wideRectangle/square geometry를 4:3/16:9/1:1로 분리하고 RUNNING/RESULT mapping 일치
  - valid/invalid Center target `(0.5, 0.5)` runtime literal invariant 강화
  - 좌표 입력 영역의 `aria-describedby` 직접 연결 및 관련 회귀 테스트 추가
  - 수정 후 16 files / 109 tests 및 전체 빌드 통과
- 8단계: DAY 1 균형 분배 검사 구현
  - Balance READY/RUNNING/TRIAL RESULT/COMPLETE/INCOMPLETE 흐름과 Center 완료 연결
  - vertical/horizontal 2등분 고정 순서와 retry 결정적 순환, 비중앙 초기값 0.32/0.68
  - 순수 pointer coordinate→ratio helper, visual clamp, Pointer Events/capture와 keyboard fallback
  - 확정 CTA 시 raw evidence 생성 및 중복 방지, targetRatio 0.5 runtime invariant 회귀
  - background/date invalidation, visibility/date race와 assessment 전체 reset
  - valid-only 평균 오차/더 정확한 방향 summary와 사용자 선/정답 선 legend
  - session memory only, Control placeholder 연결, 3등분/Storage 미구현
  - 독립 코드 리뷰 Critical 0건 / Major 3건 / Minor 1건
  - zero/non-finite geometry의 ratio 위조를 명시적 `invalidGeometry` failure로 차단하고 UI divider 이동 방지
  - retry orientation summary를 orientation별 전체 valid evidence 평균 비교로 수정, 동률 vertical 우선 유지
  - Balance 완료 후 `검사 4 / 5 · 손가락 통제` placeholder로 연결하고 과거 Balance placeholder 문구 제거
  - retry 진행 표시를 `추가 측정 n`으로 보완하고 keyboard/raw/runtime literal/unknown orientation/App 흐름 회귀 테스트 추가
  - 수정 후 19 files / 135 tests 및 전체 빌드 통과
- 9단계: DAY 1 손가락 통제 검사 구현
  - Control READY/RUNNING/TRIAL RESULT/COMPLETE/INCOMPLETE 흐름과 Balance 완료 연결
  - leftToRight, start 0.08/end 0.92, 3개 speed/target config 및 retry 결정적 순환 계약 확정
  - monotonic clock과 순수 position 계산을 raw/visual 공통 source of truth로 사용, RAF는 visual-only
  - end 도달 insufficientObservation invalid와 stop/end/background/date race 단일 확정
  - target 3/minimum valid 2/max 6 completion, valid-only 평균 오차와 closest attempt summary
  - 위치/속도/진행률 퍼센트·근접 cue·surprise condition 없이 접근 가능한 stop button/track 설명 적용
  - session memory only, Focus placeholder 연결, Storage/Control Ability Score/Focus 실제 검사 미구현
  - 22 files / 152 tests와 web/AIT/전체 build 및 `git diff --check` 통과
  - 독립 코드 리뷰 Critical 0건 / Major 1건 / Minor 0건
  - elapsed 기반 공통 end helper로 RAF/STOP 판정을 통일하고 exact end stop-first valid evidence 오류 수정
  - 3개 config의 end 전/exact/후 helper 및 stop-first 경계 회귀 테스트 추가
  - 수정 후 22 files / 167 tests와 web/AIT/전체 build 및 `git diff --check` 통과
- 10단계: DAY 1 시각 집중 검사 구현
  - 4×3 row-major grid, 12개 item, target 1/distractor 11의 결정적 Focus stimulus 계약 확정
  - circle/square index 1, triangle/circle index 7, diamond/triangle index 10 config와 retry cycle
  - inline SVG 공통 shape rendering, 동일 touch/visual treatment와 target cue
  - double RAF 뒤 monotonic clock 활성화, 활성화 전 input 및 stale RAF 차단
  - raw FocusTrial correctness/RT, 오답 valid evidence, synchronous duplicate selection guard
  - background/date invalidation, assessment 전체 reset, completion/retry/incomplete
  - valid 정답 수와 correct-only 평균 RT summary, 정답 기록 없음 상태
  - Control → Focus → Basic Analysis placeholder App 흐름 연결
  - Storage persistence, Ability Score UI, Profile/Certification 및 DAY 6 memory 미구현
- 11단계: DAY 1 결과 취합 및 기본 분석 결과 화면 구현
  - 5개 assessment 완료 raw result를 callback으로 App-level `BaselineDraft`에 aggregation
  - domain completion 검증과 고정 order를 적용한 저장 가능한 `BaselineRecord` 생성
  - baseline-only `PersistedAppData`로 기존 `deriveAnalysis()` 연결, persistence는 미구현
  - 동일 가중 overall score v1과 대표 자격 tier→score→Ability tie-break selector 구현
  - 실제 점수·유형·대표 자격·5 Ability·raw 측정 근거·강점/보완·기본 사용설명서 표시
  - Basic Analysis Placeholder 제거와 누락/근거 부족 안전 화면 구현
  - Primary 공유 CTA는 disabled 준비 상태이며 실제 share SDK 미연결
  - 기존 5개 measurement protocol과 dependency 변경 없음
  - 29 files / 201 tests 및 전체 web/AIT build, `git diff --check` 통과
  - 독립 코드 리뷰 Critical 1건 / Major 0건 / Minor 1건
  - App-level baseline session 날짜를 다섯 assessment 전체에 공유하고 모든 phase/완료 경계에서 검사
  - cross-date 감지 시 draft/session/baseline/analysis 즉시 폐기와 DAY 1 재시작 안내 적용
  - 날짜 원복 후 이전 evidence 복구를 금지하고 새 sessionId/빈 draft/새 시작 날짜로 재시작
  - Focus final safeguard와 assessment 자체 dateInvalidated의 App draft 폐기 연동
  - 상세 분석 CTA를 disabled 준비 상태로 수정하고 calculationFailure/Focus 0 correct/deterministic UI 테스트 보강
  - 수정 후 29 files / 208 tests 및 전체 web/AIT build, `git diff --check` 통과

## 현재 소스 상태

- `src/domain/assessment`, `scoring`, `progression`, `session`, `storage`에 3단계 기반 계약 구현
- 최초 사용자 홈/안내와 Time → Center → Balance → Control → Focus 행동 검사/중간 결과 UI 및 실제 기본 분석 결과서 구현
- scoring engine의 DAY 1 orchestration과 표시 content, Apps in Toss Storage adapter 및 시작 복원이 구현됨
- 패키지 및 설정 변경 없음

## 확정된 구현 전 계약

- Persisted root: `schemaVersion`, `baseline`, `dailyRecords`, `finalRecord`, `activeBaselineSession`, 최소 `metadata`
- 파생값은 저장하지 않고 raw records에서 결정적으로 재생성
- `AssessmentSessionState`: idle → inProgress → invalidated 또는 computedPendingSave → saved
- `LocalDateKey`: local Y/M/D 직접 조립한 `YYYY-MM-DD`; 같은 날·과거 역행은 해금 금지
- DAY 1 날짜 경계 시 checkpoint 폐기 후 새 session으로 전체 재시작
- recordId/sessionId 기반 idempotent save와 duplicate append 방지
- DAY 7 tie-break 및 결과 동률 순서: time → center → balance → control → focus
- Ability baseline quality: accuracy 0.75 + consistency 0.25; DAILY candidate: baseline 0.75 + daily 0.25, delta cap ±8
- DAY 7 selector: evidenceCoverage → conditionCoverage → stability unavailable 우선 → available끼리 낮은 stability → 고정 ability tie-break
- profile switch margin 6, certification tier 경계 95/85/70/55, positive update 표시 최소 delta 3

## 남은 calibration 항목

초기 구현 숫자는 `CALIBRATION_VERSION = 1`의 provisional constants로 고정됐다. 출시 전 파일럿 데이터로 검사별 quality/dispersion worst range, tendency/condition threshold와 provisional weights/cap/margin/tier를 version 증가와 함께 보정한다. 구조/invariant 변경은 별도 schema/product contract 변경이다.

## 남은 Minor TODO

- persisted `ISODateTime` runtime 형식 검증 강화
- 4단계 replay consumer에서 `dailyRecords`를 `analysisDay` 오름차순으로 명시적 정렬

## 다음 작업

### DAY 2 실기 QA

실제 기기에서 DAY 2 10~20초 timing, plain/distracted 시각 조건, reduced-motion 완화, background/date invalidation, 저장·강제 종료/재실행 복원을 확인한다. Apps in Toss native Storage bridge의 강제 종료/재실행 QA는 출시 전 실제 기기 TODO로 유지한다.

## 13단계 DAY 2 구현

- STATE C → DAY 2 Intro → plain/distracted 4회 결정적 sequence → DAY 2 결과 → STATE D 연결
- `day2_time_distraction` raw evidence와 기존 completion target 4/minimum 3/condition minimum 1/max 7 재사용
- performance.now monotonic measurement, duplicate input guard, background/date invalidation 및 assessment restart
- 4개 aria-hidden particle, 비정수 animation duration, reduced-motion에서도 완전 제거 없이 amplitude/intensity 완화
- 기존 DailyRecord/runtime schema와 StorageMutationCoordinator FIFO 경로로 저장, 실패 시 동일 recordId retry
- persisted baseline 보존, dailyRecords append, deriveAnalysis replay의 Time-only update 및 다른 네 Ability 불변
- tendency eligibility/fallback, signed early/late 방향, score changed/unchanged와 baseline 관계 결과 UI
- Basic Analysis `심화 분석 1/5`, 같은 날 STATE D, 다음 날짜 DAY 3 placeholder, 날짜 역행 unlock 금지
- 신규 dependency, condition/scoring/schema/migration 변경 없음
- 독립 코드 리뷰 Critical 0/Major 1/Minor 0의 Major를 수정함: signed shift를 earlier/later/neutral 3-state로 분리하고 eligible degradation + neutral direction에 방향 없는 오차 폭 증가 카피 적용

## 13.5단계 DAY 2 UX/측정 강도 보정

- distracted particle 수/DOM을 유지하고 일반 motion의 이동 폭과 particle별 다중 방향 경로를 강화
- reduced-motion에서는 작은 이동 폭과 느린 duration을 유지하며 animation 완전 제거 없음
- 결과 primary를 plain/distracted 2-column 비교 카드로 변경하고 35ms/45ms/+10ms처럼 ms 단위 표시
- 작은 조건 차이 magnitude 카피와 score secondary hierarchy 적용
- 오차 증가와 점수 개선이 함께 나타날 때 일관성 반영 보조 카피 표시
- scoring/calibration, DAY 1 protocol, DAY 2 raw/Storage/schema/assessmentType 변경 없음
- 전체 40 files / 252 tests 및 typecheck/lint/web/AIT/전체 build 통과

## 마지막 검증

- `npm run typecheck`: 통과
- `npm run lint`: 통과
- `npm run test`: 40 files / 252 tests 통과
- `npm run build:web`, `npm run build:ait`, `npm run build`: 모두 통과
- `git diff --check`: 통과
- 새 dependency/config/scoring/assessment protocol 변경 없음, production localStorage 미사용

## 12단계 독립 코드 리뷰 수정

- Critical 1건 수정: cross-date checkpoint를 sanitize root로 영속 폐기하고 실패 시 정상 STATE A 진입 차단
- FIFO Storage mutation coordinator와 revision/mounted guard로 checkpoint/final/retry/reset ordering 및 stale completion 방지
- checkpoint 저장 성공 전 다음 검사 이동 금지, 실패 시 동일 payload retry UX 제공
- pending final save 중 Basic Analysis 이탈 금지, load retry 공통 checkpoint 복원
- recordConflict 전용 UX와 기존 persisted/current pending record 보존
- checkpoint canonical prefix runtime validation 강화
- 날짜 원복, discard 실패, mutation ordering/reset, checkpoint retry, conflict, 전체 derived/evidence round-trip 테스트 추가
- 12단계 종료, 다음 단계 Persistence 실기 QA

## 마지막 커밋

- hash: `9836d21`
- message: `검수`
