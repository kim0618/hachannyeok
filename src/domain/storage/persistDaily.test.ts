import { describe, expect, it } from 'vitest';
import { baselineFixture } from '../../test/day1Fixture';
import { prepareDailySave } from './persistDaily';
import type { DailyRecord, PersistedAppData } from './types';

const rawResult = { assessmentType: 'day2_time_distraction' as const, trials: ['plain', 'distracted', 'plain', 'distracted'].map((condition, index) => ({ kind: 'timeCondition' as const, condition: condition as 'plain' | 'distracted', targetDurationMs: 3000 as const, observedDurationMs: 3000 + index * 100, trialId: `d2-${index}`, startedAtMs: index * 4000, completedAtMs: index * 4000 + 3000, valid: true as const, invalidReason: null })) };
const record: DailyRecord = { recordId: 'day2-session:day2', sessionId: 'day2-session', analysisDay: 2, assessmentType: 'day2_time_distraction', startedAt: '2026-08-13T01:00:00.000Z', completedAt: '2026-08-13T01:01:00.000Z', localDateKey: '2026-08-13', rawResult };
const root: PersistedAppData = { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} };

describe('prepareDailySave', () => {
  it('DAY 2 raw record를 baseline 보존 상태로 append한다', () => {
    const result = prepareDailySave(root, record, record.completedAt); expect(result.ok).toBe(true); if (!result.ok) return;
    expect(result.data.baseline).toEqual(baselineFixture); expect(result.data.dailyRecords).toEqual([record]);
  });
  it('동일 record retry는 idempotent이고 같은 날짜의 새 record는 거부한다', () => {
    const saved = { ...root, dailyRecords: [record] };
    expect(prepareDailySave(saved, record, record.completedAt)).toMatchObject({ ok: true, idempotent: true });
    expect(prepareDailySave(saved, { ...record, recordId: 'other', analysisDay: 3 }, record.completedAt)).toMatchObject({ ok: false });
  });
});
