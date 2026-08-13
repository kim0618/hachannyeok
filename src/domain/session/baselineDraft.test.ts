import { describe, expect, it } from 'vitest';
import { DAY1_ASSESSMENT_IDS } from '../assessment/results';
import { baselineFixture, day1RawFixture } from '../../test/day1Fixture';
import { addBaselineResult, buildBaselineRecord, type BaselineDraft } from './baselineDraft';
import { isPersistedAppData } from '../storage/schema';

describe('DAY 1 baseline draft', () => {
  it('각 완료 raw result를 보존하고 engine 순서로 정확히 5개를 구성한다', () => {
    const draft = day1RawFixture.reduce<BaselineDraft>(addBaselineResult, {});
    const identity = { recordId: baselineFixture.recordId, sessionId: baselineFixture.sessionId, startedAt: baselineFixture.startedAt, completedAt: baselineFixture.completedAt, startedLocalDateKey: baselineFixture.startedLocalDateKey, completedLocalDateKey: baselineFixture.completedLocalDateKey };
    const result = buildBaselineRecord(draft, identity);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record.assessmentRawResults).toHaveLength(5);
      expect(result.record.assessmentRawResults.map((item) => item.assessmentType)).toEqual(DAY1_ASSESSMENT_IDS);
      expect(result.record.assessmentRawResults).toEqual(day1RawFixture);
      expect(isPersistedAppData({ schemaVersion: 1, baseline: result.record, dailyRecords: [], metadata: {} })).toBe(true);
    }
  });
  it('다섯 결과가 모이기 전 baseline을 만들지 않는다', () => {
    const identity = { recordId: baselineFixture.recordId, sessionId: baselineFixture.sessionId, startedAt: baselineFixture.startedAt, completedAt: baselineFixture.completedAt, startedLocalDateKey: baselineFixture.startedLocalDateKey, completedLocalDateKey: baselineFixture.completedLocalDateKey };
    expect(buildBaselineRecord(addBaselineResult({}, day1RawFixture[0]!), identity)).toEqual({ ok: false, reason: 'missingResults' });
  });
});
