# Hachannyeok Project Handoff

이 문서는 Codex와 Claude Code가 공통으로 읽는 현재 프로젝트 상태의 단일 인수인계 문서다. 새 작업은 이 문서부터 읽는다.

## 1. Current Phase

- Current: **45.0 Targeted First-User Polish 완료**
- HOME/INTRO의 raster 원본을 보존하고 visible DOM journey로 `DAY 1 기준 → DAY 2–6 조건 변화 → DAY 7 최종 보정`을 첫 화면에 노출함.
- Basic hero 최상단에 `BASELINE · 1차 분석 / DAY 1 / 7`과 첫날 기준점/최종 결과 framing을 추가하고 Overall/Profile/대표 자격은 유지함.
- DAY5 RUNNING의 predictable/surprise/steady/variable identity를 text와 accessibility tree에서 제거하고 neutral motion-control label로 통일함. READY 안내, RESULT/Analysis condition 공개와 raw/config/timing은 유지함.
- DAY7 Returning HOME의 `누적 evidence`를 `누적 측정 근거`로 통일함.
- 45.0 QA harness와 simulated 5-persona re-QA는 `artifacts/first-user-polish-45.0/`.
- 실제 Chrome responsive 재캡처는 실행 승인 사용량 제한으로 미실행. 다음 browser-capable session에서 360×800/390×844/412×786 확인 필요.
- Next: **Local UX freeze 후 human first-user test / Native QA 재개**

- Current: **27.1 Final Hero Calibration Summary + DAY7 Targeted E2E 완료**
- Next: **Release Fast Track**
- Final Analysis hero에 DAY7 실제 selected Ability, engine이 replay한 `preFinalScores`, 최종 `scores`, signed delta를 표시함. UI score 재계산은 없음.
- DAY7 Intro/READY callback과 state는 유지하고 CTA copy만 `마지막 보정 확인하기` / `측정 시작`으로 구분함.
- Focus deterministic path는 68→69(+1), Time deterministic path는 95→89(-6)이며 두 경로 모두 actual selector→arm→FinalRecord→report를 Chrome에서 완료함.
- 320×800, 360×800, 390×844, 412×786, 430×932에서 Final hero horizontal overflow 0, calibration/certification/5 Ability crop 0을 확인함. 캡처와 QA-only harness는 `artifacts/final-27.1/`.
- 5개 final arm 모두 selected Ability만 변경되고 나머지 네 점수는 preFinal과 동일하며 delta는 ±6 이내임을 회귀 테스트로 고정함.
- 전체 검증: 76 files / 417 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과.
- Current: **21.3.1-FIX Time READY 화면 중복 단계 수정 완료**
- Next: **21.3.2 Time RUNNING Visual Reconstruction**
- 중복 원인은 App-level `assessment-ready`와 `TimeAssessmentScreen` hook-level `ready`가 연속으로 존재한 것이었음. App-level screen/type/component를 제거하고 INTRO `onStart`를 기존 `beginBaseline`에 직접 연결함.
- 실제 flow는 `INTRO → Time READY reference → RUNNING → RESULT`이며 Time 내부 Start는 1회임. `beginBaseline`은 session만 만들고 측정 clock은 기존대로 reference CTA의 `assessment.startTrial`에서 시작함.
- 기존 CSS READY의 visible DOM/component는 제거함. RUNNING 진입 시 reference poster와 `3.000 / REFERENCE / 대기 중` 접근성 DOM도 unmount됨.
- 중복 Start는 hook의 기존 active guard로 trial ID를 한 번만 만들며 명시적 회귀 테스트를 추가함. HOME/INTRO asset과 RUNNING/RESULT presentation 및 timing/raw/scoring/storage 계약은 변경하지 않음.
- 전체 검증은 76 files / 411 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과.
- Previous: **21.3.1 DAY1 Time READY Reference Asset 적용 — 사용자 시각 승인 대기**
- `/mnt/c/Users/jinsung/Downloads/쓸3.png` (`941×1672`, SHA-256 `54b8c69b828ad7a0e1905d051303e0ce803a36d37a3da17a3c3aafcde451b5d0`)을 runtime `public/assets/day1-time-ready-reference.png`로 무손실 복사함.
- DAY1 Time의 `phase === ready`만 reference poster로 교체함. Start visible bounds `(90,1080,763,183)`을 `left 9.5643% / top 64.5933% / width 81.0840% / height 10.9450%` transparent button으로 연결함.
- 기존 화면 계약에 cancel/back callback이 없으므로 PNG의 `검사 중단`은 artwork로만 유지하고 새 기능을 만들지 않음. Start는 기존 `assessment.startTrial`을 그대로 호출함.
- Start 직후 READY poster/summary는 unmount되며 RUNNING의 timer, TimeInstrument, `지금!`, contamination 계약은 변경하지 않음.
- Chrome QA 320/360/390/412/430/1280에서 horizontal overflow와 crop 0, reference comparison은 `artifacts/day1-time-ready-21.3.1/`에 저장함.
- 전체 검증은 76 files / 410 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과.
- Previous: **21.2 쓸능검 INTRO Reference Asset 적용 — 사용자 시각 승인 대기**
- `/mnt/c/Users/jinsung/Downloads/쓸2.png` (`941×1672`, SHA-256 `bdc0a46671c632ec6aeaa34c4b72a19d819fefa9d3a645f8de9be1f2f10c50c6`)을 runtime `public/assets/intro-reference.png`로 무손실 복사함.
- INTRO visible artwork는 reference PNG 한 장이며 Start/Back은 image-relative transparent button overlay, 의미 정보는 `sr-only` DOM으로 제공함.
- Start visible bounds `(76,1427,785,110)`은 `left 8.0765% / top 85.3469% / width 83.4219% / height 6.5789%`, Back bounds `(77,1550,783,76)`은 `8.1828% / 92.7033% / 83.2094% / 4.5455%`로 반영함.
- PNG 내부 텍스트는 system font scaling에 반응하지 않는 대신 핵심 카피와 실제 controls를 accessibility DOM으로 제공함. measurement/navigation/scoring/raw/storage/state 계약과 HOME 21.1.5는 변경하지 않음.
- Chrome QA 360×800/412×786/430×932/1280×1200에서 horizontal overflow와 crop이 0이며 reference comparison은 `artifacts/intro-21.2/`에 저장함. 전체 검증은 76 files / 409 tests, typecheck, lint, build:web, build:ait, build, `git diff --check` 통과.
- Previous: **21.1.5 쓸능검 HOME Reference Asset 교체 — 사용자 승인 대기**
- `/mnt/c/Users/jinsung/Downloads/쓸1.png` (`941×1672`, SHA-256 `ed464d5e106cd13727c4588c46f53182f6c2c14b8003c5a6868b27003ee50d2b`)을 runtime `public/assets/home-reference.png`로 무손실 복사함.
- 기존 하찮력 asset은 `public/assets/home-reference-hachannyeok.png`로 archive하고 runtime에서 참조하지 않음.
- 새 asset CTA visible bounds `(87,1241,767,176)`을 `left 9.2455% / top 74.2225% / width 81.509% / height 10.5263%`로 반영함. secondary visible text bounds `(323,1457,289,31)`를 `34.3252% / 87.1411% / 30.712% / 1.8541%`로 반영하고 pseudo hit expansion으로 320px에서도 약 44px pointer area를 유지함.
- Previous: **21.0 쓸능검 브랜드 리네이밍 완료**
- 최종 사용자 노출 Brand는 `쓸능검`, Descriptor는 `쓸데없는 능력 정밀검사`, 내부 project codename/path는 `hachannyeok`으로 분리함.
- HOME accessibility DOM, INTRO, Returning HOME, Basic/Final/Daily report, fictional certification seal, Basic/Final share message, HTML title의 사용자 노출 브랜드를 `쓸능검`으로 변경함.
- `appName: hachannyeok`, package name, `hachannyeok.profile.v1`, deep link, schema/session/record/raw identity는 변경하지 않음. migration 없음.
- HOME reference PNG에 박힌 기존 워드마크는 이번 텍스 계약 단계에서 덮어쓰거나 파괴하지 않음. 새 `쓸능검` HOME/INTRO PNG로 교체할 후속 asset task가 필요함.
- Apps in Toss 콘솔의 실제 표시명은 repo의 internal `appName`과 별개로 수동 변경이 필요할 수 있음.
- Previous: **21.1.4 HOME Reference Asset Composition — 사용자 승인 대기**
- `/mnt/c/Users/jinsung/Downloads/메인.png`를 visual source of truth로 사용해 큰 워드마크/검사 번호 pill/2줄 hero statement/3.000 precision dial/3 spec cards/대형 CTA/secondary link/diagnostic boundary의 portrait poster composition으로 재구성함.
- Home `onStart`, navigation, STATE A~F, storage/scoring/raw/progression/share/date unlock/safe-area/disabled 계약은 변경하지 않음.
- Windows Chrome CDP device metrics로 360×800/390×844/412×786/430×932를 실제 검증하고 `artifacts/home-21.1.2/`에 360/412 캡처를 저장함. 사용자 시각 승인 전에는 INTRO로 넘어가지 않음.
- 21.1.3에서 구조를 유지한 채 wordmark weight, hero line balance, dial axis/ring/tick opacity, 3.000 clear zone, spec card density, CTA grid/shadow, secondary alignment, 2-line diagnostic footer를 micro-polish함. 승인용 360/412/desktop/reference comparison은 `artifacts/home-21.1.3/`.
- 21.1.4에서 원본 `메인.png`를 SHA-256 동일한 `public/assets/home-reference.png` HTML asset으로 복사하고, STATE A HOME의 visible artwork를 해당 poster image 하나로 교체함. CTA/secondary는 image-relative percentage transparent button overlay이고 의미 정보는 `sr-only` summary로 제공함.
- HOME poster 텍스트는 이미지에 포함되어 system font scaling에 반응하지 않는 trade-off가 있음. reference fidelity를 우선하되 핵심 텍스트와 제어의 accessibility DOM을 별도 유지함. STATE B~F는 기존 `ReturningHome`으로 기능이 유지되며 후속 state asset 과제로 분리 가능.
- 21.1.4 캡처와 reference comparison은 `artifacts/home-21.1.4/`.
- 현재 단계: **20.3단계 Analysis Report Polish 완료**
- 다음 단계: **20.4 전체 Product Visual/Interaction QA**
- Basic/Final hero를 calibrated overall dial, profile statement, compact certification, 5 Ability scorecard 순서로 정리함.
- DAY2~6은 동일한 daily report spacing, condition card header, delta와 secondary score 문법을 공유함.
- sessionId + assessmentType + 전체 attempt index 기반 stable hash selector로 4종 decorative skin을 재현 가능하게 선택함.
- Center 승인 shape, Balance orientation/A-B cut, Control movement tuple, Focus config 1→2→3, Memory A/B와 DAY7 exact config는 모두 기존 순서를 유지함.
- 새 measurement geometry, raw/storage field, calibration/scoring 변경 없이 outline/ticks/frame/surface shell만 변형함.
- DAY7은 interaction을 유지한 채 FINAL CALIBRATION masthead, 7일 분석 마지막 보정 문구, fictional mini seal과 공통 final frame을 적용함.
- Basic/Final Analysis certification seal을 하찮력/PRECISION CERTIFIED/ㅎ의 concentric calibration seal로 공통화함.
- Final Analysis 누적 evidence는 DAY별 label과 대표값을 항상 표시하고 disclosure를 펼치면 기존 raw-derived 전체 문장을 확인하도록 압축함.
- warm ivory paper, deep navy, emerald instrument panel, muted mint/gold calibration accent 기반의 precision instrument visual system과 하찮력 전용 fictional certification/report visual을 전 화면에 적용함.
- 360×800 mobile-first와 safe area를 유지하고 320/390/430 responsive boundary를 보강함. RUNNING measurement contamination 금지와 reduced-motion 정책을 유지함.
- 새 dependency 없음. 기능/navigation/state machine, scoring/raw/storage 및 DAY1~7 protocol 변경 없음.
- 전체 검증: typecheck, lint, 67 files / 386 tests, build:web, build:ait, build, `git diff --check` 통과. 실제 Chromium 360×800에서 warm ivory 배경, 56px CTA, 360px scroll width와 가로 overflow 없음 확인.
- 18단계 독립 리뷰 Critical 0 / Major 5를 수정함: final memory timer와 Control RAF lifecycle, Focus double RAF·날짜 재검사, Balance crossing·runtime validation, Cross Insight 사용자 카피, DAY1~7 실제 누적 evidence. 직접 관련 Minor로 취급 주의사항, metric 설명, STATE E/F 카피도 보강함.
- selector/scoring/calibration/raw/schema/storage architecture 및 DAY1~6 protocol 변경 없음.
- `src/domain`에 문서의 calibration, math, raw union/runtime validation, completion, LocalDateKey/STATE, session/checkpoint, persisted schema/migration/idempotency/StoragePort 및 scoring engine 타입 경계를 구현함
- Calibration/math/normalizer부터 baseline·daily·final score, stability, tendency, DAY 7 selector, profile, certification, final metric, Cross Insight, raw replay `deriveAnalysis`까지 구현함
- 최초 사용자 홈/검사 안내, DAY 1의 Time → Center → Balance → Control → Focus 행동 검사와 raw 결과 orchestration/기본 분석 결과서를 구현함. Apps in Toss Storage adapter는 아직 구현하지 않음

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
- 홈/검사와 DAY 1 기본 결과 UI 및 실제 점수/profile/certification 표시 content는 구현됨. DAILY/FINAL UI와 실제 SDK adapter는 미구현

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

## 18단계 DAY7 Final Calibration 및 최종 분석서

- 기존 `finalSelector`가 DAY1~6 evidence의 confidence tuple로 고른 Ability를 `finalTime/finalCenter/finalBalance/finalControl/finalFocus`에 1:1 연결함
- DAY2 particle, DAY3 circle stimulus, DAY1 vertical Balance 초기값, DAY4 CONFIG_A, DAY5 movement/config, DAY1 Focus Config 2, DAY6 clustered B를 source of truth로 재사용함
- 모든 final arm은 전체 attempt index로 sequence/retry identity를 선택하고 target+3 completion 및 attempt별 exact config boundary를 적용함
- background attempt invalidation, DAY7 date-change draft 폐기, 마지막 attempt RESULT → 결과 보기 → COMPLETE 흐름을 구현함
- `prepareFinalSave`와 기존 `StorageMutationCoordinator` 경로로 same-payload idempotency, 다른 final 충돌 보존, DAY1~6 evidence 보존을 적용함
- 기존 final 80/20, preFinal 대비 ±6 cap, selected Ability-only 변경을 그대로 사용하며 DAILY V2 modifier는 final에 적용하지 않음
- FinalRecord 저장 후 STATE F 및 reload를 지원하고 최종 Overall/Profile/5 Ability/대표 자격/final metrics/Cross Insight/fallback/강점·보완/evidence/진단 경계를 표시함
- Share SDK는 integration gate 상태로 유지하고 최종 결과와 분리된 disabled 안내만 표시함
- native 360×800 실제 기기와 Storage bridge 강제 종료/재실행 QA는 후속 TODO
- 전체 검증: typecheck, lint, 66 files / 371 tests, build:web, build:ait, build, `git diff --check` 통과

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

## 21. 11단계 DAY 1 결과 취합 및 기본 분석 결과 화면 구현 결과

- Time/Center/Balance/Control/Focus 완료 callback을 raw `Day1RawResult` 전달 계약으로 확장하고 App session memory의 `BaselineDraft`에 다섯 결과를 보존함
- domain completion validator로 다섯 결과를 확인한 뒤 고정 assessment order의 `BaselineRecord`를 생성함. `sessionId`, 안정적 `recordId`, 시작/완료 timestamp와 공유 `LocalDateKey`를 사용함
- baseline만 가진 최소 valid `PersistedAppData`로 기존 `deriveAnalysis()`를 호출하며 StoragePort, localStorage, IndexedDB, Apps in Toss Storage 저장은 연결하지 않음
- `OVERALL_SCORE_VERSION = 1`, 다섯 Ability 동일 가중 평균 `deriveOverallScore()`, 대표 자격 tier→score→Ability order selector 계약과 순수 helper를 추가함
- 확정된 profile high/low 문구, variant badge와 ability/tier별 certification 표시 table을 presentation layer에 구현하고 engine key를 사용자에게 노출하지 않음
- 실제 overall/5 Ability/profile/대표 자격, raw 측정 근거, 강점·보완, 기본 사용설명서와 분석 진행 상태를 포함한 정밀 결과 화면으로 Basic Analysis placeholder를 교체함
- DAY 1 Primary `결과 공유하기`는 시각적 위계를 유지하되 실제 share SDK 없이 disabled/준비 중 상태로 제공함
- baseline 누락과 `insufficientEvidence`/`calculationFailure`를 0점으로 대체하지 않고 별도 안전 화면으로 처리함
- domain-valid 5-result fixture, aggregation/order/runtime validation, overall, representative certification, profile content, 결과 UI와 Focus→실제 결과 navigation 테스트를 추가함
- 기존 다섯 measurement protocol의 grid/config/speed/geometry/timing은 변경하지 않았고 새 dependency도 추가하지 않음
- 전체 검증: typecheck, lint, 29 files / 201 tests, build:web, build:ait, build, `git diff --check` 통과
- 11단계 독립 코드 리뷰에서 Critical 1건, Major 0건, Minor 1건을 확인함

## 22. 11단계 독립 코드 리뷰 수정 및 종료

- Critical이었던 App-level DAY 1 날짜 경계를 보강해 baseline session 시작 `LocalDateKey`를 다섯 assessment 전체에서 공유함
- 각 assessment의 진입/phase 변화와 완료 callback에서 현재 날짜를 공유 session 날짜와 비교하고, mismatch result는 draft에 추가하기 전에 거부함
- 날짜 불일치 또는 assessment 자체 `dateInvalidated` 감지 시 `BaselineDraft`, session identity, baseline candidate와 derived analysis를 즉시 폐기하고 전용 재시작 안내로 이동함
- 한 번 폐기된 session은 날짜가 원래 key로 돌아와도 복구하지 않으며, 재시작 뒤 새 `sessionId`, 빈 draft와 새 시작 날짜로 DAY 1을 시작함
- Focus 완료 직전에도 날짜를 다시 검사해 다른 날짜 raw evidence로 `BaselineRecord`나 분석이 생성되지 않도록 final safeguard를 유지함
- Minor였던 `상세 분석 보기`는 가짜 이동 대신 disabled와 명확한 `준비 중` 상태로 변경함
- 일반 cross-date, 날짜 원복, Focus final safeguard, 새 session, calculationFailure 안전 화면, Focus 정답 0개 evidence와 deterministic UI 회귀 테스트를 추가함
- 전체 검증: typecheck, lint, 29 files / 208 tests, build:web, build:ait, build 및 `git diff --check` 통과
- 11단계를 종료하고 2차 실기 QA 진행 가능

## 23. 12단계 Apps in Toss Storage persistence 구현 결과

- 설치된 `@apps-in-toss/web-framework@3.0.2` 타입과 공식 개발자센터에서 `Storage` root import 및 `getItem`/`setItem`/`removeItem`/`clearItems` Promise 계약을 대조해 일치를 확인함
- `AppsInTossStorageAdapter`가 고정 key `hachannyeok.profile.v1`의 문자열 JSON 직렬화, parse, migration, current runtime validation과 SDK reject 변환을 담당함
- 앱 전용 초기화는 다른 SDK key를 삭제하지 않도록 `removeItem`을 사용하며 config permission 변경과 새 dependency는 없음
- App mount의 loading/loaded/loadError/corruptData를 분리해 최초 사용자 Home flash를 막고, valid baseline은 persisted raw evidence에서 `deriveAnalysis()`로 재생성함
- DAY 1 완료 시 runtime-valid `BaselineRecord`를 idempotency helper로 확인한 뒤 root save하며, 실패 시 `computedPendingSave`에 해당하는 동일 record/data를 메모리에 유지하고 `다시 저장`을 제공함
- 같은 recordId/동일 payload는 idempotent success, 다른 payload는 `recordConflict`로 기존 record를 보존함
- DAY 1 완료 assessment checkpoint는 기존 `activeBaselineSession` shape까지만 저장하고 같은 날짜 mount에서 다음 assessment로 복원함
- baseline 날짜와 오늘 날짜로 기존 `deriveUserState`를 사용해 same-day STATE B, 다음 날짜 STATE C, 날짜 역행 신규 unlock 금지를 적용함. DAY 2 CTA는 disabled 준비 상태이며 실제 검사는 미구현
- 손상/future schema는 결과 계산과 자동 삭제를 막고 명시적 확인 뒤 기록 초기화를 제공함. clear 실패 시 기존 memory/storage 결과를 유지함
- 테스트용 `MemoryStorageAdapter`는 load/save/clear/failure injection을 제공하며 SDK adapter는 얇은 wrapper 테스트로 검증함
- persisted root에는 raw baseline/session/metadata만 저장하고 overall/ability/profile/certification/insight/BasicAnalysis view model 및 production localStorage를 사용하지 않음
- 기존 5개 assessment protocol, calibration, scoring formula와 measurement evidence는 변경하지 않음
- 자동 테스트 33 files / 221 tests 통과. typecheck/lint 및 전체 build 검증 결과는 아래 마지막 검증에 기록
- 마지막 전체 검증: typecheck, lint, 33 files / 221 tests, build:web, build:ait, build, `git diff --check` 모두 통과

## 24. 12단계 독립 코드 리뷰 수정 및 종료

- 독립 코드 리뷰 Critical 1건, Major 6건, Minor 0건을 수정함
- cross-date `activeBaselineSession`을 `null`로 sanitize한 root로 영속 저장한 뒤에만 STATE A를 적용해 날짜 원복 시 옛 checkpoint가 부활하지 않게 함
- checkpoint discard 저장 실패는 `checkpointDiscardFailed` 전용 상태와 `다시 시도` UX로 차단함
- application/infrastructure 경계의 FIFO `StorageMutationCoordinator`로 checkpoint, final baseline, discard, retry, reset mutation을 단일 직렬 경로로 통합함
- mutation revision과 mounted guard로 reset/unmount 이후 stale completion의 React state 반영을 차단하고, synchronous in-flight ref로 retry 중복 실행을 방지함
- checkpoint 저장 성공 전 다음 assessment로 이동하지 않으며 실패 시 동일 root/raw/session을 보존한 `진행 기록을 저장하지 못했습니다.`/`다시 저장` UX를 제공함
- final baseline pending-save 중에는 Basic Analysis 이탈을 막아 persisted STATE A가 노출되지 않게 함
- initial load와 retry load가 같은 `applyLoadedData` 경로에서 sanitize, checkpoint 복원, baseline replay를 수행함
- `recordConflict` 전용 화면에서 기존 root와 현재 pending baseline을 보존하고 기존 기록 보기 또는 확인 후 초기화만 제공함
- checkpoint runtime schema가 `time → center → balance → control` canonical prefix만 허용하도록 강화함
- cross-date discard/실패/날짜 원복, load retry restore, checkpoint failure/retry, conflict, mutation ordering/reset, full derived result/evidence round-trip 회귀 테스트를 추가함
- scoring/calibration과 5개 assessment protocol, dependency/config는 변경하지 않았고 production localStorage fallback도 추가하지 않음
- 전체 검증: typecheck, lint, 34 files / 232 tests, build:web, build:ait, build, `git diff --check` 모두 통과
- 12단계를 종료하고 Persistence 실기 QA 진행 가능

## 25. 13단계 DAY 2 시간 방해 안정성 추가 분석 구현 결과

- STATE C의 `오늘의 추가 분석`을 DAY 2 Intro → Time condition assessment로 연결하고, 완료·저장 뒤 같은 날 STATE D의 `오늘의 추가 분석 완료`/`업데이트된 분석서 보기`로 전환함
- 기존 domain 계약 `day2_time_distraction`, `TimeConditionTrial`, condition literal `plain | distracted`, target 4/minimum valid 3/condition별 최소 1/max 7을 변경 없이 재사용함
- attempt 순서를 `plain → distracted → plain → distracted`로 고정하고 retry도 같은 sequence를 결정적으로 순환함. `Math.random`과 신규 dependency는 사용하지 않음
- DAY 2 전용 hook은 raw unrounded duration을 monotonic `performance.now()`로 측정하고 synchronous active ref guard, background invalid, 날짜 변경 전체 restart와 visibility/date race 단일 확정을 구현함
- distracted trial에 interaction target이 아닌 `aria-hidden` particle 4개를 서로 다른 비정수 duration으로 표시함. particle은 CTA와 분리하고 위치·속도·trajectory는 raw evidence에 저장하지 않음
- reduced-motion에서도 동일 particle DOM과 distracted condition을 유지하되 CSS media query로 이동 거리 축소·duration 완화를 적용함. blink/flash/scale/rotation은 사용하지 않으며 정책을 QA_SPEC에 기록함
- 완료 시 기존 `DailyRecord` 구조로 `analysisDay: 2`, 안정적 `${sessionId}:day2` recordId와 raw result를 생성하고 runtime validation을 거친 root만 저장함
- DAY 2 mutation은 기존 `StorageMutationCoordinator`의 FIFO 저장 경로를 사용함. 실패 시 같은 record/data와 새 DerivedAnalysis를 메모리에 유지하고 `다시 저장`하며 새 recordId나 재측정을 만들지 않음
- persisted baseline raw는 보존하고 dailyRecords에 DAY 2만 append함. `deriveAnalysis()` replay로 Time만 보정하며 Center/Balance/Control/Focus 불변과 baseline raw 불변, DAILY ±8 cap, 결정성을 테스트함
- 결과 화면은 평소/방해 평균 absolute error, signed error 방향, distraction delta, engine tendency eligibility/fallback, Time 점수 변경/유지와 기존 baseline 관계를 표시함
- Basic Analysis/내 분석서는 저장된 baseline+dailyRecords replay 결과와 `심화 분석 1/5`를 표시함
- DAY 2 다음 유효 날짜는 STATE C로 해금하되 DAY 3 실제 검사는 구현하지 않고 준비 placeholder만 연결함. 날짜 역행은 기존 deriveUserState 계약대로 unlock하지 않음
- 실제 Apps in Toss native Storage bridge의 강제 종료/재실행 QA는 이번 구현과 별개의 출시 전 실제 기기 TODO로 계속 유지함
- 독립 코드 리뷰 결과 Critical 0건, Major 1건, Minor 0건을 확인하고 signed shift 중립 방향 표시 오류를 수정함
- presentation helper가 signed shift를 exact `< 0 → earlier`, `> 0 → later`, `=== 0 → neutral`로 분리하며 NaN/Infinity는 정상 카피로 보내지 않음
- absolute-error degradation eligibility는 그대로 유지하고, eligible degradation + neutral direction에서는 빠름/늦음을 만들지 않고 오차 폭 증가와 방향 불명확 카피를 표시함
- scoring, tendency predicate, measurement protocol, Storage, DAY 1은 변경하지 않음
- 전체 검증: typecheck, lint, 40 files / 251 tests, build:web, build:ait, build, `git diff --check` 통과
- 13단계 DAY 2 구현 및 리뷰 수정을 종료하고 DAY 2 실기 QA 진행 가능

## 26. 13.5단계 DAY 2 UX/측정 강도 보정

- distracted particle 4개와 DOM/raw condition은 유지하면서 일반 motion의 이동 폭을 확대하고 particle별 다중 방향 경로를 분리함
- 1초/3초 cue, blink/flash/scale/rotation과 CTA interaction 방해는 추가하지 않음
- reduced-motion은 기존 media query와 동일 particle DOM을 유지하고 작은 이동 폭·느린 duration의 완화 motion을 계속 제공함
- DAY 2 결과 primary를 plain/distracted 조건 비교로 바꾸고 2-column 카드에 평균 오차와 차이를 `ms` 단위로 표시함
- eligibility 미달의 작은 차이는 실제 magnitude와 함께 안내하고, Time Ability 점수 변화는 별도 secondary section으로 낮춤
- 오차가 증가했지만 Time 점수가 개선된 경우 기존 점수 결과는 유지하고 일관성도 함께 반영한다는 presentation 보조 카피만 추가함
- scoring/calibration, DAY 1 protocol, DAY 2 raw/Storage/schema/assessmentType은 변경하지 않음
- 35ms/45ms/+10ms fixture, small-difference copy, score secondary hierarchy, 95→96 기존 scoring 불변과 보조 카피 회귀 테스트를 추가함
- 전체 검증: typecheck, lint, 40 files / 252 tests, build:web, build:ait, build, `git diff --check` 통과

## 27. 14단계 DAY 3 시각 유도 편향 추가 분석 구현

- DAY 2 다음 유효 날짜를 DAY 3 Intro → plain/decoratedLeft/decoratedRight 중심 선택 → 결과로 연결함
- stimulus ID와 attempt index 반복, 좌측 circle 5개/exact mirror geometry 및 exact center runtime invariant를 고정함
- 기존 normalized Center coordinate helper, pointer 단일 입력, duplicate/background/date race 방지를 적용하고 DAY 3만 restart함
- `analysisDay: 3` record를 기존 `prepareDailySave`/`StorageMutationCoordinator`로 append하고 실패 시 동일 payload를 retry함
- baseline/DAY 2를 보존하고 `deriveAnalysis()`로 Center만 갱신하며 다른 네 Ability와 DAILY ±8 cap을 검증함
- visual bias를 left/right/up/down/neutral 5-state로 분리하고 zero/axis tie neutral 및 eligible+neutral을 지원함
- DAY 1 무장식 vs DAY 3 장식 비교, direction/magnitude/diagram을 primary로, Center score를 secondary로 표시함
- 저장 후 심화 분석 2/5, 같은 날 STATE D, 다음 유효 날짜 DAY 4 placeholder와 rollback unlock 금지를 적용함
- DAY 2 Minor 의미 label은 범위 확대를 피하기 위해 TODO로 유지함
- Apps in Toss native Storage bridge 강제 종료/재실행 QA TODO를 유지함
- 전체 검증: typecheck, lint, 45 files / 272 tests, build:web, build:ait, build, `git diff --check` 통과

## 28. 14단계 독립 코드 리뷰 수정 및 종료

- 독립 리뷰 결과 Critical 0건, Major 1건, Minor 1건을 확인함
- Major였던 DAY 3 결과 diagram/legend marker mapping을 전용 semantic legend class로 수정함
- diagram marker와 legend marker가 같은 CSS selector declaration을 공유해 baseline/day3/true-center 색상과 테두리 drift를 방지함
- Minor였던 diagram 접근성을 `role="img"`와 DAY 1 평균, DAY 3 장식 평균, 실제 중심을 설명하는 accessible name으로 보강함
- scoring, direction/magnitude, raw evidence, stimulus, Storage, DAY 1/2는 변경하지 않음
- 전체 검증: typecheck, lint, 45 files / 273 tests, build:web, build:ait, build, `git diff --check` 통과
- 14단계를 종료하고 DAY 3 실기 QA 진행 가능

## 29. 15단계 DAY 4 다중 분배 성향 추가 분석 구현

- DAY 3 다음 유효 날짜를 DAY 4 Intro → horizontal 3등분 2회 → 결과로 연결함
- raw는 기존 `balanceThreeWay`와 `cutPositions`만 사용하고 condition/orientation/stimulusId/configId를 추가하지 않음. conditionMinimum 없음도 유지함
- CONFIG_A `0.28/0.72`, CONFIG_B `0.38/0.62`를 전체 attempt index 기준 A/B로 반복하며 valid count와 `Math.random`을 사용하지 않음
- single active pointer, 두 divider drag, crossing/열린 경계 차단, slider keyboard 조작과 confirm-only raw 생성 및 synchronous double-confirm guard를 구현함
- RUNNING target guide/grid/snap/proximity feedback를 노출하지 않고 결과에서만 실제 평균 segment와 33.3% 기준을 비교함
- background/date invalidation, retry 최대 5회, incomplete와 DAY 4 전체 restart를 기존 completion 계약으로 처리하며 DAY 1~3 기록을 유지함
- `analysisDay: 4` record를 기존 `prepareDailySave`/`StorageMutationCoordinator`로 append하고 실패 시 동일 payload를 재저장함
- 기존 `deriveAnalysis()`로 Balance만 갱신하고 terminal bias와 condition sensitivity 분리를 포함한 scoring 계약을 변경하지 않음
- 결과는 3등분 분배 패턴을 primary, DAY 1 2등분 대비 오차를 비교 근거, Balance score를 secondary로 표시함
- 저장 후 심화 분석 3/5, 같은 날 STATE D, 다음 유효 날짜 DAY 5 placeholder를 연결함. DAY 5 실제 검사는 구현하지 않음
- Apps in Toss native Storage bridge 강제 종료/재실행 QA TODO를 유지함
- 전체 검증: typecheck, lint, 51 files / 288 tests, build:web, build:ait, build, `git diff --check` 통과

## 30. 15.5단계 DAY 4 결과 해석 UX 보정

- scoring/raw/calibration/Storage를 변경하지 않고 DAY 4 presentation만 보정함
- 전체 multiPartitionBias eligibility와 마지막 구간 방향 표시를 분리하고, `abs(terminalBias) / BALANCE_ERROR_WORST`에 기존 `TENDENCY_DISPLAY_THRESHOLD`를 적용함
- terminal component가 기준 미만이면 sign만으로 크게/작게를 단정하지 않고 뚜렷한 한쪽 편향 없음 카피를 표시함
- primary insight를 기존 Balance condition sensitivity 기준에 따른 DAY 1 2등분 대비 DAY 4 3등분 안정성으로 변경함
- valid trial별 분배, 평균, 33.3% 기준을 함께 표시하고 기준 양쪽으로 흔들린 segment가 있으면 평균 상쇄 설명을 제공함
- QA fixture의 Balance 93→88과 기존 수학 결과가 그대로임을 회귀 테스트로 고정함
- 전체 검증: typecheck, lint, 52 files / 293 tests, build:web, build:ait, build, `git diff --check` 통과

## 31. 16단계 DAY 5 surprise control degradation 추가 분석 구현

- DAY 4 다음 유효 날짜를 DAY 5 Intro → predictable/surprise control 4회 → 결과로 연결함
- left-to-right `0.08→0.92`와 네 exact config `.58/.32→.32/null`, `.58/.32→.50/.45`, `.68/.40→.40/null`, `.68/.40→.24/.50`를 전체 attempt index로 반복함
- normalized transition time을 initial speed 기준 가상 전체 이동시간의 비율로 해석하고 monotonic clock 기반 piecewise movement를 raw/visual 공통 source로 사용함
- exact end와 이후를 `insufficientObservation`으로 처리하고 stop/RAF/background/date race를 synchronous active guard로 단일 확정함
- predictable은 동일 pre/post speed와 null change, surprise는 다른 speed와 열린 범위 change time을 runtime validator에서 강제함
- 기존 completion의 target 4/minimum valid 3/condition별 최소 1/max 7과 retry sequence를 재사용함
- `analysisDay: 5` DailyRecord를 기존 prepareDailySave/StorageMutationCoordinator로 append하고 실패 시 동일 payload를 재저장함
- deriveAnalysis로 Control만 갱신하고 Time/Center/Balance/Focus와 DAY 1~4 raw record를 유지함
- 결과 primary는 predictable/surprise 평균 정지 오차와 증감이며 Control score는 secondary, 심화 분석 4/5를 표시함
- 같은 날 STATE D, 다음 유효 날짜 DAY 6 placeholder를 연결하고 DAY 6 실제 검사는 구현하지 않음
- scoring/calibration/raw/Storage schema/dependency는 변경하지 않음
- 전체 검증: typecheck, lint, 56 files / 310 tests, build:web, build:ait, build, `git diff --check` 통과

## 32. 16단계 DAY 5 독립 코드 리뷰 수정 및 종료

- 독립 리뷰 결과 Critical 0건, Major 2건, Minor 2건을 모두 수정함
- DAY 5 exact config의 단일 domain tuple과 attempt-index validator를 추가하고 `day5_control_surprise` completion 경계에서 valid/invalid 모든 attempt의 exact sequence를 검사함
- generic `ControlConditionTrial` validator는 다른 assessment/final 재사용을 위해 기존 predictable/surprise invariant 그대로 유지함
- persisted DAY 5 payload는 기존 Storage schema의 `validateCompletion` 경로로 같은 exact config 검증을 거치며 불일치는 throw 없이 `corruptData`로 거부함. Storage schema 구조는 변경하지 않음
- DAY 5 RAF chain에 generation과 trialId identity를 캡처해 stop/end/background/date change/unmount 뒤 전달된 stale callback이 다음 trial marker, raw, scheduler를 변경하지 못하게 함
- surprise config 2/4의 transition 직전·exact·직후 연속성 회귀 테스트를 추가함
- engine tendency eligibility가 false이면 nonzero raw delta도 `변화 거의 없음`으로 표시하며 새 threshold를 추가하지 않음
- DAY 5 다음 placeholder가 DAY 6와 DAY 1~5 기록 유지를 명확히 안내하도록 수정함. DAY 6 assessment는 구현하지 않음
- scoring/calibration, raw/Storage schema, DAY 1~4 protocol, dependency 변경 없음
- 전체 검증: typecheck, lint, 56 files / 319 tests, build:web, build:ait, build, `git diff --check` 통과
- DAY 5 실기 QA 진행 가능

## 33. 16.6단계 DAILY Ability Scoring V2 의미 정합성 수정

- DAY 2~5의 absolute daily equivalent 75/25 재측정을 제거하고 reference/challenge condition effect modifier로 전환함
- `conditionEffect = clamp((referenceMeanError - challengeMeanError) / ABILITY_ERROR_WORST, -1, 1)`, `dailyDelta = round(effect * 8)`, `updatedAbility = clamp(DAY 1 baseline + delta, 0, 100)`을 적용함
- DAY 2 plain/distracted, DAY 3 DAY3 plain/decorated, DAY 4 DAY1 two-way/DAY4 three-way, DAY 5 predictable/surprise mapping을 고정함
- 현재 Ability에 누적하지 않고 항상 DAY 1 baseline을 기준으로 하며 DAILY consistency composer를 만들지 않음
- DAY 5 CASE A/B/C는 94/94/91, QA 19%/19% fixture는 Control 94 유지로 고정함
- `CALIBRATION_VERSION = 2`; Storage schemaVersion, raw schema/migration, mutation coordinator 변경 없음
- DAY 1 normalizer/protocol, DAY 2~5 measurement protocol, DAY 7 80/20 및 ±6 공식 변경 없음
- DAY 6 modifier는 실제 구현 전 확정하며 이번 단계에서 임의 공식을 추가하지 않음
- 전체 검증: typecheck, lint, 57 files / 331 tests, build:web, build:ait, build, `git diff --check` 통과

## 34. DAY 5 마지막 trial 결과 UX 수정

- DAY 5의 모든 측정 attempt는 completion 여부와 무관하게 RUNNING 뒤 TRIAL RESULT를 표시하도록 UI phase 전환을 분리함
- 첫 3회는 기존 `다음 측정`, retry 가능 invalid attempt는 기존 `다시 측정`, completion을 만족한 마지막 result는 `결과 보기` CTA를 사용함
- 마지막 result에서 해당 trial의 목표 위치, 실제 정지 위치와 오차를 표시한 뒤 사용자 CTA 선택으로 COMPLETE에 진입함
- completion이 attempt 5~7에서 성립하는 retry 흐름도 마지막 attempt RESULT 뒤 COMPLETE에 진입함
- result CTA 중복 호출은 raw trial을 추가하지 않으며 마지막 저장 trial 수는 기존 계약대로 유지함
- completion 판단, DAY 5 config, raw evidence, scoring/calibration, Storage는 변경하지 않음
- 전체 검증: typecheck, lint, 57 files / 334 tests, build:web, build:ait, build, `git diff --check` 통과

## 35. 17단계 DAY 6 순간 위치 기억 추가 분석 구현

- Focus supporting evidence로 DAY 6 spatial memory를 구현했으며 여섯 번째 Ability는 추가하지 않음
- spread A와 clustered B exact normalized 좌표를 attempt index A/B/A/B/A로 결정적으로 사용
- 1200ms exposure → 300ms blank → 정답 없는 3-tap recall → 모든 attempt의 trial result 흐름 구현
- generation guard와 monotonic response timer로 stale timer, background/date race, unmount cleanup 처리
- 사용자 선택 순서를 raw로 보존하되 3! permutation minimum total Euclidean matching과 lexicographic tie-break로 결과 계산
- DAY 6 completion boundary에서 exact config/retry identity를 검증하고 analysisDay 6 DailyRecord를 기존 Storage coordinator 경로로 저장
- spread reference/clustered challenge의 V2 modifier를 DAY 1 Focus baseline에 적용하고 Time/Center/Balance/Control은 유지
- 결과 primary는 spread/clustered 평균 위치 오차, Focus score는 secondary이며 심화 분석 5/5 표시
- DAY 6 완료 당일 STATE D, 다음 유효 날짜 STATE E와 DAY 7 최종 보정 placeholder 연결
- CALIBRATION_VERSION 2, raw/schema/migration/dependency 변경 없음
- Apps in Toss native Storage 강제 종료/재실행 QA TODO 유지
- 전체 검증: typecheck, lint, 61 files / 353 tests, build:web, build:ait, build, `git diff --check` 통과

## 36. 17단계 DAY 6 독립 코드 리뷰 수정 및 종료

- 독립 리뷰 결과 Critical 0건, Major 1건, Minor 1건을 확인하고 수정함
- invalid retry 뒤에도 원본 전체 attempt index를 보존해 spread A와 clustered B 결과 집계가 뒤집히지 않도록 수정함
- config의 공통 `isDay6SpreadAttempt` helper를 presentation, Focus modifier와 tendency에서 재사용해 condition identity를 정렬함
- invalid A → valid B → valid A fixture로 2%/8% 비교, primary headline, Focus 방향과 다른 네 Ability 불변을 검증함
- DAY 6 결과 화면 전용 테스트를 추가하고 정상 A/B, score secondary와 심화 분석 5/5를 고정함
- SCORING_SPEC의 옛 absolute spatialMemoryQuality tendency를 spread/clustered V2 error difference 계약으로 정리함
- blank background와 stale blank callback 테스트에서 발견된 optional `responseTimeMs: undefined` raw key를 생략해 invalid attempt가 정상 retry되도록 수정함
- scoring/calibration/raw schema/Storage와 DAY 1~5 protocol은 변경하지 않음
- 전체 검증: typecheck, lint, 62 files / 357 tests, build:web, build:ait, build, `git diff --check` 모두 통과

## 37. 20.1단계 Assessment Visual Identity Upgrade

- 공통 paper shell/header/progress/CTA/safe area와 ivory/navy/emerald 체계는 유지하고 READY hero만 검사별 장비로 분리함
- `AssessmentInstruments.tsx`에 Time/Center/Balance/Control/Focus/Memory 순수 장식 컴포넌트와 공통 ready content를 추가함
- Time은 3.000 REFERENCE stopwatch dial, RUNNING empty dial, RESULT calibrated target/actual scale을 사용함
- Center는 정답점 없는 optical frame, Balance는 partition rail/handle, Control은 movement rail/ticks, Focus는 실제 stimulus와 무관한 neutral matrix를 사용함
- Memory는 실제 spread A/clustered B와 다른 dummy constellation만 READY에 사용하며 exposure/blank/recall protocol은 유지함
- DAY 7 READY는 FINAL CALIBRATION masthead와 selector가 고른 ability의 동일 instrument identity를 함께 사용함
- measurement geometry/config/raw/scoring/storage/navigation/state machine은 변경하지 않음
- contamination test와 320/390px 및 낮은 화면 responsive boundary를 추가함

## 38. 20.2단계 Safe Deterministic Stimulus Variation

- dependency 없는 FNV-1a 기반 `selectDeterministicVariant`를 추가하고 invalid count/index를 명시적으로 거부함
- 동일 session/assessment/attempt는 같은 0..3 skin, retry는 valid count가 아닌 전체 attempt index의 다음 skin을 사용함
- DAY1/DAY3 Center는 approved/exact stimulus geometry를 유지하고 outer frame만 변형함
- DAY1/DAY4 Balance는 orientation/config/cut을 유지하고 shell/outline만, DAY1/DAY5 Control은 exact movement tuple을 유지하고 rail tick/frame만 변형함
- Focus는 calibration-equivalence 문서 근거가 없어 session config offset을 적용하지 않고 1→2→3 순서와 identical item style을 유지함
- DAY6 Memory는 A/B/A/B/A와 exposure 1200ms/blank 300ms/recall ghost 금지를 유지하고 panel/result line shell만 변형함
- DAY7은 exact config와 FINAL frame을 유지하며 선택 arm의 decorative skin만 적용함
- visual variant는 raw/storage/debug analytics에 저장하지 않으며 completed-assessment checkpoint 계약에 영향을 주지 않음
- Chromium 실행 파일은 확인했으나 자동 화면 상태 fixture가 없어 요청된 360×800 attempt matrix 캡처는 native/manual visual QA 대상으로 남김
- 전체 검증: typecheck, lint, 69 files / 396 tests, build:web, build:ait, build, `git diff --check` 통과

## 39. 20.3단계 Analysis Report Polish

- Basic/Final hero에 실제 `DerivedAnalysis.scores` 5개를 그대로 표시하는 compact summary를 추가하고 profile high/low만 강점/보완 marker로 사용함
- overall dial의 calibrated ring/minor-major reference와 profile statement hierarchy를 정리함
- fictional certification seal은 유지하고 label/name/supporting copy를 별도 wrapper에 배치해 320~430px 긴 자격명 wrapping과 seal 겹침을 방지함
- Basic raw evidence는 기존 `summarizeDay1Evidence` 문자열을 primary/secondary report row로 분리 표시하며 수치 계산은 추가하지 않음
- Basic Manual은 기존 강점/보완/취급 주의 카피를 STRENGTH/WATCH/CAUTION 문서 행으로 정리함
- DAY2~6은 공통 daily report spacing, condition A/B header, delta, secondary Ability card 시각 문법을 적용함
- Final은 `FINAL REPORT / 7 / 7 COMPLETE`, compact abilities, 3개 final metric certificate cells, analysis-note Cross Insight, compact evidence disclosure와 action hierarchy를 적용함
- details/summary, heading, disabled share, seal `aria-hidden` 의미는 유지함
- scoring/calibration/profile/certification/Cross Insight/raw/storage/navigation/state machine은 변경하지 않음
- 360×800 screenshot matrix는 assessment/report fixture route가 없어 20.4 native/manual QA 대상으로 유지함
- 전체 검증: typecheck, lint, 69 files / 396 tests, build:web, build:ait, build, `git diff --check` 통과

## 40. 20.5단계 Release Visual Fix

- Basic/Final 공통 certification hero를 absolute seal 배치에서 seal 전용 responsive grid column으로 전환함
- seal은 320/360/390/430에서 hero 내부에 유지되며 원주 문구·mark 크기를 container 폭에 맞춰 축소하고 fictional seal `aria-hidden`을 유지함
- 긴 certification name은 `min-width: 0`과 `word-break: keep-all`로 본문 column 안에서 wrapping하며 seal과 겹치지 않음
- Final evidence summary의 title/value를 별도 flex node로 분리하고 대표값 tabular-nums와 native details/summary semantics를 유지함
- 360/390/430은 의미 선두를 보존하는 title ellipsis 단일 행, 320은 안전한 2행 구조로 표시하며 title/value overlap은 0임
- DAY 3 true center/DAY 1 average/DAY 3 average는 실제 좌표를 offset하지 않고 fill/stroke/dashed concentric ring/z-index로 구분함
- Final Calibration heading은 keep-all responsive heading으로 마지막 음절 orphan을 제거하고 DAY 5 condition header도 keep-all/small type으로 정리함
- Final report section/card 반복 여백을 줄여 360px fixture 높이를 약 2841px로 정리함
- scoring/calibration/raw/storage/schema/selector/config/measurement/timing/result/evidence/share state는 변경하지 않음
- Chromium 360×800 필수 7장과 320/390/430 추가 폭을 확인했으며 모든 장면에서 horizontal overflow 없음
- 전체 검증: typecheck, lint, 70 files / 398 tests, build:web, build:ait, build, `git diff --check` 통과
- 다음 작업: Share Integration + Apps in Toss Native QA

## 41. 21단계 Apps in Toss Share Integration

- 설치된 `@apps-in-toss/web-framework@3.0.2` 타입에서 `share({message})`, `getTossShareLink(path, ogImageUrl?)`와 최신 `Share.sendMessage`/`Share.createLink` 지원을 직접 확인함
- UI의 SDK 직접 호출을 제거하기 위해 최소 `SharePort`, `createAppsInTossShare`, Basic/Final share message builder를 `src/infrastructure/share/`에 추가함
- production adapter는 최신 `Share.sendMessage({message})`를 사용하며 Chromium용 `navigator.share`/local fallback은 추가하지 않음
- 저장소에 출시 전 private test scheme/deploymentId 계약이 없으므로 기본 adapter는 message-only로 구성하고 임의 deep link를 생성하지 않음
- `createAppsInTossShare({deepLink})`로 test 또는 production deep link를 명시적으로 주입할 수 있으며, 이때 `Share.createLink` 성공 결과만 메시지에 포함함
- link 생성 실패는 silent message fallback 없이 share 전체 error로 전달함. public OG asset이 없어 OG URL은 추가하지 않음
- Basic 메시지는 기본 분석/overall/profile display/representative certification display만, Final은 최종 분석/7일 완료/overall/profile/certification만 포함함
- 메시지는 동일 DerivedAnalysis에 대해 결정적이며 sessionId/recordId/localDateKey/raw/timestamp/engine/content/storage key를 포함하지 않음
- Basic/Final CTA를 활성화하고 idle/sharing/error 상태, synchronous double-click guard, sharing disabled, rejection 재시도와 결과 화면 유지를 구현함
- share Promise resolve는 전송 완료로 표현하지 않고 성공 toast를 표시하지 않음
- 공유 전후 Storage root 불변을 App final flow에서 검증함
- scoring/measurement/raw/storage/schema/navigation/progression/FinalRecord/STATE F/reload는 변경하지 않음
- Native QA TODO: Toss Sandbox Basic/Final share sheet, Android/iOS, 실제 메시지, private test link 클릭과 앱 진입, 취소/재시도, Storage root 불변
- 전체 검증: typecheck, lint, 73 files / 406 tests, build:web, build:ait, build, `git diff --check` 통과
- 다음 작업: 22단계 Apps in Toss Native QA

## 42. 20.6단계 Final Art Direction Pass

- Home의 공통 dial을 시간·중심·균형·통제·집중 5축을 읽을 수 있는 branded scan instrument로 교체하고 기존 hero/CTA 구조는 유지함
- Time 숫자 중앙에 paper clear zone을 확보해 calibration tick을 outer ring으로 한정하고 RUNNING empty dial에는 countdown/progress를 추가하지 않음
- Center optical frame과 실제 input surface의 depth/stroke를 분리하고 center cue는 추가하지 않음
- Balance tick 밀도를 낮추고 divider rail/handle을 정리했으며 RUNNING target guide는 없음
- Control rail의 start/end cap과 tick hierarchy를 정리하고 proximity feedback은 추가하지 않음
- Focus READY dummy matrix와 RUNNING grid의 surface family만 연결하고 실제 target preview/정답 강조는 추가하지 않음
- DAY3 동일 좌표 marker를 offset 없이 dash/fill/concentric ring/z-index로 구분하고 legend mapping을 유지함
- DAY5 360px condition header, DAY6 result matching line, Final Calibration heading wrapping을 polish함
- Basic/Final report hero와 technical chapter divider/document rhythm을 통일하고 evidence details/summary 의미는 유지함
- 320/360/390/430 Chromium QA에서 horizontal overflow, certification seal overflow, evidence title/value overlap이 모두 0임
- scoring/measurement/raw/storage/schema/navigation/state/CTA/protocol/contamination contract는 변경하지 않음
- Current: 20.6 Final Art Direction Pass 완료
- Next: Apps in Toss Native QA

## 43. 29.0 Retention & Completion Polish

- DAY1 Basic에 1차 분석, 결정적 프로필·강점·보완, `DAY 1 / 7`, DAY2 조건 예고를 추가함
- DAY2~6 결과 hero는 공통 `DailyDiscoveryPanel`로 오늘의 발견, `DAY n / 7`, 다음 DAY 조건 예고를 표시함
- DAY6 예고는 selector ability를 노출하지 않고 누적 기록 기반 마지막 보정만 안내함
- DAY7 Final은 `DAY 7 / 7 · 7일 분석 완주`와 최종 사용설명서 완성 보상을 표시하고 다음 예고는 두지 않음
- Returning HOME은 현재 완료 DAY와 다음 분석의 지금 가능/다음 날짜 잠금/전체 완주 상태를 표시함
- 승인된 INTRO poster pixel은 유지하고 접근성 summary에 DAY1→6→7 흐름만 보강함
- Basic/Final share payload는 이미 짧고 결정적이며 민감 정보가 없어 변경하지 않음
- scoring/selector/raw/storage/schema/date unlock/protocol/dependency는 변경하지 않음
- 자동 browser/CDP 실행 환경이 없어 360/412 narrative screenshot은 후속 native/manual QA로 남김

## 44. 30.0 Brand + Share + Release Polish

- Apps in Toss `brand.primaryColor`를 실제 primary CTA token인 `#103F38`로 변경함
- production HTML document language를 `ko`로 맞추고 title `쓸능검`은 유지함
- Vite 보라색 favicon을 emerald/gold `ㅎ` web favicon으로 교체함. Console 업로드용 앱 아이콘은 별도 P0 external task임
- Basic share 제목에 `DAY 1`을 명시하고 Final/7일 완료 표현이 섞이지 않도록 금지 회귀를 추가함
- Final share는 기존 overall/profile/representative certification/7일 완료 payload를 유지함
- share에 internal identifier가 포함되지 않는 금지 회귀 목록을 확대함
- production `dist`와 `.ait`에서 QA URL, fixture, screenshot, CDP/PowerShell script, debug harness, source map이 없음을 확인함
- 미사용 `home-reference-hachannyeok.png`는 runtime reference가 없고 용량 한도 blocker가 아니므로 history asset으로 유지함
- deep link는 production 미설정/P2 optional 상태를 유지함
- typecheck, lint, 77 files / 418 tests, web/AIT/전체 build, `git diff --check` 통과

## 45. 31.0 Final 7-Day Change Map Polish

- Final hero와 최종 5개 능력치 사이에 `7일 변화 지도`를 추가해 DAY1 baseline과 Final score를 5개 horizontal row로 비교함
- 각 row는 기존 `DerivedAnalysis.baselineScores`와 `scores`만 사용하며 UI에서 raw replay나 score 재계산을 하지 않음
- 변화량은 두 engine output의 표시용 차이로 `+`, `-`, `0`을 중립적으로 표현하고 성장/향상 claim을 사용하지 않음
- `selectedFinalAbility` row에만 `DAY 7 보정` badge를 표시하며 preFinal→final 숫자는 기존 Calibration Summary에만 유지함
- DAY1/Final dot, 변화 segment, 숫자 label과 접근 가능한 변화 설명을 함께 제공함
- report index를 Change Map 01, Final Ability 02, Cross Insight 03, Evidence 04로 정리함
- scoring/raw/storage/schema/selector/final calibration/measurement/share/dependency는 변경하지 않음
- typecheck, lint warning 0, 78 files / 420 tests, web/AIT/전체 build, `git diff --check` 통과

## 46. 32.1 Final App Icon 적용

- 사용자 원본 `/mnt/c/Users/jinsung/Downloads/h-logo.png`을 확인하고 바이트 변경 없이 `public/assets/brand/h-logo.png`로 복사함
- 원본/프로젝트 복사본 SHA-256은 모두 `e4c3a2d4dc9d4b550addc380a39182dab492246310cb30cd5d6226c745aaf4f7`임
- source는 1254×1254, PNG, 8-bit RGB, alpha 없음, 2,336,798 bytes임
- 256/128/64/48 preview는 `artifacts/icon-32.1/`에만 생성했으며 원본은 수정하지 않음
- 256/128은 계측기 눈금과 seal이 명확하고 64/48은 세부가 축약되지만 중앙 `ㅎ`와 emerald/gold 대비가 유지되어 A 판정함
- 작은 browser tab에는 기존 단순 emerald/gold SVG가 더 적합해 favicon은 유지함
- Console 요구 규격 확인 전 임의 512/1024 export는 하지 않으며 이 PNG를 최종 Console icon source 후보로 기록함

## 47. 33.0 First-user UX Audit 준비

- 실제 first-user 참가자는 아직 0명이며 사용자 검증 완료나 KPI 달성을 주장하지 않음
- `artifacts/first-user-33.0/`에 fresh, Basic, DAY2~7 직전 상태를 여는 Memory-storage QA launcher를 추가함
- fixture progression은 기존 baseline/DAY2~6 fixture와 실제 App navigation을 사용하며 production 날짜 unlock/storage/scoring을 변경하지 않음
- 참가자에게 허용된 한 문장, 무개입 관찰 순서, 단계별 moderator URL을 `MODERATOR.md`에 기록함
- 개인 기록지와 공통 이슈/KPI 집계 문서를 추가하고 초기 값은 participants 0, metrics not measured로 유지함
- Vite server에서 8개 stage HTML과 QA entry module HTTP 200 smoke test를 완료함
- QA harness는 `artifacts`에 격리되어 production `dist` contamination이 0임을 확인함
- product code 변경 없음. typecheck, lint, build:web, `git diff --check` 통과

## 48. 34.0 Final Completion Motion Polish

- 기존 DAY7→Final navigation과 Final first render를 유지하고 `final-completion-motion` namespace만 Final root에 추가함
- technical header 180ms, completion status/copy 310~350ms, overall/profile 440ms, calibration/seal 380~470ms, Change Map 500ms 이내의 opacity/transform reveal을 적용함
- 점수 count-up, marker 이동, 숫자 interpolation, overlay, splash, interaction block은 추가하지 않음
- motion 중에도 모든 Final 데이터와 Share/Home interaction DOM은 첫 render부터 존재함
- `prefers-reduced-motion: reduce`에서는 Final animation을 제거하고 opacity/transform을 즉시 settled 상태로 보장함
- DAY1~6/measurement selector에는 motion class가 없고 Final namespace 밖 generic animation을 추가하지 않음
- selected Ability, preFinal/final, Change Map, Share, reload, storage/scoring 불변과 Basic 비적용 회귀를 검증함
- typecheck, lint warning 0, 78 files / 421 tests, web/AIT/전체 build, `git diff --check` 통과
- 320/360/390/412/430 실제 timing screenshot은 실행 가능한 browser/CDP가 없어 native/manual QA로 남김

## 49. 35.0 Signature Screen Audit

- DAY3 Decorated RUNNING은 비대칭 decoration 자체가 DAY1 Center와 구분되고 center cue 없이 optical tension을 형성해 수정하지 않음
- DAY4 Three-way RUNNING은 실제 두 divider와 세 segment가 주인공이며 thirds target guide 없이 DAY1 2분할과 구분되어 수정하지 않음
- DAY6 Recall RUNNING은 Exposure/Blank/Recall phase, empty memory surface, 선택 count가 고유하고 ghost/guide/matching line이 없어 수정하지 않음
- DAY5 Surprise RUNNING만 DAY1 Control rail과 캡처 구조가 유사해 고정 `CONDITION / VARIABLE MOTION` badge와 emerald/gold technical frame을 추가함
- DAY5 badge는 모든 arm에 동일하고 predictable/surprise, speed, transition timing을 노출하지 않으며 flash/shake/glow/marker color change가 없음
- DAY5 target/marker/stop CTA/position calculation/piecewise speed/raw protocol은 변경하지 않음
- 신규 screen regression으로 badge, arm 비노출, speed/proximity/transition cue 0을 확인함
- typecheck, lint warning 0, 79 files / 422 tests, web/AIT/전체 build, `git diff --check` 통과
- 실제 360/412 signature contact sheet는 실행 가능한 browser/CDP가 없어 native/manual QA로 남김

## 55. 41.0 Unfinished UI Cleanup

- HOME의 disabled `오늘의 추가 검사 보기` overlay를 DOM/CSS에서 제거함
- raster HOME poster도 해당 문구·밑줄·화살표 영역만 아이보리 여백으로 정리하고 941×1672 구성을 유지함
- Basic Analysis의 disabled `상세 분석 보기`, `상세 분석은 준비 중입니다.`와 orphan 가능성이 있던 `aria-describedby` 연결을 제거함
- HOME primary CTA, Basic 공유/Home, `DAY 1 / 7`, DAY2 teaser와 기존 progression callback은 유지함
- runtime unfinished 문자열 재검색 결과 사용자 노출 항목은 0이며, 남은 unavailable/placeholder 용어는 domain 상태명·CSS class·테스트명임
- scoring/raw/storage/date unlock/selector/Final/share/navigation state machine/dependency는 변경하지 않음
- typecheck, lint warning 0, 80 files / 434 tests, web/AIT/전체 build, `git diff --check` 통과
- 실제 browser가 없어 360×800 / 412×786 runtime screenshot은 미실행하고 자산 및 DOM/CSS 구조로 검증함

## 56. 42.0 Final Share Image Card

- Final Share section에 4:5 비율의 deep emerald `최종 결과 요약 카드` preview를 추가함
- 카드는 기존 `DerivedAnalysis`의 overall/profile/certification/finalMetrics/baselineScores/preFinalScores/scores/selectedFinalAbility만 사용함
- `mostPositivelyUpdated`가 selected면 그 기존 metric ability의 DAY1→Final을 `7일 대표 변화`로 표시함
- positive metric이 없으면 새 ranking 없이 selected Final Ability의 preFinal→final을 `마지막 보정`으로 표시함
- positive/negative/zero는 모두 `변화 +N/-N/0` 중립 copy와 실제 0~100 dual-marker 위치로 표현함
- 접근성 label에 카드 전체 결과를 텍스트로 제공하고 session/record/user/device/deployment/timestamp/raw 식별정보를 포함하지 않음
- installed SDK 3.0.2의 `Share.sendMessage`는 message-only이고 Blob/File/Data URL 첨부 API가 없어 기존 text share fallback을 유지함
- `Share.createLink({ogImageUrl})`은 deep link + 원격 OG URL 계약이므로 이번 범위에 연결하지 않음. 추가 permission은 없으나 native image attachment는 지원 확인 불가가 아니라 현 타입상 미지원임
- 새 dependency, backend, deep link, download, scoring/storage/finalRecord/share payload 변경 없음
- Chromium/Firefox/Playwright/Puppeteer/SVG→PNG converter가 없어 1080×1350 PNG 및 360/412 capture는 미생성하고 DOM/render 단위로 검증함
- typecheck, lint warning 0, 81 files / 439 tests, web/AIT/전체 build, `git diff --check` 통과

## 57. 43.0 Native Release Candidate QA

- Android SDK/ADB는 설치되어 있으며 sandbox 밖 daemon은 정상 시작했지만 `adb devices -l` 결과 연결 device/emulator가 0대라 실제 Apps in Toss Sandbox 실기는 수행하지 못함
- iOS tool/device, Toss login, Sandbox version, Console context 및 배포 token/profile도 확인되지 않음
- 제품 code는 변경하지 않고 `artifacts/native-43.0/QA.md`에 RC identity와 native-only test matrix를 기록함
- 최종 RC `hachannyeok.ait`: 8,332,672 bytes, SHA-256 `b24dabda6cc20e03dcb077b4e0fe8ff3918fe6f5c3a11f05bdde99c6875b8aa2`
- 최종 build deploymentId: `01a0228c-abb1-7881-a08b-8950d9d84043`, build timestamp 2026-08-21 13:20:39 KST
- typecheck, lint warning 0, 81 files / 439 tests, web/AIT/전체 build, `git diff --check` 통과
- automated suite는 storage/checkpoint/reload/duplicate guard, visibility invalidation/stale async cleanup, share adapter/error/rapid tap을 통과했으나 native host evidence를 대체하지 않음
- Sandbox launch, Console identity, safe area, system/Toss back, real share sheet, force-close persistence, touch, font scaling, DAY3–7 visual, DAY6 timing, Final motion/performance는 모두 NOT VALIDATED
- Native Release Candidate A/B/C/D 판정은 실제 Android Sandbox 실기 전까지 보류함

## 58. 43.1 Android Sandbox Native Execution

- RC artifact size/SHA-256/deploymentId가 43.0 고정값과 동일함을 재확인함
- WSL `adb devices -l`은 정상 응답했지만 연결 serial이 0개임
- Windows host에는 `adb` command가 없고 Android Studio/emulator/ADB/Sandbox/Toss 관련 실행 process도 0개임
- 요청서 environment gate에 따라 device list 0에서 즉시 중단하고 `ENVIRONMENT BLOCKED`로 판정함
- Sandbox launch 및 모든 native-only scenario는 실행하지 않았으며 NOT VALIDATED 상태를 유지함
- 제품 code/config/RC artifact 수정 및 build/deploy는 수행하지 않음
- 상세 증거와 재개 조건은 `artifacts/native-43.1/QA.md`에 기록함

## 59. 43.1A Android Native QA Environment Bring-up

- 사용자 지적에 따라 DueGuard 제품이 아니라 당시 사용한 Android test environment를 재감사함
- 기존 `/home/tjd618/Android/Sdk/emulator/emulator`와 `DueGuard_Test` AVD를 찾아 동일 headless launch params로 재사용함
- `emulator-5554 device`, Android 15/API 35, 1080×2400, 420 dpi 연결을 확인함
- 기존 Sandbox `viva.republica.toss.test` version 1.0.0 설치 및 launch를 확인함
- 실제 `AppsInTossLoginActivity` 화면을 캡처했으며 Console Email/Password와 Toss 인증이 필요한 상태임
- credential/authentication은 자동화하거나 로그에 기록하지 않았고, product code/config/RC artifact는 변경하지 않음
- 초기 43.1의 `device list 0` 결론을 `DueGuard_Test available / Sandbox auth pending`으로 정정함
- 상세 환경과 screenshot은 `artifacts/native-43.1A/QA.md`, `artifacts/native-43.1/sandbox-current.png`에 기록함

## 60. 43.1B Android Sandbox Native Matrix

- `DueGuard_Test`는 `emulator-5554 device`, boot completed 상태로 정상 연결됨
- 43.1B의 인증 완료 가정을 실제 activity/screenshot으로 검증한 결과 여전히 `AppsInTossLoginActivity`임
- 요청서 section 1 gate에 따라 RC launch와 Native matrix를 시작하지 않음
- credential은 조회·입력·저장·로그하지 않았고 product code/config/RC artifact/deployment/storage 변경 없음
- 인증 상태 screenshot은 `artifacts/native-43.1B-auth-state.png`, 상세 matrix 상태는 `artifacts/native-43.1B/QA.md`에 기록함
- 사용자 Console login 및 Toss 인증 완료 후 동일 RC로 재개해야 함
