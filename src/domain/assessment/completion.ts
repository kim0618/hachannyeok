import { FINAL_ASSESSMENT_ABILITY_MAP, isAssessmentType, isFinalAssessmentType, type AssessmentRawResult } from './results';
import type { AnyTrial } from './trials';
import { isAnyTrial } from './validation';

export const MAX_ADDITIONAL_ATTEMPTS = 3;
export type CompletionStatus =
  | { status: 'notEnoughAttempts'; remainingTargetAttempts: number }
  | { status: 'retryAllowed'; attemptsRemaining: number }
  | { status: 'completed' }
  | { status: 'assessmentIncomplete' }
  | { status: 'invalidAssessment' };

interface Rule { target: number; minimumValid: number; validKinds: readonly string[]; targetComposition?: Readonly<Record<string, number>>; conditionMinimum?: Readonly<Record<string, number>> }
const RULES: Record<AssessmentRawResult['assessmentType'], Rule> = {
  day1_time: { target: 3, minimumValid: 2, validKinds: ['time'] },
  day1_center: { target: 3, minimumValid: 2, validKinds: ['center'] },
  day1_balance_two_way: { target: 2, minimumValid: 2, validKinds: ['balanceTwoWay'], targetComposition: { vertical: 1, horizontal: 1 }, conditionMinimum: { vertical: 1, horizontal: 1 } },
  day1_control_constant: { target: 3, minimumValid: 2, validKinds: ['control'] },
  day1_focus_search: { target: 3, minimumValid: 2, validKinds: ['focus'] },
  day2_time_distraction: { target: 4, minimumValid: 3, validKinds: ['timeCondition'], targetComposition: { plain: 2, distracted: 2 }, conditionMinimum: { plain: 1, distracted: 1 } },
  day3_decorated_center: { target: 3, minimumValid: 3, validKinds: ['centerCondition'], targetComposition: { plain: 1, decoratedLeft: 1, decoratedRight: 1 }, conditionMinimum: { plain: 1, decoratedLeft: 1, decoratedRight: 1 } },
  day4_balance_three_way: { target: 2, minimumValid: 2, validKinds: ['balanceThreeWay'] },
  day5_control_surprise: { target: 4, minimumValid: 3, validKinds: ['controlCondition'], targetComposition: { predictable: 2, surprise: 2 }, conditionMinimum: { predictable: 1, surprise: 1 } },
  day6_spatial_memory: { target: 2, minimumValid: 2, validKinds: ['spatialMemory'] },
  finalTime: { target: 3, minimumValid: 2, validKinds: ['timeCondition'], targetComposition: { plain: 2, distracted: 1 }, conditionMinimum: { distracted: 1 } },
  finalCenter: { target: 3, minimumValid: 3, validKinds: ['centerCondition'], targetComposition: { plain: 1, decoratedLeft: 1, decoratedRight: 1 }, conditionMinimum: { plain: 1, decoratedLeft: 1, decoratedRight: 1 } },
  finalBalance: { target: 2, minimumValid: 2, validKinds: ['balanceTwoWay', 'balanceThreeWay'], targetComposition: { vertical: 1, balanceThreeWay: 1 }, conditionMinimum: { vertical: 1, balanceThreeWay: 1 } },
  finalControl: { target: 3, minimumValid: 2, validKinds: ['controlCondition'], targetComposition: { predictable: 1, surprise: 2 }, conditionMinimum: { surprise: 1 } },
  finalFocus: { target: 2, minimumValid: 2, validKinds: ['focus', 'spatialMemory'], targetComposition: { focus: 1, spatialMemory: 1 }, conditionMinimum: { focus: 1, spatialMemory: 1 } },
};

const trialBucket = (trial: AnyTrial): string => trial.kind === 'balanceTwoWay' ? trial.orientation : trial.kind === 'focus' ? trial.kind : 'condition' in trial ? trial.condition : trial.kind;

export function validateCompletion(input: unknown): CompletionStatus {
  if (typeof input !== 'object' || input === null || !('assessmentType' in input) || !isAssessmentType(input.assessmentType) || !('trials' in input) || !Array.isArray(input.trials)) {
    return { status: 'invalidAssessment' };
  }
  const result = input as Record<string, unknown> & { assessmentType: AssessmentRawResult['assessmentType']; trials: unknown[] };
  if (isFinalAssessmentType(result.assessmentType) && result.selectedAbility !== FINAL_ASSESSMENT_ABILITY_MAP[result.assessmentType]) {
    return { status: 'invalidAssessment' };
  }
  const rule = RULES[result.assessmentType];
  const attempts = result.trials;
  if (!attempts.every(isAnyTrial) || !attempts.every((trial) => rule.validKinds.includes(trial.kind))) return { status: 'invalidAssessment' };
  if (attempts.length < rule.target) return { status: 'notEnoughAttempts', remainingTargetAttempts: rule.target - attempts.length };
  if (attempts.length > rule.target + MAX_ADDITIONAL_ATTEMPTS) return { status: 'assessmentIncomplete' };
  const targetAttempts = attempts.slice(0, rule.target);
  const compositionMet = !rule.targetComposition || Object.entries(rule.targetComposition).every(([key, minimum]) => targetAttempts.filter((trial) => trialBucket(trial) === key).length >= minimum);
  const validTrials = attempts.filter((trial) => trial.valid);
  const conditionsMet = !rule.conditionMinimum || Object.entries(rule.conditionMinimum).every(([key, minimum]) => validTrials.filter((trial) => trialBucket(trial) === key).length >= minimum);
  if (compositionMet && validTrials.length >= rule.minimumValid && conditionsMet) return { status: 'completed' };
  const maximum = rule.target + MAX_ADDITIONAL_ATTEMPTS;
  return attempts.length < maximum ? { status: 'retryAllowed', attemptsRemaining: maximum - attempts.length } : { status: 'assessmentIncomplete' };
}
