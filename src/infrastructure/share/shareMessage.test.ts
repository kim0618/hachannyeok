import { describe, expect, it } from 'vitest';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import { selectRepresentativeCertification } from '../../domain/scoring/representativeCertification';
import { baselineFixture } from '../../test/day1Fixture';
import { throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { CERTIFICATION_LABELS, profileDisplay } from '../../features/analysis/basicAnalysisContent';
import { basicShareMessage, finalShareMessage } from './shareMessage';

describe('shareMessage', () => {
  it('Basic presentation score/profile/certification만 결정적으로 포함한다', () => {
    const analysis = deriveAnalysis({ schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} });
    expect(analysis.ok).toBe(true);
    if (!analysis.ok) return;
    const representative = selectRepresentativeCertification(analysis.value.certifications, analysis.value.scores);
    const message = basicShareMessage(analysis.value);
    expect(message).toContain('[쓸능검 기본 분석]');
    expect(message).toContain(`종합 쓸능검 ${analysis.value.overallScore}점`);
    expect(message).toContain(profileDisplay(analysis.value.profile)!.replace('\n', ' '));
    expect(message).toContain(CERTIFICATION_LABELS[representative.ability][representative.tier]);
    expect(basicShareMessage(analysis.value)).toBe(message);
    expect(message).not.toMatch(/sessionId|recordId|localDateKey|profileFamilyKey|contentKey|startedAt|completedAt/);
    expect(message).not.toContain(baselineFixture.sessionId);
    expect(message).not.toContain(baselineFixture.recordId);
  });

  it('Final 실제 결과와 7일 완료 의미를 같은 톤으로 포함한다', () => {
    const analysis = deriveAnalysis(throughDay6Fixture);
    expect(analysis.ok).toBe(true);
    if (!analysis.ok) return;
    const representative = selectRepresentativeCertification(analysis.value.certifications, analysis.value.scores);
    const message = finalShareMessage(analysis.value);
    expect(message).toContain('[쓸능검 최종 분석] · 7일 완료');
    expect(message).toContain(`최종 종합 쓸능검 ${analysis.value.overallScore}점`);
    expect(message).toContain(profileDisplay(analysis.value.profile)!.replace('\n', ' '));
    expect(message).toContain(CERTIFICATION_LABELS[representative.ability][representative.tier]);
    expect(finalShareMessage(analysis.value)).toBe(message);
    expect(message).not.toMatch(/sessionId|recordId|localDateKey|profileFamilyKey|contentKey|startedAt|completedAt/);
  });
});
