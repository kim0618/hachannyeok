# 점수 및 결과 엔진 명세

## 계산 계층과 공통 원칙

모든 상위 결과는 아래 단계의 evidence에서 결정적으로 계산하며 파생 결과를 영속 진실 원천으로 삼지 않는다.

1. **Raw Evidence** — 유효·무효 trial과 기기 독립 측정값
2. **Normalized Evidence** — 검사별 단위와 방향을 통일한 값
3. **Ability Scores** — `time`, `center`, `balance`, `control`, `focus`의 0~100 점수
4. **Meta Traits / Derived Tendencies** — accuracy, consistency, speed 등 공통 trait와 조건별 편향
5. **Insights / Certifications / Profile Type** — 임계값과 근거 수를 충족한 사용자 결과

같은 유효 입력은 항상 같은 결과를 만든다. 실제 백분위·전국 순위로 표현하지 않고, 한 번의 최고 기록이나 단일 DAILY가 전체 판정을 지배하지 않게 한다. 정밀 계수는 파일럿 데이터로 calibration하되 계약과 이름은 미리 고정한다.

## Raw Trial 공통 계약

```ts
type InvalidReason =
  | 'backgrounded'
  | 'dateChanged'
  | 'interrupted'
  | 'duplicateInput'
  | 'timingUnavailable'
  | 'outOfBounds'
  | 'insufficientObservation';

type TrialIdentity = {
  trialId: string;
  startedAtMs: number;
};

type ValidTrialBase = TrialIdentity & {
  completedAtMs: number;
  valid: true;
  invalidReason: null;
};

type InvalidTrialBase = TrialIdentity & {
  completedAtMs: number | null;
  valid: false;
  invalidReason: InvalidReason;
};
```

`ValidTrialBase.completedAtMs`는 반드시 `number`다. 모든 시간 단위는 milliseconds이며 별도 duration 필드가 필요하지 않으면 `completedAtMs - startedAtMs`로 계산한다. runtime schema는 `InvalidReason` enum 이외의 문자열을 거부한다. reason별 검사 제한은 두지 않는다.

모든 raw trial은 `ValidXTrial | InvalidXTrial` discriminated union이다. valid arm만 완전한 observation payload를 요구하고 invalid arm은 실패 전에 실제로 생성된 필드만 보존한다. 생성되지 않은 값에 sentinel `0`, 빈 좌표, 빈 문자열, 가짜 observation을 넣지 않는다. scoring에는 valid arm만 입력하며, invalid arm은 QA/diagnostics용 raw session evidence로 보존할 수 있다.

검사별 raw result는 다음 `assessmentType` discriminated union으로 구현한다.

```ts
type AssessmentRawResult =
  | { assessmentType: 'day1_time'; trials: TimeTrial[] }
  | { assessmentType: 'day1_center'; trials: CenterTrial[] }
  | { assessmentType: 'day1_balance_two_way'; trials: BalanceTwoWayTrial[] }
  | { assessmentType: 'day1_control_constant'; trials: ControlTrial[] }
  | { assessmentType: 'day1_focus_search'; trials: FocusTrial[] }
  | { assessmentType: 'day2_time_distraction'; trials: TimeConditionTrial[] }
  | { assessmentType: 'day3_decorated_center'; trials: CenterConditionTrial[] }
  | { assessmentType: 'day4_balance_three_way'; trials: BalanceThreeWayTrial[] }
  | { assessmentType: 'day5_control_surprise'; trials: ControlConditionTrial[] }
  | { assessmentType: 'day6_spatial_memory'; trials: SpatialMemoryTrial[] }
  | FinalAssessmentResult;
```

각 trial 타입은 아래 계약을 그대로 구현한다. 의미를 합치거나 파생 점수만 저장해서는 안 된다.

## 좌표와 입력 경계 계약

좌표는 viewport pixel과 독립적인 `x`, `y` 각각 `0.0 ≤ value ≤ 1.0`의 normalized coordinate다. 경계 0과 1은 유효하다. NaN, Infinity, 0 미만, 1 초과는 조용히 clamp하지 않고 `outOfBounds` invalid input으로 처리한다.

2등분/3등분의 선 위치도 동일한 0~1 축 계약을 사용한다. 3등분의 두 선은 모두 범위 안이고 첫 선 < 둘째 선이어야 하며, 아니면 invalid다. 시간은 finite non-negative monotonic duration이어야 한다.

## DAY 1 baseline과 최소 유효 trial

DAY 1은 표준 조건 baseline만 만든다.

| 검사 | 표준 조건 | 목표 trial | 최소 유효 trial | 주요 evidence |
| --- | --- | ---: | ---: | --- |
| time | 방해 없음, 목표 3초 | 3 | 2 | absolute/signed error, consistency, 기본 early/late tendency |
| center | 장식 없는 기본 도형 | 3 | 2 | normalized center distance, x/y bias, consistency |
| balance | 세로 2등분 1 + 가로 2등분 1 | 2 | 2 | two-way distribution error, orientation bias |
| control | 예측 가능한 일정 속도 | 3 | 2 | normalized stop error, 기본 lead/lag, consistency |
| focus | 기본 탐색 문제 3개 | 3 | 2 | accuracy, correct-response time |

최소 유효 trial 미만이면 해당 검사를 완료로 계산하지 않고 부족한 trial을 재측정한다. 모든 5개 검사가 최소 유효 수를 충족해야 baseline completion record를 만들 수 있다.

시간의 early/late는 기본 경향까지만, focus는 현재 탐색 performance까지만 산출한다. DAY 1에서는 조건 변화 편향, 3등분, sudden speed change, spatial memory를 계산하지 않는다.

### DAY 1 trial 의사 타입

```ts
type Point = { x: number; y: number }; // 각 축 normalized 0..1

type ValidTimeTrial = ValidTrialBase & {
  kind: 'time';
  condition: 'baseline';
  targetDurationMs: number;
  observedDurationMs: number;
};
type InvalidTimeTrial = InvalidTrialBase & {
  kind: 'time'; condition: 'baseline'; targetDurationMs: number;
  observedDurationMs?: null;
};
type TimeTrial = ValidTimeTrial | InvalidTimeTrial;

type ValidCenterTrial = ValidTrialBase & {
  kind: 'center';
  condition: 'plain';
  target: Point;
  observed: Point;
  shapeId: 'rectangle' | 'wideRectangle' | 'square';
};
type InvalidCenterTrial = InvalidTrialBase & {
  kind: 'center'; condition: 'plain'; target: Point;
  shapeId: 'rectangle' | 'wideRectangle' | 'square'; observed?: null;
};
type CenterTrial = ValidCenterTrial | InvalidCenterTrial;

type ValidBalanceTwoWayTrial = ValidTrialBase & {
  kind: 'balanceTwoWay';
  orientation: 'vertical' | 'horizontal';
  targetRatio: 0.5;
  observedRatio: number; // 0..1
};
type InvalidBalanceTwoWayTrial = InvalidTrialBase & {
  kind: 'balanceTwoWay'; orientation: 'vertical' | 'horizontal'; targetRatio: 0.5;
  observedRatio?: null;
};
type BalanceTwoWayTrial = ValidBalanceTwoWayTrial | InvalidBalanceTwoWayTrial;

type ValidControlTrial = ValidTrialBase & {
  kind: 'control';
  condition: 'constant';
  targetPosition: number; // 0..1
  observedPosition: number; // 0..1
  speedNormalized: number;
};
type InvalidControlTrial = InvalidTrialBase & {
  kind: 'control'; condition: 'constant'; targetPosition: number;
  speedNormalized: number; observedPosition?: null;
};
type ControlTrial = ValidControlTrial | InvalidControlTrial;

type ValidFocusTrial = ValidTrialBase & {
  kind: 'focus';
  condition: 'visualSearch';
  stimulusId: string;
  correctTargetId: string;
  selectedTargetId: string | null;
  reactionTimeMs: number | null;
  correct: boolean;
};
type InvalidFocusTrial = InvalidTrialBase & {
  kind: 'focus'; condition: 'visualSearch'; stimulusId: string;
  correctTargetId: string; selectedTargetId?: string | null;
  reactionTimeMs?: number | null; correct?: boolean;
};
type FocusTrial = ValidFocusTrial | InvalidFocusTrial;
```

`TimeTrial.signedErrorMs = observedDurationMs - targetDurationMs`, `absoluteErrorMs = abs(signedErrorMs)`로 정규화 전 근거를 만든다. control의 속도는 모든 사용자에게 동일한 고정 baseline profile을 사용한다. trial 구성과 최소 유효 수는 위 DAY 1 표의 값이며 balance는 vertical 1회와 horizontal 1회가 모두 유효해야 한다.

DAY 1 Control은 모든 trial에서 `leftToRight`, `startPosition = 0.08`, `endPosition = 0.92`를 사용한다. `speedNormalized`는 1초당 이동하는 normalized track distance이며 `position = startPosition + (elapsedMs / 1000) * speedNormalized`로 계산한다. 고정 config는 `(speedNormalized, targetPosition)` 순서로 `(0.32, 0.40)`, `(0.40, 0.58)`, `(0.48, 0.68)`이며 attempt index에 따라 이 순서를 결정적으로 순환한다. marker가 0.92에 도달할 때까지 사용자가 멈추지 않으면 `insufficientObservation` invalid trial로 종료하며 wrap하거나 end position을 valid observation으로 저장하지 않는다.

DAY 1 Focus는 4열×3행, 12개 선택지를 row-major 순서로 표시하며 target 1개와 distractor 11개로 고정한다. config는 `(stimulusId, target, distractor, target index)` 순서로 `focus-baseline-1/circle/square/1`, `focus-baseline-2/triangle/circle/7`, `focus-baseline-3/diamond/triangle/10`이며 attempt index에 따라 결정적으로 순환한다. item ID는 각 stimulus의 `item-01`부터 `item-12`까지이고 target index의 ID가 `correctTargetId`다. 선택한 item ID와 `correctTargetId`의 일치 여부가 `correct`이며 오답 선택도 reaction time을 포함한 valid trial이다. config render 뒤 requestAnimationFrame 두 번을 지난 시점의 monotonic clock으로 측정을 활성화하고 그 전 입력은 무시한다. 선택 timeout은 두지 않는다.

valid trial에서는 target/observed position, ratio와 normalized speed가 finite 0..1이고 duration/RT가 finite non-negative여야 한다. Focus에서 `correct`는 `selectedTargetId === correctTargetId`와 일치해야 하며 correct trial의 `reactionTimeMs`는 finite non-negative number여야 한다. 선택이 없으면 `selectedTargetId`와 `reactionTimeMs`가 모두 null이고 `correct: false`다. completed trial의 `completedAtMs >= startedAtMs`여야 한다. DAY 1 time completion validator는 타입이 `number`여도 `condition === 'baseline'` 및 `targetDurationMs === 3000`을 runtime literal invariant로 검사한다.

## Normalized Evidence 계약

각 valid raw measurement를 점수 계산 전에 검사별 normalizer로 `normalizedQuality: 0.0..1.0`으로 변환한다. `1.0`은 목표와 매우 가까움, `0.0`은 미리 정의한 최악 허용 범위 이상이다. Raw input validation에서 clamp하지 않는다. 유효 범위를 벗어난 raw는 `outOfBounds` 등 해당 사유로 invalid 처리한다. valid raw evidence를 quality로 변환한 마지막 결과만 0..1로 clamp할 수 있다. 즉 **Raw input clamp 금지, Derived score clamp 허용**이다.

### 공통 수학 함수

아래 함수는 이 문서의 모든 formula가 공유한다. 별도 언급이 없는 모든 dispersion/stddev는 **population standard deviation**이며 분모는 `values.length`다.

```text
mean(values):
  sum(values) / values.length

populationStdDev(values):
  if values.length < 2:
    unavailable
  m = mean(values)
  sqrt(sum((value - m)^2) / values.length)

clamp01(value):
  min(max(value, 0), 1)

roundScore(value):
  round(clamp(value, 0, 100))
```

## DAY 2~6 raw/completion 계약

```ts
type ValidTimeConditionTrial = ValidTrialBase & {
  kind: 'timeCondition';
  condition: 'plain' | 'distracted';
  targetDurationMs: 3000;
  observedDurationMs: number;
};
type InvalidTimeConditionTrial = InvalidTrialBase & {
  kind: 'timeCondition'; condition: 'plain' | 'distracted'; targetDurationMs: 3000;
  observedDurationMs?: null;
};
type TimeConditionTrial = ValidTimeConditionTrial | InvalidTimeConditionTrial;

type ValidCenterConditionTrial = ValidTrialBase & {
  kind: 'centerCondition';
  condition: 'plain' | 'decoratedLeft' | 'decoratedRight';
  target: Point;
  observed: Point;
  decorationSide: 'none' | 'left' | 'right';
};
type InvalidCenterConditionTrial = InvalidTrialBase & {
  kind: 'centerCondition'; condition: 'plain' | 'decoratedLeft' | 'decoratedRight';
  target: Point; decorationSide: 'none' | 'left' | 'right'; observed?: null;
};
type CenterConditionTrial = ValidCenterConditionTrial | InvalidCenterConditionTrial;

type ValidBalanceThreeWayTrial = ValidTrialBase & {
  kind: 'balanceThreeWay';
  cutPositions: [number, number];
};
type InvalidBalanceThreeWayTrial = InvalidTrialBase & {
  kind: 'balanceThreeWay'; cutPositions?: null;
};
type BalanceThreeWayTrial = ValidBalanceThreeWayTrial | InvalidBalanceThreeWayTrial;

type ValidControlConditionTrial = ValidTrialBase & {
  kind: 'controlCondition';
  condition: 'predictable' | 'surprise';
  targetPosition: number;
  observedPosition: number;
  initialSpeedNormalized: number;
  finalSpeedNormalized: number;
  speedChangeAtNormalizedTime: number | null;
};
type InvalidControlConditionTrial = InvalidTrialBase & {
  kind: 'controlCondition'; condition: 'predictable' | 'surprise';
  targetPosition: number; initialSpeedNormalized: number; finalSpeedNormalized: number;
  speedChangeAtNormalizedTime: number | null; observedPosition?: null;
};
type ControlConditionTrial = ValidControlConditionTrial | InvalidControlConditionTrial;

type ValidSpatialMemoryTrial = ValidTrialBase & {
  kind: 'spatialMemory';
  shownPositions: Point[];
  selectedPositions: Point[];
  exposureDurationMs: number;
  responseTimeMs: number;
};
type InvalidSpatialMemoryTrial = InvalidTrialBase & {
  kind: 'spatialMemory'; shownPositions: Point[];
  selectedPositions?: Point[]; exposureDurationMs?: number; responseTimeMs?: number;
};
type SpatialMemoryTrial = ValidSpatialMemoryTrial | InvalidSpatialMemoryTrial;
```

| DAY | 구성 / target | minimum valid | Primary derived evidence |
| --- | --- | --- | --- |
| 2 | plain 2 + distracted 2 = 4 | 전체 3, condition별 최소 1 | condition별 mean absolute error, `distractionDelta = distracted - plain`, signed shift |
| 3 | plain 1 + decoratedLeft 1 + decoratedRight 1 = 3 | 3 | plain/decorated offset vector, decoration shift vector, visual bias magnitude/direction |
| 4 | three-way 2 | 2 | meanThreeWayError, largest/smallest/terminalSegmentBias, DAY 1 two-way 대비 relative degradation |
| 5 | predictable 2 + surprise 2 = 4 | 전체 3, condition별 최소 1 | predictable/surprise mean error, `controlDegradation = surprise - predictable`, lead/lag/overshoot |
| 6 | shown position 3개인 trial 2 | 2 | spatialMemoryAccuracy, forgettingDirectionalBias; focus supporting evidence |

DAY 2 time validator는 `targetDurationMs === 3000`을 runtime literal invariant로 검사한다. DAY 2는 baseline 재측정이 아니라 distraction sensitivity가 primary다. DAY 3의 `decorationShiftVector`는 decorated observed에서 plain reference를 뺀 값이다. DAY 4 valid arm은 `0 < cut1 < cut2 < 1`이어야 하며 segments는 `[cut1, cut2-cut1, 1-cut2]`, 목표는 각 `1/3`이다. DAY 5 predictable은 `speedChangeAtNormalizedTime: null`이고 surprise는 유효한 0..1 변화 시점을 가진다. DAY 6 valid arm에서만 두 위치 배열이 각각 정확히 3개여야 한다. invalid arm의 `selectedPositions`는 없거나 표시 개수와 달라도 된다. matching은 모든 일대일 순열 중 총 Euclidean distance가 최소인 조합을 선택하고 동률이면 입력 index 순의 사전식 최소 permutation을 선택한다. 새 `memory` Ability는 만들지 않는다.

DAY 3에서 condition과 decorationSide는 각각 `plain↔none`, `decoratedLeft↔left`, `decoratedRight↔right`로만 조합한다. DAY 5의 target/observed/speed/change time은 normalized finite 0..1이고, DAY 6의 모든 좌표는 normalized 0..1이며 exposure/response time은 finite non-negative milliseconds다.

DAY 2~6은 가능하면 각각 10~20초 안에 완료한다. `targetTrialCount`는 assessment가 retry 여부와 무관하게 먼저 실행해야 하는 최소 attempt 수다. target 시도를 모두 끝낸 뒤 minimum valid와 condition minimum을 충족하면 success다. 충족하지 못하면 한 번에 한 attempt씩 retry하며, `MAX_TRIAL_ATTEMPTS_PER_ASSESSMENT = targetTrialCount + 3`에 도달하기 전에 조건을 충족하는 즉시 완료할 수 있다. 단 `attemptCount < targetTrialCount`이면 minimum valid를 이미 충족했어도 조기 완료하지 않는다. 최대 한도에서도 조건을 충족하지 못하면 `assessmentIncomplete`로 종료하고 completion record를 저장하지 않으며, 사용자는 assessment 전체를 새 session으로 다시 시작할 수 있다.

## DAY 2~6 evidence mapping

| DAY | Primary Ability | Meta / Derived Tendency | 비교 근거 |
| --- | --- | --- | --- |
| 2 | time | consistency, distractionSensitivity | 기본 조건 대비 시각 방해 조건의 error delta |
| 3 | center | visualBias | 무장식 대비 장식 조건의 center shift와 방향·크기 |
| 4 | balance | multiPartitionBias | DAY 1 two-way 대비 three-way error, largest/smallest segment bias |
| 5 | control | surpriseSensitivity | 일정 구간 대비 갑작스러운 속도 변화의 control degradation |
| 6 | focus의 보조 evidence | spatialMemorySupport | spatial memory accuracy, forgetting direction, response time |

조건 특화 값은 너무 넓은 기존 MetaTraits에 억지로 합치지 않고 `DerivedTendencies`로 둔다. DAY 6는 focus 해석의 보조 근거일 뿐 별도 `memory` Ability Score를 만들지 않는다.

## Provisional Ability Score와 DAILY guardrail

모든 Ability Score는 0~100 integer다. Time, Center, Balance, Control의 DAY 1 baseline은 다음 75/25 composer를 사용한다.

```text
assessmentNormalizedQuality
  = mean(valid trial accuracy quality) * 0.75
  + consistencyQuality * 0.25

abilityScore = round(assessmentNormalizedQuality * 100)
```

`accuracyWeight = 0.75`, `consistencyWeight = 0.25`다. Focus는 아래에 고정한 80/20 correctness/reaction composer를 쓰는 명시적 예외다. normalizer와 모든 수치는 `CALIBRATION_VERSION`과 함께 provisional calibration constants로 관리하며 **출시 전 파일럿 데이터로 변경 가능**하다.

DAY 2~6은 신규 tendency가 primary지만 자기 primary ability에만 제한적 보정 근거를 제공한다. DAY 6의 primary ability는 focus다. 다른 ability는 직접 변경하지 않는다.

```text
BASELINE_WEIGHT = 0.75
DAILY_MAX_WEIGHT = 0.25
DAILY_SCORE_DELTA_CAP = 8

candidate = baselineScore * BASELINE_WEIGHT
          + dailyEquivalentScore * DAILY_MAX_WEIGHT

displayedScore = baselineScore
  + clamp(round(candidate) - baselineScore, -8, +8)
```

단일 DAILY가 만든 displayed score 변화는 baseline 대비 최대 ±8이다. 작은 변화는 반올림으로 과장하지 않고 `변화 없음`과 신규 tendency를 함께 표시한다. 이 가중치와 cap은 provisional이며 출시 전 파일럿 데이터로 변경 가능하다.

## 검사별 provisional normalizer

```text
Time, 각 valid trial:
signedErrorMs = observedDurationMs - targetDurationMs
absoluteErrorMs = abs(signedErrorMs)
accuracyQuality = 1 - clamp01(mean(absoluteErrorMs) / TIME_ERROR_WORST_MS)
consistencyQuality = 1 - clamp01(populationStdDev(signedErrorMs) / TIME_STDDEV_WORST_MS)
timeScoreQuality = accuracyQuality * 0.75 + consistencyQuality * 0.25
Ability Score = roundScore(timeScoreQuality * 100)

Center, 각 valid trial:
distanceError = Euclidean normalized distance(target, observed)
accuracyQuality = 1 - clamp01(mean(distanceError) / CENTER_DISTANCE_WORST)
consistencyQuality = 1 - clamp01(populationStdDev(distanceError) / CENTER_DISPERSION_WORST)
centerScoreQuality = accuracyQuality * 0.75 + consistencyQuality * 0.25
Ability Score = roundScore(centerScoreQuality * 100)

Balance, 각 valid trial은 scalar `trialError` 하나를 만든다:
two-way trialError = abs(observedRatio - 0.5)
three-way segments = [s1, s2, s3]
three-way trialError = mean(abs(s1 - 1/3), abs(s2 - 1/3), abs(s3 - 1/3))
accuracyQuality = 1 - clamp01(mean(trialError) / BALANCE_ERROR_WORST)
consistencyQuality = 1 - clamp01(populationStdDev(trialError) / BALANCE_DISPERSION_WORST)
balanceScoreQuality = accuracyQuality * 0.75 + consistencyQuality * 0.25
Ability Score = roundScore(balanceScoreQuality * 100)

Control, 각 valid trial:
positionError = abs(observedPosition - targetPosition)
accuracyQuality = 1 - clamp01(mean(positionError) / CONTROL_ERROR_WORST)
consistencyQuality = 1 - clamp01(populationStdDev(positionError) / CONTROL_DISPERSION_WORST)
controlScoreQuality = accuracyQuality * 0.75 + consistencyQuality * 0.25
Ability Score = roundScore(controlScoreQuality * 100)

Focus:
correctnessQuality = correctCount / validTrialCount
reactionQuality = correctCount === 0 ? 0 : 1 - clamp01(medianCorrectReactionTimeMs / FOCUS_RT_WORST_MS)
focusQuality = correctnessQuality * 0.80 + reactionQuality * 0.20
Ability Score = roundScore(focusQuality * 100)

Spatial Memory:
spatialMemoryQuality = 1 - clamp01(mean(matchingMeanDistance) / SPATIAL_MEMORY_DISTANCE_WORST)
dailyEquivalentScore = roundScore(spatialMemoryQuality * 100)
```

Time consistency는 signed error의 population standard deviation을 사용한다. Center의 Euclidean 식은 `sqrt((observed.x-target.x)^2 + (observed.y-target.y)^2)`다. DAY 1 two-way Balance와 DAY 4 three-way equivalent 모두 같은 75/25 composer를 사용한다. Focus reaction quality에는 correct valid trial의 RT만 넣고 correct trial이 0개면 0이다. Focus는 generic 75/25 accuracy/consistency composer를 적용하지 않는 명시적 예외다. Spatial Memory는 deterministic matching 뒤 trial별 `matchingMeanDistance`를 계산하며 별도 Ability Score가 아니라 DAY 6 focus supporting `dailyEquivalentScore`만 만든다.

## DAY 7 선택과 최종 결과

DAY 7은 ability별로 `(evidenceCoverage, conditionCoverage, stabilityAvailable, stability)` tuple을 만들고 임의 가중합 없이 사전식 우선순위 비교로 가장 낮은 confidence 하나를 선택한다.

1. `evidenceCoverage`가 가장 낮은 ability
2. 동률이면 `conditionCoverage`가 낮은 ability
3. 동률이면 `stabilityAvailable: false`인 ability
4. 둘 다 available이면 `stability`가 낮은 ability
5. 여전히 동률이면 `time → center → balance → control → focus`

`evidenceCoverage = min(actualValidEvidence, expectedMinimumEvidence) / expectedMinimumEvidence`다. invalid retry와 target 초과 valid trial은 confidence를 올리지 않으며 DAY 7 evidence는 selector 이전 분모·분자에 포함하지 않는다.

| Ability | expectedMinimumEvidence | `conditionCoverage = 1` 조건 |
| --- | ---: | --- |
| time | DAY 1 time 2 + DAY 2 time-condition 3 = 5 | DAY 2 plain+distracted minimum |
| center | DAY 1 center 2 + DAY 3 center-condition 3 = 5 | DAY 3 plain+left+right 모두 valid |
| balance | DAY 1 two-way 2 + DAY 4 three-way 2 = 4 | 양쪽 assessment minimum |
| control | DAY 1 control 2 + DAY 5 control-condition 3 = 5 | DAY 5 predictable+surprise minimum |
| focus | DAY 1 visualSearch 2 + DAY 6 spatialMemory 2 = 4 | 양쪽 assessment minimum |

MVP conditionCoverage는 위 조건을 충족하면 1, 아니면 0이다.

### Stability evidence group

ms, 좌표 거리처럼 서로 다른 단위를 직접 비교하지 않는다. 먼저 각 valid trial을 공통 0..1 `normalizedTrialError`로 바꾼다.

```text
TIME = clamp01(absoluteErrorMs / TIME_ERROR_WORST_MS)
CENTER = clamp01(distanceError / CENTER_DISTANCE_WORST)
BALANCE = clamp01(trialError / BALANCE_ERROR_WORST)
CONTROL = clamp01(positionError / CONTROL_ERROR_WORST)

FOCUS, correct = false:
  normalizedTrialError = 1.0
FOCUS, correct = true:
  reactionError = clamp01(reactionTimeMs / FOCUS_RT_WORST_MS)
  normalizedTrialError = 0.20 * reactionError
```

Focus의 correct trial은 0..0.20, incorrect trial은 1.0이다. Ability별 stability vector는 다음 valid observations만 고정 순서로 포함한다.

- time: DAY 1 baseline `TimeTrial` + DAY 2 plain `TimeConditionTrial`
- center: DAY 1 plain `CenterTrial` + DAY 3 plain `CenterConditionTrial`
- balance: DAY 4 `BalanceThreeWayTrial`; orientation이 다른 DAY 1 vertical/horizontal은 제외
- control: DAY 1 constant `ControlTrial` + DAY 5 predictable `ControlConditionTrial`
- focus: DAY 1 `FocusTrial`; DAY 6 Spatial Memory는 제외

```text
if stabilityVector.length < 2:
  stabilityAvailable = false
else:
  dispersion = populationStdDev(stabilityVector)
  stability = 1 - clamp01(dispersion / STABILITY_STDDEV_WORST)
  stabilityAvailable = true
```

stability 범위는 0..1이며 1은 반복 evidence가 매우 일정하고 0은 변동이 큼을 뜻한다. 이는 잘함이 아니라 일관성이므로 낮은 score도 stability가 높을 수 있다. DAY 4 minimum valid가 2라 정상 completion이면 balance stability를 계산할 수 있다. 어떤 Ability도 comparable observation이 2개 미만이면 unavailable이며 0을 대입하지 않는다.

### Ability별 FinalAssessmentType

```ts
type FinalTimeAssessmentResult = { assessmentType: 'finalTime'; selectedAbility: 'time'; trials: TimeConditionTrial[] };
type FinalCenterAssessmentResult = { assessmentType: 'finalCenter'; selectedAbility: 'center'; trials: CenterConditionTrial[] };
type FinalBalanceAssessmentResult = { assessmentType: 'finalBalance'; selectedAbility: 'balance'; trials: (BalanceTwoWayTrial | BalanceThreeWayTrial)[] };
type FinalControlAssessmentResult = { assessmentType: 'finalControl'; selectedAbility: 'control'; trials: ControlConditionTrial[] };
type FinalFocusAssessmentResult = { assessmentType: 'finalFocus'; selectedAbility: 'focus'; trials: (FocusTrial | SpatialMemoryTrial)[] };
type FinalAssessmentResult = FinalTimeAssessmentResult | FinalCenterAssessmentResult | FinalBalanceAssessmentResult | FinalControlAssessmentResult | FinalFocusAssessmentResult;
```

| selected ability | 고정 구성 / target | minimum valid 및 condition 요구 |
| --- | --- | --- |
| time | plain 2 + distracted 1 = 3 | 전체 2, distracted 최소 1 |
| center | plain 1 + decoratedLeft 1 + decoratedRight 1 = 3 | 3 |
| balance | vertical two-way 1 + three-way 1 = 2 | 2 |
| control | predictable 1 + surprise 2 = 3 | 전체 2, surprise 최소 1 |
| focus | visual search 1 + spatial memory 1 = 2 | 2 |

각 assessment는 선택된 ability의 confidence만 보강하며 목표 시간은 15~20초다. UX 테스트에서 trial 수를 바꾸는 일은 제품 코드의 임의 결정이 아니라 `CALIBRATION_VERSION` 변경으로 처리한다.

runtime completion validator는 arm별 assessment/ability literal, 허용 trial kind, condition 구성, target, minimum valid와 condition minimum을 함께 검사하고 잘못된 arm 조합을 거부한다. TypeScript tuple 강제는 필수가 아니다.

DAY 7은 선택 Ability의 점수에도 제한적으로 반영한다.

```text
PREFINAL_WEIGHT = 0.80
FINAL_CALIBRATION_WEIGHT = 0.20
FINAL_SCORE_DELTA_CAP = 6
candidateFinalScore = preFinalScore * 0.80 + finalEquivalentScore * 0.20
finalScore = clamp(round(preFinalScore + clamp(candidateFinalScore - preFinalScore, -6, +6)), 0, 100)
```

선택되지 않은 Ability는 변경하지 않는다. 전체 순서는 DAY 1 baseline score, DAY 2~6 해당 Ability 하나의 DAILY equivalent를 75/25와 baseline 대비 ±8 cap으로 만든 current score, DAY 7 selected Ability의 final equivalent를 80/20과 preFinal 대비 ±6 cap으로 만든 final score다.

DAY 7 raw evidence를 추가한 뒤 모든 유효 raw record를 아래 replay 계약으로 다시 계산해 final scores, tendencies, insights, certifications와 Profile을 파생한다.

### Derived Tendency fixed registry

registry 고정 순서는 `distractionSensitivity → visualBias → multiPartitionBias → surpriseSensitivity → spatialMemorySupport`다. 각 entry는 `key`, required evidence, 0..1 `magnitude`, eligibility, deterministic `contentKey`, 필요한 경우 `direction` metadata를 반환한다.

```text
distractionSensitivity (DAY 2):
  deltaMs = distractedMeanAbsoluteErrorMs - plainMeanAbsoluteErrorMs
  magnitude = clamp01(abs(deltaMs) / TIME_ERROR_WORST_MS)
  eligible = magnitude >= TENDENCY_DISPLAY_THRESHOLD
  direction = deltaMs > 0 ? degraded : deltaMs < 0 ? improved : neutral
  contentKey = degraded/improved이면 "time.distraction.{direction}"
  neutral은 not eligible

visualBias (DAY 3 decorated shift vectors):
  visualBiasMagnitude = mean(leftShiftMagnitude, rightShiftMagnitude)
  magnitude = clamp01(visualBiasMagnitude / CENTER_DISTANCE_WORST)
  eligible = magnitude >= TENDENCY_DISPLAY_THRESHOLD
  direction = 평균 shift vector의 dominant axis/sign(left/right/up/down)
              abs(x) == abs(y)이면 x축 우선, 선택 축 값 >= 0이면 right/up,
              선택 축 값 < 0이면 left/down
  contentKey = "center.visualBias.{direction}"

multiPartitionBias (DAY 1 + DAY 4):
  degradation = threeWayMeanError - twoWayMeanError
  magnitude = clamp01(max(abs(degradation), abs(terminalSegmentBias)) / BALANCE_ERROR_WORST)
  eligible = magnitude >= TENDENCY_DISPLAY_THRESHOLD
  direction = terminalSegmentBias < 0 ? terminalSmall
            : terminalSegmentBias > 0 ? terminalLarge
            : degradation > 0 ? generalDegradation
            : generalImprovement
  contentKey = "balance.multiPartition.{direction}"

surpriseSensitivity (DAY 5):
  delta = surpriseMeanError - predictableMeanError
  magnitude = clamp01(abs(delta) / CONTROL_ERROR_WORST)
  eligible = magnitude >= TENDENCY_DISPLAY_THRESHOLD AND delta != 0
  direction = delta > 0 ? degraded : improved
  contentKey = "control.surprise.{direction}"

spatialMemorySupport (DAY 6):
  magnitude = clamp01(abs(spatialMemoryQuality - 0.5) * 2)
  eligible = magnitude >= TENDENCY_DISPLAY_THRESHOLD
  direction = spatialMemoryQuality >= 0.5 ? supportive : fragile
  contentKey = "focus.spatialMemory.{direction}"
```

Dominant Tendency는 eligible entry 중 magnitude 최대이며 동률이면 registry 순서를 따른다. 없으면 `dominantTendencyKey = null`, 있으면 `${key}:${direction}` 형식이다(예: `surpriseSensitivity:degraded`).

### Final Metric과 Most Condition-Sensitive

- Most Stable Ability: `stabilityAvailable = true` 중 stability 최대. 동률은 fixed Ability order, 후보가 없으면 `insufficientEvidence`.
- Most Positively Updated Ability: `finalScore - baselineScore` 최대. DAY 1 외 evidence가 있고 delta가 `IMPROVEMENT_DISPLAY_MIN_DELTA` 이상이어야 하며, 동률은 fixed Ability order를 따르고 후보가 없으면 `noClearPositiveUpdate`.
- Most Condition-Sensitive Ability: 아래 공통 0..1 condition degradation을 비교한다.

```text
TIME = clamp01(max(distractedMeanAbsoluteErrorMs - plainMeanAbsoluteErrorMs, 0) / TIME_ERROR_WORST_MS)
CENTER = clamp01(decoratedMeanShiftMagnitude / CENTER_DISTANCE_WORST)
BALANCE = clamp01(max(threeWayMeanError - twoWayMeanError, 0) / BALANCE_ERROR_WORST)
CONTROL = clamp01(max(surpriseMeanError - predictableMeanError, 0) / CONTROL_ERROR_WORST)
```

후보는 필요한 DAY record와 각 assessment completion validity를 모두 충족해야 한다. DAY 6 focus는 direct condition comparison이 아니므로 제외한다. 후보가 없으면 `insufficientEvidence`; 후보가 있지만 모든 magnitude가 `CONDITION_SENSITIVITY_DISPLAY_THRESHOLD` 미만이면 `noClearConditionSensitivity`; 그 외 최대 magnitude를 선택하고 동률은 `time → center → balance → control` 순이다.

`decoratedMeanShiftMagnitude = mean(leftShiftMagnitude, rightShiftMagnitude)`다.

### Cross Insight fixed registry

registry 고정 순서는 `stableStrength → conditionSensitiveStrength → consistentWeakness → positiveUpdate → crossContextResilience`다. 각 predicate는 Ability별 candidate와 0..1 magnitude, deterministic content key를 만든다.

아래 `score`는 해당 replay 시점의 final/current derived score다.

```text
stableStrength:
  eligible = score >= 80 AND stabilityAvailable AND stability >= 0.75
             AND baseline + 추가 날짜 evidence 존재
  magnitude = (score / 100) * 0.5 + stability * 0.5
  contentKey = "cross.stableStrength.{ability}"

conditionSensitiveStrength:
  eligible = baselineScore >= 80 AND conditionDegradationMagnitude >= 0.20
  magnitude = (baselineScore / 100) * 0.5 + conditionDegradationMagnitude * 0.5
  contentKey = "cross.conditionSensitiveStrength.{ability}"

consistentWeakness:
  eligible = score <= 60 AND stabilityAvailable AND stability >= 0.75
             AND 추가 날짜 evidence 존재
  magnitude = (1 - score / 100) * 0.5 + stability * 0.5
  contentKey = "cross.consistentWeakness.{ability}"

positiveUpdate:
  delta = finalScore - baselineScore
  eligible = delta >= IMPROVEMENT_DISPLAY_MIN_DELTA AND DAY 1 외 evidence 존재
  magnitude = clamp01(delta / 14)
  contentKey = "cross.positiveUpdate.{ability}"

crossContextResilience:
  eligible = baselineScore >= 70 AND condition comparison evidence 존재
             AND conditionDegradationMagnitude <= 0.05
  magnitude = (baselineScore / 100) * 0.5 + (1 - conditionDegradationMagnitude) * 0.5
  contentKey = "cross.crossContextResilience.{ability}"
```

`14`는 DAILY +8과 FINAL +6의 현재 최대 이론적 positive delta를 정규화하는 provisional 값이다. 각 predicate 안에서는 magnitude 최대 Ability 하나만 남기고, 전체 후보는 magnitude 내림차순 → registry 순서 → `time → center → balance → control → focus` 순서로 정렬해 최대 2개를 표시한다. 1개면 하나만 표시한다. 0개면 `여러 조건에서 뚜렷하게 반복되는 추가 패턴은 아직 확인되지 않았습니다.` fallback을 사용한다.

## 분석 단계, 유형, 자격

### DAY 1 종합점수

`OVERALL_SCORE_VERSION = 1`이다. DAY 1 종합점수는 다섯 Ability Score를 `time → center → balance → control → focus` 순서로 동일 가중치 0.20씩 산술평균한 뒤 공통 `roundScore`를 적용한다.

```text
overallScore = roundScore((timeScore + centerScore + balanceScore + controlScore + focusScore) / 5)
```

UI는 종합점수를 별도로 계산하지 않는다. Ability Score 하나라도 `insufficientEvidence` 또는 `calculationFailure`이면 종합점수를 0으로 대체하지 않고 같은 explicit failure를 전파한다.

### 대표 자격

대표 자격은 engine이 반환한 다섯 ability certification에서 하나를 결정적으로 선택한다. 먼저 tier를 `special → grade1 → grade2 → grade3 → observer` 순으로 비교하고, 같은 tier이면 Ability Score가 높은 항목을 선택한다. tier와 score가 모두 같으면 `time → center → balance → control → focus` 순서를 사용한다. 이 selector는 자격 eligibility나 tier scoring을 변경하지 않는다.

사용자 표시 단계는 `기본 분석 완료`, `심화 분석 n/5`, `최종 분석 준비 완료`, `최종 분석 완료`뿐이다. 퍼센트나 과학적 신뢰도처럼 보이는 `분석 정확도`를 생성하지 않는다.

Profile은 저장하지 않고 raw record를 replay하여 파생한다. 순서는 DAY 1 baseline → `dailyRecords`를 물리적 배열 순서가 아닌 `analysisDay` 오름차순 DAY 2~6으로 deterministic sort → finalRecord가 있으면 DAY 7 마지막이다.

DAY 1에서 highest/lowest(동률 `time → center → balance → control → focus`), DAY 1 stability만의 `stabilityClass`, `dominantTendencyKey = null`을 계산한다. 초기 family는 `highest_lowest`, variant는 `stabilityClass:noTendency`이며 메모리 current state로만 둔다.

각 DAILY와 DAY 7 적용 전 `previousScores`와 `currentProfile`을 보존하고, 적용 후 candidate scores/family/variant를 만든다. family가 같으면 유지하고 variant는 현재 누적 evidence로 즉시 갱신한다. family가 다르면 변경된 high/low component 각각을 검사한다.

```text
highChanged = newHigh != oldHigh
lowChanged = newLow != oldLow

highMarginMet = !highChanged
  OR candidateScores[newHigh] - candidateScores[oldHigh] >= PROFILE_SWITCH_MARGIN

lowMarginMet = !lowChanged
  OR candidateScores[oldLow] - candidateScores[newLow] >= PROFILE_SWITCH_MARGIN

if highMarginMet AND lowMarginMet:
  switch to candidate family
else:
  keep entire current family

variant = variant from current cumulative evidence
```

high와 low가 모두 바뀌면 두 조건을 모두 만족해야 한다. DAY 7도 `preFinalScores`와 current profile에서 selected Ability score 보정 후 같은 규칙으로 replay하며 예외가 없다. 최종 Profile은 baseline → daily → final 전체 replay 결과다.

`stabilityClass`는 현재까지 `stabilityAvailable = true`인 Ability stability 평균으로 계산한다. 0개면 mixed, mean >= 0.75면 stable, mean < 0.45면 variable, 나머지는 mixed다.

엔진 반환은 `profileFamilyKey`, `profileVariantKey`, `supportingEvidenceKeys`다. 한국어 유형명/설명은 content layer가 매핑하며 selector 엔진이 문구를 결정하지 않는다. margin은 provisional이다.

Insight generator는 raw/normalized evidence를 입력받아 이 문서의 versioned fixed registry에서 `predicate + deterministic content key`를 반환한다. 임의의 추가 X/Y 공식, LLM 또는 랜덤 선택을 사용하지 않는다.

Certification engine tier enum은 `special | grade1 | grade2 | grade3 | observer`다. 경계는 95~100 special, 85~94 grade1, 70~84 grade2, 55~69 grade3, 0~54 observer다. 사용자 표시 자격명은 ability별 content table이 정하며 observer를 일률적으로 `관찰형`이라 부르지 않는다.

- DAY 1: 해당 Ability의 DAY 1 minimum valid trials 충족 시 바로 eligibility가 있다.
- DAY 2~6: 해당 Ability의 DAILY completion record가 정상 저장된 경우에만 그 Ability tier를 재평가한다. 미완료 Ability는 DAY 1 tier를 유지한다.
- DAY 7: selected Ability final assessment가 minimum valid completion을 충족한 경우에만 해당 tier를 최종 재평가한다. 다른 Ability는 preFinal tier를 유지한다.

DAILY 이후 tier가 실제로 변한 경우에만 변경을 표시한다. threshold는 provisional이다.

## 필수 테스트

- NaN/Infinity/좌표 경계·범위 밖 invalid, 최소 유효 trial
- 같은 입력의 결정성 및 discriminated union exhaustiveness
- baseline 조건에 DAILY 전용 조건이 섞이지 않는지
- 관련 ability만 업데이트되고 guardrail/cap/switch margin이 지켜지는지
- 중복 record가 이중 반영되지 않는지
- DAY 7 lowest-confidence 선택과 모든 동률 순서
- Most Stable/Condition-Sensitive/Positively Updated 및 Cross Insight 0~2개/fallback
- population standard deviation과 stability 공통 normalizedTrialError 비교
- tendency 5개 formula/threshold/direction 및 dominant tie-break
- Profile baseline→sorted DAILY→DAY 7 replay와 high/low component별 hysteresis
- target attempt 전 조기 완료 금지와 target 이후 즉시 completion
- raw records만으로 모든 파생 결과가 재현되는지

## Provisional calibration constants 요약

| 이름 | 초기값 |
| --- | ---: |
| `CALIBRATION_VERSION` | 1 |
| `accuracyWeight` | 0.75 |
| `consistencyWeight` | 0.25 |
| `BASELINE_WEIGHT` | 0.75 |
| `DAILY_MAX_WEIGHT` | 0.25 |
| `DAILY_SCORE_DELTA_CAP` | 8 |
| `PREFINAL_WEIGHT` | 0.80 |
| `FINAL_CALIBRATION_WEIGHT` | 0.20 |
| `FINAL_SCORE_DELTA_CAP` | 6 |
| `PROFILE_SWITCH_MARGIN` | 6 |
| certification tiers | 95/85/70/55 경계 |
| `IMPROVEMENT_DISPLAY_MIN_DELTA` | 3 |
| `MAX_TRIAL_ATTEMPTS_PER_ASSESSMENT` | `targetTrialCount + 3` |
| `TIME_ERROR_WORST_MS` | 1500 |
| `TIME_STDDEV_WORST_MS` | 1000 |
| `CENTER_DISTANCE_WORST` | 0.25 |
| `CENTER_DISPERSION_WORST` | 0.15 |
| `BALANCE_ERROR_WORST` | 0.20 |
| `BALANCE_DISPERSION_WORST` | 0.10 |
| `CONTROL_ERROR_WORST` | 0.25 |
| `CONTROL_DISPERSION_WORST` | 0.15 |
| `FOCUS_RT_WORST_MS` | 4000 |
| `SPATIAL_MEMORY_DISTANCE_WORST` | 0.35 |
| `STABILITY_STDDEV_WORST` | 0.35 |
| `TENDENCY_DISPLAY_THRESHOLD` | 0.15 |
| `CONDITION_SENSITIVITY_DISPLAY_THRESHOLD` | 0.10 |

위 숫자는 과학적·의학적 진단 기준이 아니라 **파일럿 테스트 전 임시 MVP UX calibration 값**이다. 초기 `CALIBRATION_VERSION = 1`이며 calibration 숫자가 변경되면 version을 증가시킨다. 구조나 invariant 변경은 단순 calibration version 변경이 아니라 schema/product contract 변경으로 별도 관리한다. 구조와 invariant는 확정이고 숫자, weight/cap/margin/tier 및 predicate threshold만 출시 전 파일럿 데이터로 보정할 수 있다.
