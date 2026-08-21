import { selectRepresentativeCertification } from '../../domain/scoring/representativeCertification';
import type { Ability, DerivedAnalysis } from '../../domain/scoring/types';
import { ABILITY_LABELS, CERTIFICATION_LABELS, profileDisplay } from './basicAnalysisContent';

export interface FinalShareCardChange {
  mode: 'sevenDayUpdate' | 'finalCalibration';
  ability: Ability;
  label: string;
  beforeLabel: 'DAY 1' | 'DAY 6까지';
  before: number;
  final: number;
  delta: number;
}

export interface FinalShareCardData {
  overall: number;
  profile: string;
  certification: string;
  change: FinalShareCardChange | null;
  accessibleLabel: string;
}

const signed = (value: number) => value > 0 ? `+${value}` : String(value);

export function finalShareCardData(value: DerivedAnalysis): FinalShareCardData | null {
  const profile = profileDisplay(value.profile);
  if (!profile) return null;
  const representative = selectRepresentativeCertification(value.certifications, value.scores);
  const positiveUpdate = value.finalMetrics.mostPositivelyUpdated;
  const selected = value.selectedFinalAbility;
  const ability = positiveUpdate.status === 'selected' ? positiveUpdate.ability : selected;
  const change = ability === null ? null : positiveUpdate.status === 'selected'
    ? {
        mode: 'sevenDayUpdate' as const,
        ability,
        label: '7일 대표 변화',
        beforeLabel: 'DAY 1' as const,
        before: value.baselineScores[ability],
        final: value.scores[ability],
        delta: value.scores[ability] - value.baselineScores[ability],
      }
    : {
        mode: 'finalCalibration' as const,
        ability,
        label: '마지막 보정',
        beforeLabel: 'DAY 6까지' as const,
        before: value.preFinalScores[ability],
        final: value.scores[ability],
        delta: value.scores[ability] - value.preFinalScores[ability],
      };
  const certification = CERTIFICATION_LABELS[representative.ability][representative.tier];
  const changeText = change
    ? `${change.label} ${ABILITY_LABELS[change.ability]}, ${change.beforeLabel} ${change.before}점에서 최종 ${change.final}점, 변화 ${signed(change.delta)}점.`
    : '표시할 대표 변화 없음.';
  return {
    overall: value.overallScore,
    profile,
    certification,
    change,
    accessibleLabel: `쓸능검 최종 결과. 7일 완료, 종합 ${value.overallScore}점, ${profile.replace('\n', ' ')}, 앱 내 대표 자격 ${certification}. ${changeText}`,
  };
}
