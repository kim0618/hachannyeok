# 로컬 저장 명세

## 원칙과 진실 원천

Apps in Toss의 공식 검증된 기기 로컬 Storage만 사용한다. 서버·계정 동기화는 없다. **Raw evidence + 최소 세션 상태만 영속 저장**하며 모든 표시 결과는 raw records에서 결정적으로 다시 계산한다.

MVP에서는 다음 파생값을 저장하지 않는다: `userState`, `currentAbilityScores`, `previousAbilityScores`, `traits`, `insights`, `certifications`, `profileType`, `analysisStage`, `finalReportUnlocked`, `finalReport`. 성능상 필요가 실제로 확인되기 전에는 파생 캐시도 두지 않는다.

raw trial persisted schema는 `valid` discriminator를 기준으로 valid/invalid arm을 분리한다. valid arm만 완전 observation을 요구하며 invalid arm은 관측 전 실패한 필드를 생략할 수 있다. sentinel `0`, 빈 좌표, 가짜 observation을 저장하지 않는다. `InvalidReason`은 `backgrounded | dateChanged | interrupted | duplicateInput | timingUnavailable | outOfBounds | insufficientObservation` 외 값을 허용하지 않는다. invalid trial은 scoring에서 제외하되 raw session evidence로 보존할 수 있다.

## Persisted Root 의사 타입

```ts
type PersistedAppData = {
  schemaVersion: number;
  baseline?: BaselineRecord;
  dailyRecords: DailyRecord[];
  finalRecord?: FinalRecord;
  activeBaselineSession?: ActiveBaselineSession;
  metadata: {
    firstStartedAt?: ISODateTime;
    lastSuccessfulWriteAt?: ISODateTime;
  };
};

type BaselineRecord = {
  recordId: RecordId;
  sessionId: SessionId;
  startedAt: ISODateTime;
  completedAt: ISODateTime;
  startedLocalDateKey: LocalDateKey;
  completedLocalDateKey: LocalDateKey;
  assessmentRawResults: Day1RawResult[];
};

type DailyRecord = {
  recordId: RecordId;
  sessionId: SessionId;
  analysisDay: 2 | 3 | 4 | 5 | 6;
  assessmentType: DailyAssessmentType;
  startedAt: ISODateTime;
  completedAt: ISODateTime;
  localDateKey: LocalDateKey;
  rawResult: DailyRawResult;
};

type FinalRecord = {
  recordId: RecordId;
  sessionId: SessionId;
  selectedAbility: Ability;
  assessmentType: FinalAssessmentType;
  startedAt: ISODateTime;
  completedAt: ISODateTime;
  localDateKey: LocalDateKey;
  rawResult: FinalRawResult;
};

type ActiveBaselineSession = {
  sessionId: SessionId;
  startedAt: ISODateTime;
  startedLocalDateKey: LocalDateKey;
  completedAssessmentIds: Day1AssessmentId[];
  partialRawResults: Day1RawResult[];
};
```

`FinalRawResult`는 `FinalTimeAssessmentResult | FinalCenterAssessmentResult | FinalBalanceAssessmentResult | FinalControlAssessmentResult | FinalFocusAssessmentResult`다. runtime validator는 각 arm의 assessment/ability literal, 허용 trial kind, condition 구성, target/minimum valid/condition minimum을 검증하며 넓은 trial union만으로 저장을 허용하지 않는다.

완료 DAILY와 그 순서는 `dailyRecords`에서 파생한다. 별도 완료 ID 배열을 저장하지 않는다. `activeBaselineSession`의 완료 ID는 DAY 1 내부 checkpoint이며 완료 DAILY 목록이 아니다.

## 세션 lifecycle

홈 STATE A~F와 실제 검사 세션은 별개다.

```ts
type AssessmentSessionState =
  | 'idle'
  | 'inProgress'
  | 'invalidated'
  | 'computedPendingSave'
  | 'saved';
```

- `idle`: 검사 미시작
- `inProgress`: 측정 중
- `invalidated`: background 전환, 날짜 경계 등으로 측정 무효
- `computedPendingSave`: 계산 완료 후 저장 시도 전 또는 실패 후. 같은 record를 메모리에 유지하고 저장을 우선 재시도
- `saved`: 영속 저장 성공

앱 종료로 메모리까지 사라지면 DAY 2~7은 완료로 기록하지 않고 해당 short assessment 전체를 새 session으로 다시 시작한다. DAY 1은 마지막 저장 checkpoint부터 재개한다. 부분 trial은 완료 근거로 사용하지 않는다.

## ID와 idempotency

- 모든 세션은 가능하면 `crypto.randomUUID()`로 만든 `sessionId`를 가진다.
- completion `recordId`는 해당 `sessionId`에서 안정적으로 유도하거나 세션 동안 한 번 생성해 유지한다.
- 같은 세션의 save retry는 같은 `recordId`를 사용한다.
- 저장 전 동일 `recordId`가 이미 존재하면 canonical field ordering에 의존하지 않는 payload semantic equality를 확인한다. schema validation/migration 뒤 의미 있는 전체 record 필드가 동일하면 idempotent success, 하나라도 다르면 `recordConflict` error이며 기존 record를 보존한다.
- 동일 `LocalDateKey`에 이미 다음 analysisDay의 완료 record가 있으면 중복 완료를 금지한다.
- `finalRecord`가 이미 있을 때 동일 `recordId`와 semantic-equal payload의 retry는 success다. 다른 `sessionId` 또는 `recordId`로 final completion을 저장하려 하면 `finalAlreadyCompleted` error이며 기존 final을 보존한다.
- 검증된 새 root 전체를 원자적으로 교체하는 저장을 기본으로 한다.

## LocalDateKey와 날짜 정책

`LocalDateKey`는 `YYYY-MM-DD`다. locale 문자열 포맷에 의존하지 않고 기기의 local year, month, day를 읽어 zero-padding하여 직접 조립한다.

다음 분석은 현재 key가 마지막 성공 완료 record의 key보다 **시간상 뒤이고 서로 다른 새 날짜**일 때만 가능하다. 현재 key가 같거나 과거로 역행하면 해금하지 않는다. 기기 날짜를 미래로 바꾸는 행위는 서버 없는 MVP에서 완전히 방지할 수 없는 known limitation이다.

검사 시작 key와 완료 key가 다르면 세션을 `invalidated` 처리하고 완료 record를 저장하지 않는다. 사용자에게 `날짜가 변경되어 측정을 다시 시작해 주세요.`라고 안내한다.

DAY 1도 한 local date 안에서 완료해야 한다. 날짜가 바뀐 뒤 DAY 1을 재개하면 기존 `activeBaselineSession`을 완료 근거로 이어 붙이지 않는다. 기존 checkpoint를 폐기하고 **새 sessionId로 DAY 1 전체를 처음부터 다시 측정**한다. 서로 다른 날짜의 DAY 1 evidence 혼합을 피하기 위한 단순하고 일관된 정책이다.

## STATE A~F 파생 우선순위

아래 표를 위에서 아래 순서로 평가한다. `today`는 현재 LocalDateKey, `lastCompletedKey`는 baseline/daily 중 가장 최근 성공 완료 key다.

| 우선순위 | 조건 | 상태 |
| --- | --- | --- |
| 1 | finalRecord 있음 | F |
| 2 | baseline 없음 | A |
| 3 | dailyRecords 유효 개수 = 5, final 없음, 마지막 DAILY key < today | E |
| 4 | dailyRecords 유효 개수 = 5, final 없음, 마지막 DAILY key = today 또는 today가 과거로 역행 | D |
| 5 | dailyRecords 유효 개수 < 5, lastCompletedKey < today | C |
| 6 | dailyRecords 유효 개수 < 5, lastCompletedKey = today 또는 today가 과거로 역행 | daily 0이면 B, daily 1~4이면 D |

따라서 DAY 6 완료 당일은 D, 다음 유효 local date에는 E, DAY 7 저장 성공 뒤에는 항상 F다. 손상·중복·순서 누락 record는 상태 계산 전에 검증에서 제외하거나 복구 흐름으로 보낸다.

## 저장 실패·손상·마이그레이션

- 실패한 저장을 완료로 표시하지 않으며 `computedPendingSave`의 동일 record 저장을 재시도한다.
- JSON parse와 runtime schema validation을 분리한다.
- baseline/raw evidence 손상 시 임의로 점수나 결과를 재구성하지 않는다.
- `schemaVersion`별 순수 migration을 사용하고 migration 뒤 전체 schema를 다시 검증한다.
- 알 수 없는 미래 버전은 덮어쓰지 않고 읽기 실패로 처리한다.

Storage key의 `.v1`은 제품 namespace 초기 버전이다. migration의 실제 기준은 payload 내부 `schemaVersion`이며 일반적인 schemaVersion 증가 때마다 Storage key를 바꾸지 않는다. Storage key는 완전히 별도 저장공간으로 이전해야 할 명확한 이유가 있을 때만 변경한다.

## 전체 초기화와 제한

MVP는 baseline overwrite나 부분 재검사를 지원하지 않는다. 사용자가 다시 시작하려면 Settings에서 명시적 확인 후 이 앱 Storage key의 전체 로컬 기록을 삭제하고 STATE A로 돌아간다. 삭제 후 복구할 수 없다.

기기 변경, 앱·토스 데이터 삭제 후 복구·동기화는 보장하지 않는다. 테스트는 parse/schema, migration, STATE 파생, 날짜 동일·진행·역행·검사 중 변경, idempotent retry, 중복 record, DAY 1 checkpoint 폐기, 저장 실패, 전체 초기화를 포함한다.

## Integration boundary

제품의 persisted/raw 타입을 Apps in Toss SDK 타입과 직접 결합하지 않는다. 3단계 시작 시 공식 문서와 설치된 타입을 검증한 뒤 앱 내부에 `StoragePort` adapter boundary를 두고, 공식 storage 구현은 그 port 바깥에 둔다. 공유도 제품 record를 SDK payload로 직접 사용하지 않고 `SharePort`를 통해 변환한다. 실제 Storage/share API 연동은 이번 문서 단계 범위가 아니다.
