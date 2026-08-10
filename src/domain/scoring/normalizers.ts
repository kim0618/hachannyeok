import type { BalanceThreeWayTrial, BalanceTwoWayTrial, CenterConditionTrial, CenterTrial, ControlConditionTrial, ControlTrial, FocusTrial, SpatialMemoryTrial, TimeConditionTrial, TimeTrial } from '../assessment/trials';
import { ACCURACY_WEIGHT, BALANCE_DISPERSION_WORST, BALANCE_ERROR_WORST, CENTER_DISPERSION_WORST, CENTER_DISTANCE_WORST, CONSISTENCY_WEIGHT, CONTROL_DISPERSION_WORST, CONTROL_ERROR_WORST, FOCUS_RT_WORST_MS, SPATIAL_MEMORY_DISTANCE_WORST, TIME_ERROR_WORST_MS, TIME_STDDEV_WORST_MS } from './calibration';
import { clampRatio01, euclideanDistance, mean, median, populationStdDev, roundScore } from './math';
import type { EvidenceResult, NormalizedScore } from './types';

const compose = (errors: readonly number[], errorWorst: number, dispersionWorst: number): EvidenceResult<NormalizedScore> => {
  if (errors.length < 2) return { ok: false, reason: 'insufficientEvidence' };
  const average = mean(errors); const dispersion = populationStdDev(errors);
  if (!average.ok || !dispersion.ok) return { ok: false, reason: 'calculationFailure' };
  const accuracyQuality = 1 - clampRatio01(average.value, errorWorst);
  const consistencyQuality = 1 - clampRatio01(dispersion.value, dispersionWorst);
  const quality = accuracyQuality * ACCURACY_WEIGHT + consistencyQuality * CONSISTENCY_WEIGHT;
  return { ok: true, value: { score: roundScore(quality * 100), quality, accuracyQuality, consistencyQuality } };
};
export const timeErrors = (trials: readonly (TimeTrial | TimeConditionTrial)[]) => trials.filter((trial) => trial.valid).map((trial) => trial.observedDurationMs - trial.targetDurationMs);
export const normalizeTime = normalizeTimeSigned;
export function normalizeTimeSigned(trials: readonly (TimeTrial | TimeConditionTrial)[]): EvidenceResult<NormalizedScore> {
  const signed = timeErrors(trials); if (signed.length < 2) return { ok: false, reason: 'insufficientEvidence' };
  const average = mean(signed.map(Math.abs)); const dispersion = populationStdDev(signed); if (!average.ok || !dispersion.ok) return { ok: false, reason: 'calculationFailure' };
  const accuracyQuality = 1 - clampRatio01(average.value, TIME_ERROR_WORST_MS); const consistencyQuality = 1 - clampRatio01(dispersion.value, TIME_STDDEV_WORST_MS); const quality = accuracyQuality * ACCURACY_WEIGHT + consistencyQuality * CONSISTENCY_WEIGHT;
  return { ok: true, value: { score: roundScore(quality * 100), quality, accuracyQuality, consistencyQuality } };
}
export const centerErrors = (trials: readonly (CenterTrial | CenterConditionTrial)[]) => trials.filter((trial) => trial.valid).map((trial) => euclideanDistance(trial.target, trial.observed));
export const normalizeCenter = (trials: readonly (CenterTrial | CenterConditionTrial)[]) => compose(centerErrors(trials), CENTER_DISTANCE_WORST, CENTER_DISPERSION_WORST);
export const twoWayError = (trial: BalanceTwoWayTrial): number | null => trial.valid ? Math.abs(trial.observedRatio - 0.5) : null;
export const threeWayError = (trial: BalanceThreeWayTrial): number | null => { if (!trial.valid) return null; const [a, b] = trial.cutPositions; return (Math.abs(a - 1 / 3) + Math.abs(b - a - 1 / 3) + Math.abs(1 - b - 1 / 3)) / 3; };
export const balanceErrors = (trials: readonly (BalanceTwoWayTrial | BalanceThreeWayTrial)[]) => trials.map((trial) => trial.kind === 'balanceTwoWay' ? twoWayError(trial) : threeWayError(trial)).filter((value): value is number => value !== null);
export const normalizeBalance = (trials: readonly (BalanceTwoWayTrial | BalanceThreeWayTrial)[]) => compose(balanceErrors(trials), BALANCE_ERROR_WORST, BALANCE_DISPERSION_WORST);
export const controlErrors = (trials: readonly (ControlTrial | ControlConditionTrial)[]) => trials.filter((trial) => trial.valid).map((trial) => Math.abs(trial.observedPosition - trial.targetPosition));
export const normalizeControl = (trials: readonly (ControlTrial | ControlConditionTrial)[]) => compose(controlErrors(trials), CONTROL_ERROR_WORST, CONTROL_DISPERSION_WORST);
export function normalizeFocus(trials: readonly FocusTrial[]): EvidenceResult<NormalizedScore> { const valid = trials.filter((trial) => trial.valid); if (valid.length < 2) return { ok: false, reason: 'insufficientEvidence' }; const correct = valid.filter((trial) => trial.correct); const correctnessQuality = correct.length / valid.length; const rt = median(correct.map((trial) => trial.reactionTimeMs!)); if (!rt.ok && correct.length > 0) return { ok: false, reason: 'calculationFailure' }; const reactionQuality = rt.ok ? 1 - clampRatio01(rt.value, FOCUS_RT_WORST_MS) : 0; const quality = correctnessQuality * 0.8 + reactionQuality * 0.2; return { ok: true, value: { score: roundScore(quality * 100), quality, accuracyQuality: correctnessQuality, consistencyQuality: reactionQuality } }; }
const permutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]] as const;
export function matchingMeanDistance(trial: SpatialMemoryTrial): number | null { if (!trial.valid) return null; return Math.min(...permutations.map((order) => order.reduce<number>((sum, selectedIndex, shownIndex) => sum + euclideanDistance(trial.shownPositions[shownIndex]!, trial.selectedPositions[selectedIndex]!), 0) / 3)); }
export function normalizeSpatialMemory(trials: readonly SpatialMemoryTrial[]): EvidenceResult<{ score: number; quality: number }> { const distances = trials.map(matchingMeanDistance).filter((value): value is number => value !== null); if (distances.length < 2) return { ok: false, reason: 'insufficientEvidence' }; const average = mean(distances); if (!average.ok) return { ok: false, reason: 'calculationFailure' }; const quality = 1 - clampRatio01(average.value, SPATIAL_MEMORY_DISTANCE_WORST); return { ok: true, value: { score: roundScore(quality * 100), quality } }; }
