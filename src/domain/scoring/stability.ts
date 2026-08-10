import type { Day1RawResult, DailyRawResult } from '../assessment/results';
import { BALANCE_ERROR_WORST, CENTER_DISTANCE_WORST, CONTROL_ERROR_WORST, FOCUS_RT_WORST_MS, STABILITY_STDDEV_WORST, TIME_ERROR_WORST_MS } from './calibration';
import { clampRatio01, euclideanDistance, populationStdDev } from './math';
import { threeWayError } from './normalizers';
import { ABILITIES, type Ability, type StabilityByAbility, type StabilityResult } from './types';
const calculate = (vector: readonly number[]): StabilityResult => { const dispersion = populationStdDev(vector); return dispersion.ok ? { stabilityAvailable: true, stability: 1 - clampRatio01(dispersion.value, STABILITY_STDDEV_WORST), evidenceCount: vector.length } : { stabilityAvailable: false, evidenceCount: vector.length }; };
export function calculateStability(baseline: readonly Day1RawResult[], daily: readonly DailyRawResult[]): StabilityByAbility {
  const bTime = baseline.find((r): r is Extract<Day1RawResult,{assessmentType:'day1_time'}> => r.assessmentType === 'day1_time'); const dTime = daily.find((r): r is Extract<DailyRawResult,{assessmentType:'day2_time_distraction'}> => r.assessmentType === 'day2_time_distraction');
  const bCenter = baseline.find((r): r is Extract<Day1RawResult,{assessmentType:'day1_center'}> => r.assessmentType === 'day1_center'); const dCenter = daily.find((r): r is Extract<DailyRawResult,{assessmentType:'day3_decorated_center'}> => r.assessmentType === 'day3_decorated_center');
  const dBalance = daily.find((r): r is Extract<DailyRawResult,{assessmentType:'day4_balance_three_way'}> => r.assessmentType === 'day4_balance_three_way'); const bControl = baseline.find((r): r is Extract<Day1RawResult,{assessmentType:'day1_control_constant'}> => r.assessmentType === 'day1_control_constant'); const dControl = daily.find((r): r is Extract<DailyRawResult,{assessmentType:'day5_control_surprise'}> => r.assessmentType === 'day5_control_surprise'); const bFocus = baseline.find((r): r is Extract<Day1RawResult,{assessmentType:'day1_focus_search'}> => r.assessmentType === 'day1_focus_search');
  const time = [...(bTime?.trials ?? []), ...(dTime?.trials.filter((t) => t.condition === 'plain') ?? [])].filter((t) => t.valid).map((t) => clampRatio01(Math.abs(t.observedDurationMs - t.targetDurationMs), TIME_ERROR_WORST_MS));
  const center = [...(bCenter?.trials ?? []), ...(dCenter?.trials.filter((t) => t.condition === 'plain') ?? [])].filter((t) => t.valid).map((t) => clampRatio01(euclideanDistance(t.target, t.observed), CENTER_DISTANCE_WORST));
  const balance = (dBalance?.trials ?? []).map(threeWayError).filter((v): v is number => v !== null).map((v) => clampRatio01(v, BALANCE_ERROR_WORST));
  const control = [...(bControl?.trials ?? []), ...(dControl?.trials.filter((t) => t.condition === 'predictable') ?? [])].filter((t) => t.valid).map((t) => clampRatio01(Math.abs(t.observedPosition - t.targetPosition), CONTROL_ERROR_WORST));
  const focus = (bFocus?.trials ?? []).filter((t) => t.valid).map((t) => t.correct ? 0.2 * clampRatio01(t.reactionTimeMs!, FOCUS_RT_WORST_MS) : 1);
  const vectors: Record<Ability, number[]> = { time, center, balance, control, focus }; return Object.fromEntries(ABILITIES.map((ability) => [ability, calculate(vectors[ability])])) as StabilityByAbility;
}
