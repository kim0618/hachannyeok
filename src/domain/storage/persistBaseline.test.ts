import { describe, expect, it } from 'vitest';
import { baselineFixture } from '../../test/day1Fixture';
import { prepareBaselineSave } from './persistBaseline';

const empty = { schemaVersion: 1 as const, dailyRecords: [], metadata: {} };
describe('baseline persistence preparation', () => {
  it('raw baseline만 추가하고 파생 필드를 저장하지 않는다', () => {
    const result = prepareBaselineSave(empty, baselineFixture, '2026-08-12T01:03:00.000Z');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.baseline).toEqual(baselineFixture);
    expect(Object.keys(result.data)).toEqual(['schemaVersion', 'dailyRecords', 'metadata', 'baseline', 'activeBaselineSession']);
    expect(JSON.stringify(result.data)).not.toMatch(/overallScore|abilityScores|profile|certification|insights/);
  });
  it('동일 record retry는 idempotent success이고 다른 semantic payload는 conflict다', () => {
    const current = { ...empty, baseline: baselineFixture };
    expect(prepareBaselineSave(current, { ...baselineFixture }, 'later')).toMatchObject({ ok: true, idempotent: true });
    expect(prepareBaselineSave(current, { ...baselineFixture, completedAt: '2026-08-12T01:04:00.000Z' }, 'later')).toEqual({ ok: false, error: 'recordConflict' });
  });
});
