# 진행 상태

## 현재 단계

- 단계 번호: 21.3.1-FIX
- 단계 이름: Time READY 화면 중복 단계 제거
- 상태: 완료
- 다음: 21.3.2 Time RUNNING Visual Reconstruction

## 21.3.1-FIX 검증

- App-level 기존 CSS READY와 `assessment-ready` state 제거
- `INTRO → Time READY reference → RUNNING → RESULT` 단일 flow 적용
- Time 내부 Start click 1회, 중복 Start active trial 생성 방지 테스트 추가
- RUNNING에서 READY poster와 reference 카피 unmount 확인
- 76 files / 411 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과

## 21.3.1 검증

- `쓸3.png`를 DAY1 Time READY visible artwork 단일 source로 적용
- 기존 `assessment.startTrial` transparent CTA overlay와 sr-only 의미 정보 유지
- RUNNING 진입 후 READY poster와 reference 의미 DOM 제거 확인
- 기존 cancel 계약이 없어 `검사 중단`은 artwork로만 유지
- 320/360/390/412/430/desktop 및 reference side-by-side 캡처 완료
- 76 files / 410 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과

## 21.2 검증

- INTRO visible artwork를 `public/assets/intro-reference.png` 단일 asset으로 적용
- transparent Start/Back overlay와 sr-only 의미 정보 유지
- 360/412/430/desktop 및 reference side-by-side 캡처 완료
- 76 files / 409 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과

## 완료

- 20.3단계 Analysis Report Polish
  - Basic/Final calibrated overall hero, profile statement, compact certification과 5 Ability summary
  - profile high/low 기반 strongest/weakest marker; 새 threshold 없음
  - raw evidence report rows와 STRENGTH/WATCH/CAUTION manual hierarchy
  - DAY2~6 공통 condition comparison / delta / secondary score visual grammar
  - Final 7/7 completion, metric cells, analysis-note Cross Insight, compact accumulated evidence/actions
  - details/heading/disabled share/aria-hidden 유지
  - scoring/raw/storage/navigation/state machine 변경 없음
  - 전체 검증: typecheck, lint, 69 files / 396 tests, build:web, build:ait, build, `git diff --check` 통과
  - 다음 단계: 20.4 전체 Product Visual/Interaction QA

- 20.2단계 Safe Deterministic Stimulus Variation
  - stable session hash + assessmentType + total attempt index 기반 4종 visual skin
  - Math.random/dependency/persistence 없는 재현 가능 selector와 test override
  - Center approved shape sequence, Balance/Control/Focus/Memory exact config와 scoring/raw/storage 불변
  - DAY3/DAY4/DAY5/DAY6/Final은 decorative shell만 변형
  - contamination 보호 및 RUNNING→RESULT same skin, retry next skin
  - 360×800 attempt matrix 수동 캡처 준비 완료; native/manual visual QA 필요
  - 전체 검증: typecheck, lint, 69 files / 396 tests, build:web, build:ait, build, `git diff --check` 통과
  - 다음 단계: 20.3 Analysis Report Polish

- 19.5단계 Final Visual Polish
  - DAY7 공통 final frame, FINAL CALIBRATION masthead, 7일 분석 마지막 보정 문구와 branded mini seal
  - Basic/Final 공통 fictional certification seal: 하찮력, ㅎ, PRECISION CERTIFIED, concentric ring/tick
  - Final Analysis DAY별 evidence disclosure: 접힌 상태 label/대표 수치, 펼친 상태 전체 raw-derived evidence
  - interaction/measurement/scoring/raw/storage/navigation 변경 없음
  - typecheck, lint, 67 files / 386 tests, build:web, build:ait, build, `git diff --check` 통과
  - 다음 단계: Share integration 및 Apps in Toss Native QA

- 19단계 Final Visual System
  - warm ivory/paper, deep navy, emerald/mint, muted gold의 전역 token 적용
  - precision dial/ticks/grid/corner bracket와 instrument-panel CTA 공통화
  - DAY1~7 ready/result/analysis, Basic/Final certificate, error/storage state 시각 통일
  - 360×800 중심 320/390/430 responsive와 safe-area/touch/focus-visible 유지
  - Center/Balance/Control/Focus/Memory RUNNING measurement contamination 보호
  - 새 dependency 및 기능/scoring/raw/storage 변경 없음
  - 전체 검증: typecheck, lint, 67 files / 386 tests, build:web, build:ait, build, `git diff --check` 통과
  - Chromium 360×800: body warm ivory, CTA 56px, scrollWidth 360px, 가로 overflow 없음
  - 다음 단계: Final Visual QA

- 18단계 DAY7 독립 코드 리뷰 수정
  - Critical 0 / Major 5 수정 완료
  - final memory exposure/blank stale timer와 Control exact-end/RAF lifecycle 방어
  - finalFocus double RAF 이후 측정 시작, interaction 직전 날짜 재검사
  - finalBalance divider crossing 방지와 공통 runtime validation 적용
  - Cross Insight 내부 content key를 사용자 카피로 치환
  - DAY1~7 실제 raw evidence 기반 누적 근거 표시와 취급 주의사항/metric/STATE E·F 카피 보강
  - selector/scoring/calibration/raw/schema/storage 및 DAY1~6 protocol 변경 없음
  - 전체 검증: typecheck, lint, 67 files / 380 tests, build:web, build:ait, build, `git diff --check` 통과
  - 다음 단계: 최종 실기 QA

- 18단계 DAY7 Final Calibration 및 최종 분석서
  - DAY1~6 evidence 기반 기존 selector와 selected Ability→final arm 1:1 mapping
  - 기존 DAY1~6 deterministic config/helper를 재사용한 5개 final arm
  - attempt-index retry identity와 completion exact-config runtime boundary
  - date/background, 마지막 RESULT, FinalRecord idempotent save와 STATE F/reload
  - 기존 final 80/20·±6·selected-only scoring 유지
  - final metrics, Cross Insight 최대 2개/fallback, 누적 evidence와 진단 경계 최종 분석서
  - Share SDK는 integration gate로 미연결
  - 전체 검증: typecheck, lint, 66 files / 371 tests, build:web, build:ait, build, `git diff --check` 통과
  - 다음 단계: 18단계 독립 코드 리뷰

- 17단계 DAY6 독립 코드 리뷰 수정
  - Critical 0 / Major 1 / Minor 1
  - invalid retry에서도 원본 attempt index로 spread A/clustered B identity 보존
  - presentation, Focus modifier, tendency가 공통 A/B 판정 helper 사용
  - DAY6 Analysis 전용 정상/invalid retry 회귀 테스트 추가
  - SCORING_SPEC tendency를 spread/clustered V2 비교와 정합화
  - blank background와 stale blank callback 회귀 보강, optional undefined raw key 제거
  - scoring/calibration/raw schema/Storage와 DAY1~5 protocol 변경 없음
  - 전체 검증: typecheck, lint, 62 files / 357 tests, build:web, build:ait, build, `git diff --check` 통과
  - 다음 단계: DAY6 실기 QA

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

현재 `CALIBRATION_VERSION = 2`는 DAILY condition-centered modifier를 사용한다. 출시 전 파일럿 데이터로 검사별 worst range, tendency/condition threshold와 cap/margin/tier를 version 증가와 함께 보정한다.

## 남은 Minor TODO

- persisted `ISODateTime` runtime 형식 검증 강화
- 4단계 replay consumer에서 `dailyRecords`를 `analysisDay` 오름차순으로 명시적 정렬

## 다음 작업

### 17단계 독립 코드 리뷰

DAY 6 exact config, exposure/blank/recall lifecycle, matching, Focus-only V2 modifier, Storage와 STATE D/E 연결을 독립 검토한다.

## 17단계 DAY6 순간 위치 기억 추가 분석

- spatial memory supporting evidence이며 별도 Memory Ability 없음
- spread/clustered exact coordinates와 A/B/A/B/A deterministic sequence
- exposure 1200ms, blank 300ms, recall 3 taps와 monotonic response time
- 3! minimum-distance matching과 lexicographic tie-break
- Focus-only V2 modifier, DAY 1 Focus baseline 기준 no-compounding
- analysisDay 6 저장, 심화 분석 5/5, 같은 날 STATE D와 다음 날 STATE E
- DAY 7은 최종 보정 placeholder까지만 연결
- DAY 1~5 회귀와 native Storage QA TODO 유지
- 전체 검증: 61 files / 353 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과

## DAY 5 마지막 trial 결과 UX 수정

- 모든 DAY 5 attempt가 마지막 completion attempt를 포함해 TRIAL RESULT를 거치도록 phase 전환 분리
- 마지막 valid result의 목표/실제 위치/오차와 `결과 보기` CTA 표시 후 COMPLETE 진입
- 중간 `다음 측정`과 retry `다시 측정` 계약 유지
- attempt 5~7 retry completion, duplicate CTA, raw trial count 및 기존 scoring 회귀 테스트 추가
- completion/config/raw/scoring/calibration/Storage 변경 없음
- 전체 검증: 57 files / 334 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과

## 16.6단계 DAILY Ability Scoring V2

- DAILY absolute remeasurement 제거 및 DAY 1 baseline + condition modifier 적용
- DAY 2~5 reference/challenge mapping과 positive/negative/neutral modifier, ±8 cap, no-compounding 고정
- `CALIBRATION_VERSION = 2`, 기존 persisted raw를 migration 없이 V2로 replay
- V1 consistency contradiction copy 제거
- Storage/raw/schema, DAY 1과 DAY 2~5 measurement protocol, DAY 7 final calibration 변경 없음
- 전체 검증: 57 files / 331 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과

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

## 16단계 DAY 5 surprise control degradation 추가 분석

- predictable/surprise exact 4-config와 attempt-index retry sequence
- initial-speed traversal 기준 normalized transition과 piecewise position math
- exact-end invalid, stop/RAF/background/date race 단일 확정
- DailyRecord analysisDay=5 append, 동일 payload save retry와 DAY 1~4 보존
- predictable/surprise 오차 변화 primary, Control score secondary, 심화 분석 4/5
- Control-only update, 같은 날 STATE D와 다음 날짜 DAY 6 placeholder
- scoring/calibration/raw/Storage schema/dependency 변경 없음
- 56 files / 310 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과

## 16단계 DAY 5 독립 코드 리뷰 수정

- Critical 0 / Major 2 / Minor 2 리뷰 결과를 모두 수정
- DAY 5 exact config runtime completion/persistence boundary와 attempt 1~7 sequence 검증
- generic ControlCondition validator는 기존 재사용 계약 유지
- stop/end/background/date/unmount에서 RAF generation invalidate 및 stale callback trial isolation
- transition 직전/exact/직후 연속성 회귀 테스트 추가
- noneligible nonzero delta를 `변화 거의 없음`으로 정렬하고 DAY 6 placeholder 카피 수정
- scoring/calibration, raw/Storage schema, DAY 1~4 protocol, dependency 변경 없음
- 56 files / 319 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과
- DAY 5 실기 QA 진행

## 15.5단계 DAY 4 결과 해석 UX 보정

- terminal direction component를 기존 Balance normalization/TENDENCY threshold로 별도 판단
- 새 threshold 없이 미세 sign 방향 단정 제거
- primary를 DAY 1 2등분 대비 DAY 4 3등분 안정성으로 변경
- valid trial별 분배/평균/33.3% 기준과 cancellation 설명 추가
- scoring/raw/calibration/Storage 및 DAY 1~3 변경 없음
- 52 files / 293 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과

## 15단계 DAY 4 다중 분배 성향 추가 분석

- orientation/condition 없는 horizontal 단일 과제와 기존 raw/completion 계약 유지
- CONFIG_A `0.28/0.72`, CONFIG_B `0.38/0.62`의 attempt-index A/B 반복
- 두 divider pointer/keyboard, crossing 차단, confirm-only raw와 duplicate guard
- background/date invalidation, retry/incomplete 및 DAY 4-only restart
- DailyRecord analysisDay=4 append, 동일 payload save retry와 baseline/DAY2/DAY3 보존
- 실제 평균 segment와 33.3% 기준 비교, DAY 1 two-way 대비 오차 및 Balance secondary
- Balance-only update, 심화 분석 3/5, 같은 날 STATE D와 다음 날짜 DAY 5 placeholder
- scoring/calibration/raw/schema/dependency 변경 없음
- 51 files / 288 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과

## 14단계 DAY 3 시각 유도 편향 추가 분석

- deterministic plain/left/right stimulus, raw stimulusId, exact mirror geometry와 exact center invariant
- normalized pointer, duplicate/background/date lifecycle와 retry/completion
- DailyRecord analysisDay=3, Storage coordinator, same-payload save retry
- baseline+DAY2 보존, Center-only update, neutral 포함 directional tendency
- DAY 1 vs DAY 3 비교/diagram, Center score secondary, 심화 분석 2/5
- 같은 날 STATE D, 다음 날짜 DAY 4 placeholder, rollback unlock 금지
- DAY 1/2/Storage 회귀 포함 45 files / 272 tests 통과

### 14단계 독립 코드 리뷰 수정

- Critical 0 / Major 1 / Minor 1
- DAY 3 diagram과 legend의 baseline/day3/true-center marker mapping을 전용 class로 일치시킴
- diagram/legend marker가 동일 CSS 선언을 공유해 색상·테두리 drift를 방지함
- `role="img"`와 세 비교점의 완전한 접근성 설명 추가
- scoring/raw/persistence 및 DAY 1/2 변경 없음
- 45 files / 273 tests와 전체 검증 통과

다음 작업은 DAY 3 실기 QA다. Apps in Toss native Storage bridge 강제 종료/재실행 QA TODO는 유지한다.

- `npm run typecheck`: 통과
- `npm run lint`: 통과
- `npm run test`: 56 files / 319 tests 통과
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

## 20.1단계 Assessment Visual Identity Upgrade

- [x] Time precision stopwatch / empty RUNNING / calibrated RESULT
- [x] Center answer-free optical frame
- [x] Balance partition rail/handle와 RUNNING edge ticks
- [x] Control movement rail, proximity feedback 없음
- [x] Focus neutral matrix, actual target preview 없음
- [x] Memory dummy constellation, actual A/B preview 없음
- [x] Final Calibration selected identity 재사용
- [x] decorative state와 measurement state 분리 및 contamination tests
- [x] 320/360/390/430 responsive CSS boundary
- [ ] Apps in Toss native device visual QA

## 20.5단계 Release Visual Fix

- [x] Basic/Final shared certification seal overflow 수정
- [x] Final evidence title/value DOM 분리 및 320/360/390/430 overlap 0
- [x] DAY 3 overlapping marker 동심 ring mapping과 raw 좌표 유지
- [x] Final Calibration 360px heading orphan 제거
- [x] DAY 5 condition header wrapping 정리
- [x] Final report 반복 spacing 축소
- [x] 360×800 필수 7장 및 320/390/430 horizontal overflow QA
- [x] 70 files / 398 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과
- [ ] Next: Share Integration + Apps in Toss Native QA

## 21단계 Apps in Toss Share Integration

- [x] web-framework 3.0.2 `Share.sendMessage` / `Share.createLink` 타입 계약 확인
- [x] SharePort와 Apps in Toss adapter 분리
- [x] Basic/Final deterministic presentation-only message
- [x] 기본 message-only, explicit test/prod deep-link injection
- [x] link 생성 실패 시 silent fallback 없는 error
- [x] Basic/Final CTA idle/sharing/error와 double-click guard
- [x] share rejection 후 결과 화면/Storage 유지 및 재시도
- [x] Chromium navigator.share fallback 없음
- [x] 73 files / 406 tests 및 typecheck/lint/web/AIT/전체 build/`git diff --check` 통과
- [ ] Toss Sandbox Basic/Final share sheet Android/iOS Native QA
- [ ] private test link 실제 클릭과 앱 진입
- [ ] share 취소/재시도 및 Storage root 불변 Native QA
- [ ] Next: 22단계 Apps in Toss Native QA

## 20.6단계 Final Art Direction Pass

- [x] Home branded 5-axis scan instrument
- [x] Time outer tick ring / numeric clear zone / empty RUNNING
- [x] Center decorative/input depth 분리, center cue 없음
- [x] Balance sparse ticks / precision handle, target guide 없음
- [x] Control cap/tick hierarchy, proximity cue 없음
- [x] Focus neutral READY/RUNNING visual family, target preview 없음
- [x] DAY3 exact-coordinate concentric marker mapping
- [x] DAY5 wrapping / DAY6 matching line / Final Calibration heading polish
- [x] Basic/Final report hero와 chapter document rhythm 정리
- [x] 320/360/390/430 horizontal overflow 및 주요 overlap 0
- [x] 73 files / 406 tests 유지
- [x] Current: 20.6 Final Art Direction Pass 완료
- [ ] Next: Apps in Toss Native QA
