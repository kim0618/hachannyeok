import { ABILITIES, type Ability, type AbilityScores, type CertificationTier } from './types';

const TIER_RANK: Record<CertificationTier, number> = { special: 5, grade1: 4, grade2: 3, grade3: 2, observer: 1 };

export interface RepresentativeCertification { ability: Ability; tier: CertificationTier; score: number }

export function selectRepresentativeCertification(
  certifications: Readonly<Record<Ability, CertificationTier>>,
  scores: AbilityScores,
): RepresentativeCertification {
  const ability = ABILITIES.reduce((best, candidate) => {
    const rankDifference = TIER_RANK[certifications[candidate]] - TIER_RANK[certifications[best]];
    if (rankDifference !== 0) return rankDifference > 0 ? candidate : best;
    return scores[candidate] > scores[best] ? candidate : best;
  });
  return { ability, tier: certifications[ability], score: scores[ability] };
}
