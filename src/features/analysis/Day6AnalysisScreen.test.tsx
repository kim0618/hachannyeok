import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DAY6_EXPOSURE_DURATION_MS, day6ConfigForAttempt } from '../../domain/assessment/day6SpatialMemoryConfig';
import type { SpatialMemoryTrial } from '../../domain/assessment/trials';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import type { DailyRecord, PersistedAppData } from '../../domain/storage/types';
import { throughDay5Fixture } from '../../test/dailyThroughDay4Fixture';
import { Day6AnalysisScreen } from './Day6AnalysisScreen';

const validTrial = (attemptIndex: number, error: number): SpatialMemoryTrial => ({
  kind: 'spatialMemory', shownPositions: day6ConfigForAttempt(attemptIndex).map((point) => ({ ...point })), selectedPositions: day6ConfigForAttempt(attemptIndex).map((point) => ({ x: point.x + error, y: point.y })), exposureDurationMs: DAY6_EXPOSURE_DURATION_MS, responseTimeMs: 400, trialId: `day6-${attemptIndex}`, startedAtMs: attemptIndex * 2000, completedAtMs: attemptIndex * 2000 + 1900, valid: true, invalidReason: null,
});
const invalidTrial = (attemptIndex: number): SpatialMemoryTrial => ({
  kind: 'spatialMemory', shownPositions: day6ConfigForAttempt(attemptIndex).map((point) => ({ ...point })), selectedPositions: [], exposureDurationMs: DAY6_EXPOSURE_DURATION_MS, trialId: `day6-${attemptIndex}`, startedAtMs: attemptIndex * 2000, completedAtMs: attemptIndex * 2000 + 100, valid: false, invalidReason: 'backgrounded',
});
const recordFor = (trials: SpatialMemoryTrial[]): DailyRecord => ({ recordId: 'day6-record', sessionId: 'day6-session', analysisDay: 6, assessmentType: 'day6_spatial_memory', startedAt: '2026-08-17T01:00:00Z', completedAt: '2026-08-17T01:01:00Z', localDateKey: '2026-08-17', rawResult: { assessmentType: 'day6_spatial_memory', trials } });
const renderResult = (trials: SpatialMemoryTrial[]) => {
  const record = recordFor(trials), before = deriveAnalysis(throughDay5Fixture);
  const afterRoot: PersistedAppData = { ...throughDay5Fixture, dailyRecords: [...throughDay5Fixture.dailyRecords, record] };
  const after = deriveAnalysis(afterRoot);
  expect(before.ok && after.ok).toBe(true);
  if (!before.ok || !after.ok) throw new Error('DAY 6 fixture must derive');
  render(<Day6AnalysisScreen record={record} before={before.value} after={after.value} saveStatus="saved" onHome={() => undefined} />);
  return { before: before.value, after: after.value };
};
const conditionValue = (label: string) => within(screen.getByText(label).parentElement!).getByText(/%$/).textContent;

describe('Day6AnalysisScreen', () => {
  it('정상 A/B를 spread/clustered로 표시하고 Focus를 secondary로 둔다', () => {
    renderResult([validTrial(0, .02), validTrial(1, .08)]);
    expect(conditionValue('넓은 배치 · SPREAD')).toBe('2.0%');
    expect(conditionValue('밀집 배치 · CLUSTERED')).toBe('8.0%');
    expect(screen.getByRole('heading', { name: '위치가 서로 가까워지면 기억 지점이 조금 더 흔들리는 편' })).toBeInTheDocument();
    expect(screen.getByText('심화 분석 5/5')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '시각 집중 점수' }).closest('section')).toHaveClass('score-secondary');
  });

  it('invalid A 뒤에도 원래 attempt index로 B/A identity와 scoring 방향을 유지한다', () => {
    const { before, after } = renderResult([invalidTrial(0), validTrial(1, .08), validTrial(2, .02)]);
    expect(conditionValue('넓은 배치 · SPREAD')).toBe('2.0%');
    expect(conditionValue('밀집 배치 · CLUSTERED')).toBe('8.0%');
    expect(screen.getByText('+6.0%p')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '위치가 서로 가까워지면 기억 지점이 조금 더 흔들리는 편' })).toBeInTheDocument();
    expect(after.scores.focus).toBeLessThan(before.scores.focus);
    expect(after.scores.time).toBe(before.scores.time);
    expect(after.scores.center).toBe(before.scores.center);
    expect(after.scores.balance).toBe(before.scores.balance);
    expect(after.scores.control).toBe(before.scores.control);
  });
});
