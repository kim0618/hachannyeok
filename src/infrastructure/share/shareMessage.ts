import type { DerivedAnalysis } from '../../domain/scoring/types';
import { selectRepresentativeCertification } from '../../domain/scoring/representativeCertification';
import { CERTIFICATION_LABELS, profileDisplay } from '../../features/analysis/basicAnalysisContent';

function presentation(value: DerivedAnalysis) {
  const profile = profileDisplay(value.profile);
  if (!profile) throw new Error('Share presentation unavailable');
  const certification = selectRepresentativeCertification(value.certifications, value.scores);
  return {
    overall: value.overallScore,
    profile: profile.replace('\n', ' '),
    certification: CERTIFICATION_LABELS[certification.ability][certification.tier],
  };
}

export function basicShareMessage(value: DerivedAnalysis): string {
  const result = presentation(value);
  return [
    '[쓸능검 기본 분석 · DAY 1]',
    `종합 쓸능검 ${result.overall}점`,
    result.profile,
    `주요 자격 · ${result.certification}`,
  ].join('\n');
}

export function finalShareMessage(value: DerivedAnalysis): string {
  const result = presentation(value);
  return [
    '[쓸능검 최종 분석] · 7일 완료',
    `최종 종합 쓸능검 ${result.overall}점`,
    result.profile,
    `최종 주요 자격 · ${result.certification}`,
  ].join('\n');
}
