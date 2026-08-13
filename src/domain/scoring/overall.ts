import { roundScore } from './math';
import { ABILITIES, type AbilityScores, type EvidenceResult } from './types';

export const OVERALL_SCORE_VERSION = 1 as const;

export function deriveOverallScore(scores: AbilityScores): EvidenceResult<number> {
  const values = ABILITIES.map((ability) => scores[ability]);
  if (!values.every(Number.isFinite)) return { ok: false, reason: 'calculationFailure' };
  return { ok: true, value: roundScore(values.reduce((sum, score) => sum + score, 0) / ABILITIES.length) };
}
