# 진행 상태

## 현재 단계

- 단계 번호: 2.5E
- 단계 이름: 수학/판정 계약 최종 고정
- 상태: 수학/판정 계약 완료, 독립 최종 검수 대기

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

## 현재 소스 상태

- `src`에는 React 최소 기반만 존재하며 홈 UI, 검사, 점수 엔진, Storage, 공유는 미구현
- 2.5E에서도 기능·설정 코드와 패키지 파일을 수정하지 않음
- 2.5B, 2.5C, 2.5D 및 2.5E 문서 보강 변경은 미커밋

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

## 다음 작업

### 2.5E 독립 최종 검수

직전 Critical 0/Major 4/Minor 3의 해소 여부와 문서 간 수학/판정 계약을 최종 감사한다. 3단계 구현 완료로 간주하지 않는다.

재검수 통과 뒤 3단계에서 raw trial discriminated union, 파생 함수, session/date/idempotency/storage migration 계약과 단위 테스트를 구현한다. UI나 개별 검사 완성은 앞당기지 않는다.

## 마지막 검증

- 2.5E: 문서 전용 변경
- `git diff --check`: 통과
- 금지된 기능·설정 코드 변경 없음: 확인 완료

## 마지막 커밋

- hash: `d8f9cc9`
- message: `11`
