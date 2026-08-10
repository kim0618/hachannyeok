# QA 명세

## 자동 테스트

- 점수 계산 경계값
- 빈 입력과 잘못된 입력
- 유형 판정
- 자격 등급
- 날짜 기반 오늘의 검사 선택
- 로컬 저장 직렬화·역직렬화
- 저장 버전 마이그레이션
- valid/invalid trial union과 invalid partial payload/sentinel 금지
- InvalidReason enum 외 값 거부
- DAY 7 expected minimum denominator와 초과 retry numerator cap
- 공통 함수의 population standard deviation과 분모 N 검증
- Ability별 0..1 normalizedTrialError stability vector, 최소 2개, unavailable 우선순위
- Time signed error, Center/Balance/Control 75/25 composer, Focus 80/20 예외, Spatial Memory supporting score
- tendency registry 5개 formula/threshold/direction/content key와 deterministic dominant tie-break
- Most Condition-Sensitive 공통 0..1 magnitude, 후보 없음/threshold 미달 fallback
- Cross Insight 5개 predicate formula, 0..1 magnitude, predicate/Ability tie-break
- DAY 7 80/20, ±6 cap과 선택되지 않은 Ability 불변
- Profile raw replay의 analysisDay sort, DAY 7 replay, high/low component별 switch margin AND 조건
- stage별 certification eligibility와 tier 경계
- Cross Insight 0/1/2개 및 0개 fallback
- final assessment arm별 잘못된 kind/condition/target/minimum 조합 거부
- DAY 1/2 time `targetDurationMs === 3000` literal invariant

## 수동 테스트

- 360×800 작은 화면
- 큰 글자 설정 또는 긴 한글 결과
- 매우 빠른 연속 탭
- 검사 중 앱 백그라운드 이동
- 검사 중 뒤로가기
- 화면 잠금 후 복귀
- 공유 취소
- 저장소 오류
- 기존 기록이 없는 첫 사용자
- 기록 초기화

## 재시도·재시작·초기화 용어와 시나리오

- **invalid trial retry**: `backgrounded`, `dateChanged`, `interrupted`, `duplicateInput`, `timingUnavailable`, `outOfBounds`, `insufficientObservation` trial은 scoring에서 제외하고 target/minimum valid를 채우기 위해 한도 안에서 추가 시도한다.
- **interrupted short assessment restart**: DAY 2~7이 중단되거나 `assessmentIncomplete`이면 completion record를 저장하지 않고 해당 assessment 전체를 새 session으로 다시 시작한다.
- **full data reset**: Settings 확인 후 앱의 전체 로컬 기록을 삭제하고 STATE A로 돌아간다. 복구할 수 없다.

DAY 1 완료 이후 baseline re-assessment/overwrite와 부분 재검사는 MVP에서 지원하지 않는다. `재검사`라는 단어만으로 위 세 동작을 뭉뚱그리지 않는다.

자동/수동 QA에는 `attemptCount < targetTrialCount` 조기 완료 금지, target 이후 조건 충족 즉시 완료, assessment별 `targetTrialCount + 3` 한도, minimum valid/condition requirement 경계, 한도 초과 `assessmentIncomplete`, completion 미저장, 전체 restart를 포함한다.

## 출품 전 목표

- 첫 화면 목적 이해: 5초 이내
- 첫 검사 시작: 10초 이내
- 종합검사 완료: 90~120초
- 주요 CTA 잘림 없음
- 로딩 무한 상태 없음
- 사용자에게 가짜 통계 표시 없음

## Short assessment 실제 기기 timing QA

- DAY 2~6 실기 목표는 10~20초, DAY 7은 15~20초다.
- 360×800 기준 실제 기기에서 화면 전환과 입력 시간을 포함해 확인한다.
- DAY 6 `exposureDurationMs`나 화면 전환 시간을 제품 계약 상수로 과도하게 고정하지 않는다.
- trial 계약을 지키면서 목표를 넘으면 trial 수는 Calibration/Product revision으로만 바꾸며 구현자가 임의 축소하지 않는다.
