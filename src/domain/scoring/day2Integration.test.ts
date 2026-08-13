import { describe, expect, it } from 'vitest';
import { baselineFixture } from '../../test/day1Fixture';
import type { PersistedAppData } from '../storage/types';
import { deriveAnalysis } from './deriveAnalysis';

const dailyRecord = { recordId: 'd2:day2', sessionId: 'd2', analysisDay: 2 as const, assessmentType: 'day2_time_distraction' as const, startedAt: '2026-08-13T01:00:00.000Z', completedAt: '2026-08-13T01:01:00.000Z', localDateKey: '2026-08-13' as const, rawResult: { assessmentType: 'day2_time_distraction' as const, trials: ['plain', 'distracted', 'plain', 'distracted'].map((condition, index) => ({ kind: 'timeCondition' as const, condition: condition as 'plain' | 'distracted', targetDurationMs: 3000 as const, observedDurationMs: condition === 'plain' ? 3000 : 4100, trialId: `d2-${index}`, startedAtMs: index * 5000, completedAtMs: index * 5000 + 3000, valid: true as const, invalidReason: null })) } };

describe('DAY 2 scoring integration', () => {
  it('baseline raw를 바꾸지 않고 Time만 ±8 cap 안에서 갱신한다', () => {
    const beforeRoot: PersistedAppData = { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} };
    const baselineSnapshot = structuredClone(baselineFixture);
    const before = deriveAnalysis(beforeRoot); const after = deriveAnalysis({ ...beforeRoot, dailyRecords: [dailyRecord] });
    expect(before.ok && after.ok).toBe(true); if (!before.ok || !after.ok) return;
    for (const ability of ['center', 'balance', 'control', 'focus'] as const) expect(after.value.scores[ability]).toBe(before.value.scores[ability]);
    expect(Math.abs(after.value.scores.time - before.value.scores.time)).toBeLessThanOrEqual(8);
    expect(baselineFixture).toEqual(baselineSnapshot);
    expect(deriveAnalysis({ ...beforeRoot, dailyRecords: [dailyRecord] })).toEqual(after);
  });
});
