import type { Day1RawResult, DailyRawResult } from '../assessment/results';
import { isDay6SpreadAttempt } from '../assessment/day6SpatialMemoryConfig';
import { BALANCE_ERROR_WORST, CENTER_DISTANCE_WORST, CONTROL_ERROR_WORST, DAILY_SCORE_DELTA_CAP, SPATIAL_MEMORY_DISTANCE_WORST, TIME_ERROR_WORST_MS } from './calibration';
import { euclideanDistance, mean, roundScore } from './math';
import { matchingMeanDistance, threeWayError, twoWayError } from './normalizers';
import type { Ability, EvidenceResult } from './types';

export interface DailyModifier { ability: Ability; conditionEffectNormalized: number; delta: number }

const average = (values: readonly number[]): EvidenceResult<number> => {
  const result = mean(values);
  return result.ok ? { ok: true, value: result.value } : { ok: false, reason: result.error === 'nonFiniteValue' ? 'calculationFailure' : 'insufficientEvidence' };
};
const effect = (reference: number, challenge: number, worst: number): number => Math.min(1, Math.max(-1, (reference - challenge) / worst));
const modifier = (ability: Ability, reference: number, challenge: number, worst: number): EvidenceResult<DailyModifier> => {
  const conditionEffectNormalized = effect(reference, challenge, worst);
  return { ok: true, value: { ability, conditionEffectNormalized, delta: Math.round(conditionEffectNormalized * DAILY_SCORE_DELTA_CAP) } };
};

export const applyDailyModifier = (baselineAbility: number, dailyDelta: number): number => roundScore(baselineAbility + Math.min(DAILY_SCORE_DELTA_CAP, Math.max(-DAILY_SCORE_DELTA_CAP, dailyDelta)));

export function deriveDailyModifier(baseline: readonly Day1RawResult[], result: DailyRawResult): EvidenceResult<DailyModifier> {
  switch (result.assessmentType) {
    case 'day2_time_distraction': {
      const errors = (condition: 'plain' | 'distracted') => average(result.trials.flatMap((trial) => trial.valid && trial.condition === condition ? [Math.abs(trial.observedDurationMs - trial.targetDurationMs)] : []));
      const reference = errors('plain'); const challenge = errors('distracted');
      return reference.ok && challenge.ok ? modifier('time', reference.value, challenge.value, TIME_ERROR_WORST_MS) : { ok: false, reason: !reference.ok ? reference.reason : challenge.ok ? 'insufficientEvidence' : challenge.reason };
    }
    case 'day3_decorated_center': {
      const errors = (plain: boolean) => average(result.trials.flatMap((trial) => trial.valid && (plain ? trial.condition === 'plain' : trial.condition !== 'plain') ? [euclideanDistance(trial.target, trial.observed)] : []));
      const reference = errors(true); const challenge = errors(false);
      return reference.ok && challenge.ok ? modifier('center', reference.value, challenge.value, CENTER_DISTANCE_WORST) : { ok: false, reason: !reference.ok ? reference.reason : challenge.ok ? 'insufficientEvidence' : challenge.reason };
    }
    case 'day4_balance_three_way': {
      const day1 = baseline.find((item): item is Extract<Day1RawResult, { assessmentType: 'day1_balance_two_way' }> => item.assessmentType === 'day1_balance_two_way');
      if (!day1) return { ok: false, reason: 'insufficientEvidence' };
      const reference = average(day1.trials.map(twoWayError).filter((value): value is number => value !== null));
      const challenge = average(result.trials.map(threeWayError).filter((value): value is number => value !== null));
      return reference.ok && challenge.ok ? modifier('balance', reference.value, challenge.value, BALANCE_ERROR_WORST) : { ok: false, reason: !reference.ok ? reference.reason : challenge.ok ? 'insufficientEvidence' : challenge.reason };
    }
    case 'day5_control_surprise': {
      const errors = (condition: 'predictable' | 'surprise') => average(result.trials.flatMap((trial) => trial.valid && trial.condition === condition ? [Math.abs(trial.observedPosition - trial.targetPosition)] : []));
      const reference = errors('predictable'); const challenge = errors('surprise');
      return reference.ok && challenge.ok ? modifier('control', reference.value, challenge.value, CONTROL_ERROR_WORST) : { ok: false, reason: !reference.ok ? reference.reason : challenge.ok ? 'insufficientEvidence' : challenge.reason };
    }
    case 'day6_spatial_memory': {
      const errors=(spread:boolean)=>average(result.trials.flatMap((trial,index)=>trial.valid&&isDay6SpreadAttempt(index)===spread?[matchingMeanDistance(trial)!]:[]));
      const reference=errors(true),challenge=errors(false);
      return reference.ok&&challenge.ok?modifier('focus',reference.value,challenge.value,SPATIAL_MEMORY_DISTANCE_WORST):{ok:false,reason:!reference.ok?reference.reason:challenge.ok?'insufficientEvidence':challenge.reason};
    }
  }
}
