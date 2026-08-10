import { PROFILE_SWITCH_MARGIN, STABILITY_CLASS_STABLE_MIN, STABILITY_CLASS_VARIABLE_MAX } from './calibration';
import { ABILITIES, type Ability, type AbilityScores, type ProfileResult, type StabilityByAbility, type Tendency } from './types';

const extremes = (scores: AbilityScores) => ({
  high: [...ABILITIES].sort((a, b) => scores[b] - scores[a] || ABILITIES.indexOf(a) - ABILITIES.indexOf(b))[0]!,
  low: [...ABILITIES].sort((a, b) => scores[a] - scores[b] || ABILITIES.indexOf(a) - ABILITIES.indexOf(b))[0]!,
});
export const stabilityClass = (stability: StabilityByAbility): 'stable' | 'mixed' | 'variable' => {
  const values = ABILITIES.map((ability) => stability[ability].stability).filter((value): value is number => value !== undefined);
  if (!values.length) return 'mixed';
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return average >= STABILITY_CLASS_STABLE_MIN ? 'stable' : average < STABILITY_CLASS_VARIABLE_MAX ? 'variable' : 'mixed';
};
export function selectProfile(previous: ProfileResult | null, previousScores: AbilityScores, currentScores: AbilityScores, stability: StabilityByAbility, dominant: Tendency | null): ProfileResult {
  const parts = previous?.profileFamilyKey.split('_');
  const old = parts?.length === 2 && ABILITIES.includes(parts[0] as Ability) && ABILITIES.includes(parts[1] as Ability)
    ? { high: parts[0] as Ability, low: parts[1] as Ability } : extremes(previousScores);
  const candidate = extremes(currentScores); let selected = candidate;
  if (previous && `${old.high}_${old.low}` !== `${candidate.high}_${candidate.low}`) {
    const highMet = candidate.high === old.high || currentScores[candidate.high] - currentScores[old.high] >= PROFILE_SWITCH_MARGIN;
    const lowMet = candidate.low === old.low || currentScores[old.low] - currentScores[candidate.low] >= PROFILE_SWITCH_MARGIN;
    if (!highMet || !lowMet) selected = old;
  }
  const tendency = dominant ? `${dominant.key}:${dominant.direction}` : 'noTendency';
  return { profileFamilyKey: `${selected.high}_${selected.low}`, profileVariantKey: `${stabilityClass(stability)}:${tendency}`, supportingEvidenceKeys: [selected.high, selected.low, ...(dominant?.supportingEvidence ?? [])] };
}
