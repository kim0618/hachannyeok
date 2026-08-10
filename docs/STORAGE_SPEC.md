# 로컬 저장 명세

## 원칙

- Apps in Toss 공식 `Storage` 또는 공식 검증된 기기 로컬 저장만 사용한다.
- 서버, 외부 DB, 로그인, 계정 동기화를 사용하지 않는다.
- 데이터는 현재 기기에만 저장하며 앱 데이터 삭제 시 복구할 수 없다.
- 저장 실패 시 핵심 검사는 메모리에서 계속 가능해야 한다.
- 모든 저장 데이터에 `schemaVersion`을 포함한다.
- 원시 측정값과 계산된 결과를 구분한다.
- 민감정보와 분석에 필요하지 않은 값을 저장하지 않는다.

## 사용자 상태

```ts
export type UserState =
  | 'FIRST_ASSESSMENT_INCOMPLETE'
  | 'BASELINE_COMPLETE'
  | 'DAILY_AVAILABLE'
  | 'DAILY_COMPLETE_TODAY'
  | 'FINAL_AVAILABLE'
  | 'FINAL_COMPLETE';
```

`userState`는 저장된 근거와 현재 로컬 날짜에서 파생 가능한 값이다. 저장된 값과 파생 결과가 충돌하면 파생 결과를 우선하고 데이터를 안전하게 교정한다.

## 최소 데이터 모델

```ts
export type LocalProfile = {
  schemaVersion: number;
  userState: UserState;

  firstAssessmentStartedAt?: string;
  firstAssessmentCompletedAt?: string;
  lastAssessmentCompletedAt?: string;

  baselineAssessment?: AssessmentRecord;
  currentAbilityScores?: AbilityScores;
  previousAbilityScores?: AbilityScores;

  baselineTraits?: MetaTraits;
  currentTraits?: MetaTraits;

  dailyAssessments: DailyAssessmentRecord[];
  completedDailyAssessmentIds: string[];
  unlockedInsights: Insight[];
  certifications: Certification[];
  profileType?: ProfileType;
  analysisProgress: AnalysisProgress;

  finalReportUnlocked: boolean;
  finalReport?: FinalReport;
};
```

`AssessmentRecord`와 `DailyAssessmentRecord`는 검사 ID, 완료 시각, 유효한 원시 측정값, 해당 측정으로 계산된 결과만 가진다. UI 전용 상태, 카운트다운, 임시 애니메이션 값은 저장하지 않는다.

## 분석 진행 상태

`analysisProgress`는 완료된 유효 분석 근거에서 계산한다.

- DAY 1 완료 전: 종합검사 진행 상태
- DAY 1 완료: 기본 분석 완료
- DAY 2~6: 완료한 추가 분석 수와 공개된 근거
- DAY 7 완료: 최종 분석 완료

사용자에게 숫자 비율을 표시할 경우 값은 조정 가능한 표시 상수이며 저장 데이터의 진실 원천으로 사용하지 않는다.

## 날짜와 분석일 규칙

- 날짜 키는 기기의 로컬 달력 날짜를 명시적 형식으로 정규화한다.
- DAY는 연속 달력일이 아니라 완료한 분석일 순서다.
- DAY 1 이후 같은 로컬 날짜에는 추가 분석 하나만 유효하게 완료할 수 있다.
- 놓친 날짜는 결석으로 저장하지 않고 다음 방문에서 다음 분석을 제공한다.
- 날짜가 바뀌면 저장된 마지막 완료 날짜와 현재 날짜를 비교해 `DAILY_AVAILABLE` 또는 `FINAL_AVAILABLE`을 파생한다.
- 검사 도중 날짜가 바뀌면 제출 시점에 다시 검증하며 중복 완료를 만들지 않는다.

## 중복 실행과 원자성

- 각 추가 검사에는 고정된 assessment ID가 있다.
- `completedDailyAssessmentIds`와 날짜를 함께 확인해 같은 검사의 중복 반영을 막는다.
- 저장은 새 프로필 전체를 검증한 뒤 한 번에 교체하는 방식으로 다룬다.
- 동일 제출이 반복되어도 능력치, 특성, 자격, 진행 상태가 한 번만 갱신되어야 한다.

## 중단과 재개

- DAY 1 시작 시각과 마지막 안전한 검사 경계만 저장할 수 있다.
- 완료되지 않은 개별 시도의 측정값은 점수나 결과에 반영하지 않는다.
- 앱 종료·백그라운드 전환으로 무효화된 시간 기반 시도는 폐기하고 재시도한다.
- DAY 2~7 추가 검사는 완료 레코드가 원자적으로 저장되기 전까지 미완료로 취급한다.

## 저장 실패

- 검사와 결과 계산은 메모리에서 계속한다.
- 사용자에게 결과가 현재 기기에 보존되지 않을 수 있음을 알린다.
- 실패한 저장을 성공으로 표시하거나 분석 진행 상태를 앞당기지 않는다.
- 재시도는 같은 완료 레코드를 중복 반영하지 않는 idempotent 연산이어야 한다.

## 데이터 손상

- JSON parse와 런타임 스키마 검증을 분리한다.
- 일부 필드만 신뢰할 수 있을 때 임의로 결과를 재구성하지 않는다.
- baseline이나 원시 근거가 손상되면 안전한 초기 상태로 복구하고 사용자에게 알린다.
- 손상 데이터를 조용히 현재 점수에 혼합하지 않는다.

## 스키마 마이그레이션

- `schemaVersion`별 순수 마이그레이션 함수를 둔다.
- 알 수 없는 미래 버전은 덮어쓰지 않고 읽기 실패로 처리한다.
- 마이그레이션 후 전체 스키마를 다시 검증한다.
- 실패 시 원본을 무리하게 부분 저장하지 않고 안전한 복구 흐름을 제공한다.

## 데이터 초기화

- 초기화 전에 명시적 확인을 받는다.
- 초기화는 이 앱이 사용하는 Storage key만 제거한다.
- 초기화 또는 앱 데이터 삭제 후 복구할 수 없음을 안내한다.
- 초기화 후 STATE A로 돌아간다.

## 제한과 테스트 대상

- `dailyAssessments`, `unlockedInsights`, `certifications`는 7일 제품 범위에 필요한 개수만 저장한다.
- 안전한 parse, 스키마 검증, 각 상태 파생, 날짜 변경, 중복 제출, 중단, 저장 실패, 마이그레이션, 초기화를 단위 테스트한다.
- 기기 변경·앱 삭제·토스 앱 데이터 삭제 시 기록 복구나 동기화를 보장하지 않는다.
