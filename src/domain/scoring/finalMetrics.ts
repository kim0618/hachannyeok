import { CONDITION_SENSITIVITY_DISPLAY_THRESHOLD, IMPROVEMENT_DISPLAY_MIN_DELTA } from './calibration';
import type { Day1RawResult, DailyRawResult } from '../assessment/results';
import { BALANCE_ERROR_WORST } from './calibration';
import { clamp01, mean } from './math';
import { threeWayError, twoWayError } from './normalizers';
import { ABILITIES, type Ability, type AbilityScores, type FinalMetric, type StabilityByAbility, type Tendency } from './types';

export function deriveBalanceConditionDegradation(baseline: readonly Day1RawResult[], daily: readonly DailyRawResult[]): number | undefined {
  const baselineBalance = baseline.find((result) => result.assessmentType === 'day1_balance_two_way');
  const dailyBalance = daily.find((result) => result.assessmentType === 'day4_balance_three_way');
  if (baselineBalance?.assessmentType !== 'day1_balance_two_way' || dailyBalance?.assessmentType !== 'day4_balance_three_way') return undefined;
  const twoWayMean = mean(baselineBalance.trials.map(twoWayError).filter((value): value is number => value !== null));
  const threeWayMean = mean(dailyBalance.trials.map(threeWayError).filter((value): value is number => value !== null));
  if (!twoWayMean.ok || !threeWayMean.ok) return undefined;
  const degradation = Math.max(threeWayMean.value - twoWayMean.value, 0);
  return degradation >= BALANCE_ERROR_WORST ? 1 : clamp01(degradation / BALANCE_ERROR_WORST);
}

export function conditionMagnitudes(baseline: readonly Day1RawResult[], daily: readonly DailyRawResult[], tendencies:readonly Tendency[]):Partial<Record<Ability,number>>{const map:Partial<Record<Ability,number>>={};for(const t of tendencies){if(t.key==='distractionSensitivity')map.time=t.direction==='degraded'?t.magnitude:0;if(t.key==='visualBias')map.center=t.magnitude;if(t.key==='surpriseSensitivity')map.control=t.direction==='degraded'?t.magnitude:0;}const balance=deriveBalanceConditionDegradation(baseline,daily);if(balance!==undefined)map.balance=balance;return map;}
export function mostConditionSensitive(magnitudes:Partial<Record<Ability,number>>):FinalMetric{const candidates=(['time','center','balance','control'] as const).filter(a=>magnitudes[a]!==undefined);if(!candidates.length)return{status:'insufficientEvidence'};const ability=candidates.reduce((best,a)=>magnitudes[a]!>magnitudes[best]!?a:best);const magnitude=magnitudes[ability]!;return magnitude<CONDITION_SENSITIVITY_DISPLAY_THRESHOLD?{status:'noClearConditionSensitivity'}:{status:'selected',ability,magnitude};}
export function mostStable(stability:StabilityByAbility,hasAdditional:Readonly<Record<Ability,boolean>>):FinalMetric{const candidates=ABILITIES.filter(a=>stability[a].stabilityAvailable&&hasAdditional[a]);if(!candidates.length)return{status:'insufficientEvidence'};const ability=candidates.reduce((best,a)=>stability[a].stability!>stability[best].stability!?a:best);return{status:'selected',ability,magnitude:stability[ability].stability!};}
export function mostPositivelyUpdated(baseline:AbilityScores,current:AbilityScores,hasAdditional:Readonly<Record<Ability,boolean>>):FinalMetric{const candidates=ABILITIES.filter(a=>hasAdditional[a]);if(!candidates.length)return{status:'noClearPositiveUpdate'};const ability=candidates.reduce((best,a)=>current[a]-baseline[a]>current[best]-baseline[best]?a:best);const delta=current[ability]-baseline[ability];return delta<IMPROVEMENT_DISPLAY_MIN_DELTA?{status:'noClearPositiveUpdate'}:{status:'selected',ability,magnitude:delta};}
