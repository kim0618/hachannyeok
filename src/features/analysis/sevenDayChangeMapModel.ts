import { ABILITIES, type Ability, type AbilityScores } from '../../domain/scoring/types';

export interface SevenDayChangeRow { ability: Ability; day1Baseline: number; final: number; delta: number; day7Selected: boolean }

export function sevenDayChangeRows(baselineScores: AbilityScores, finalScores: AbilityScores, selectedAbility: Ability | null): SevenDayChangeRow[] {
  return ABILITIES.map((ability) => ({ ability, day1Baseline: baselineScores[ability], final: finalScores[ability], delta: finalScores[ability] - baselineScores[ability], day7Selected: ability === selectedAbility }));
}
