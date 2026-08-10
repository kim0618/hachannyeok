import type { Day1RawResult, DailyRawResult, FinalRawResult } from '../assessment/results';
import { BASELINE_WEIGHT, DAILY_MAX_WEIGHT, DAILY_SCORE_DELTA_CAP, FINAL_CALIBRATION_WEIGHT, FINAL_SCORE_DELTA_CAP, PREFINAL_WEIGHT } from './calibration';
import { normalizeBalance, normalizeCenter, normalizeControl, normalizeFocus, normalizeSpatialMemory, normalizeTimeSigned } from './normalizers';
import { roundScore } from './math';
import type { Ability, AbilityScores, EvidenceResult } from './types';

export function scoreBaseline(results: readonly Day1RawResult[]): EvidenceResult<AbilityScores> {
  const find = <T extends Day1RawResult['assessmentType']>(type: T) => results.find((result) => result.assessmentType === type) as Extract<Day1RawResult, { assessmentType: T }> | undefined;
  const time = find('day1_time'); const center = find('day1_center'); const balance = find('day1_balance_two_way'); const control = find('day1_control_constant'); const focus = find('day1_focus_search');
  if (!time || !center || !balance || !control || !focus) return { ok: false, reason: 'insufficientEvidence' };
  const values = [normalizeTimeSigned(time.trials), normalizeCenter(center.trials), normalizeBalance(balance.trials), normalizeControl(control.trials), normalizeFocus(focus.trials)] as const;
  const scores = values.map((value) => value.ok ? value.value.score : null);
  if (scores.some((value) => value === null)) return { ok: false, reason: 'insufficientEvidence' };
  return { ok: true, value: { time: scores[0]!, center: scores[1]!, balance: scores[2]!, control: scores[3]!, focus: scores[4]! } };
}
export const applyDailyScore = (baseline: number, equivalent: number): number => { const candidate = baseline * BASELINE_WEIGHT + equivalent * DAILY_MAX_WEIGHT; const delta = Math.max(-DAILY_SCORE_DELTA_CAP, Math.min(DAILY_SCORE_DELTA_CAP, roundScore(candidate) - baseline)); return roundScore(baseline + delta); };
export const applyFinalScore = (preFinal: number, equivalent: number): number => { const candidate = preFinal * PREFINAL_WEIGHT + equivalent * FINAL_CALIBRATION_WEIGHT; const delta = Math.max(-FINAL_SCORE_DELTA_CAP, Math.min(FINAL_SCORE_DELTA_CAP, candidate - preFinal)); return roundScore(preFinal + delta); };
export function dailyEquivalent(result: DailyRawResult): EvidenceResult<{ ability: Ability; score: number }> { let normalized; switch (result.assessmentType) { case 'day2_time_distraction': normalized = normalizeTimeSigned(result.trials); break; case 'day3_decorated_center': normalized = normalizeCenter(result.trials); break; case 'day4_balance_three_way': normalized = normalizeBalance(result.trials); break; case 'day5_control_surprise': normalized = normalizeControl(result.trials); break; case 'day6_spatial_memory': normalized = normalizeSpatialMemory(result.trials); break; } if (!normalized.ok) return normalized; const ability: Ability = ({ day2_time_distraction: 'time', day3_decorated_center: 'center', day4_balance_three_way: 'balance', day5_control_surprise: 'control', day6_spatial_memory: 'focus' } as const)[result.assessmentType]; return { ok: true, value: { ability, score: normalized.value.score } }; }
export function finalEquivalent(result: FinalRawResult): EvidenceResult<{ ability: Ability; score: number }> {
  let normalized;
  switch (result.assessmentType) {
    case 'finalTime': normalized = normalizeTimeSigned(result.trials); break;
    case 'finalCenter': normalized = normalizeCenter(result.trials); break;
    case 'finalBalance': normalized = normalizeBalance(result.trials); break;
    case 'finalControl': normalized = normalizeControl(result.trials); break;
    case 'finalFocus': {
      const focusTrials = result.trials.filter((trial) => trial.kind === 'focus');
      const memoryTrials = result.trials.filter((trial) => trial.kind === 'spatialMemory');
      const focus = normalizeFocus(focusTrials.length === 1 ? [focusTrials[0]!, focusTrials[0]!] : focusTrials);
      const memory = normalizeSpatialMemory(memoryTrials.length === 1 ? [memoryTrials[0]!, memoryTrials[0]!] : memoryTrials);
      if (!focus.ok || !memory.ok) return { ok: false, reason: 'insufficientEvidence' };
      normalized = { ok: true as const, value: { score: roundScore((focus.value.score + memory.value.score) / 2) } };
      break;
    }
  }
  return normalized.ok ? { ok: true, value: { ability: result.selectedAbility, score: normalized.value.score } } : normalized;
}
