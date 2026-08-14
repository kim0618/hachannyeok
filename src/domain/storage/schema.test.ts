import { describe, expect, it } from 'vitest';
import { migratePersistedData } from './migration';
import { isActiveBaselineSession, isFinalRecord, validatePersistedAppData } from './schema';
import { day1RawFixture } from '../../test/day1Fixture';
import { throughDay4Fixture } from '../../test/dailyThroughDay4Fixture';
import { DAY5_CONTROL_TRIAL_CONFIGS } from '../assessment/day5ControlConfig';

const validTimeTrial = (trialId: string) => ({ trialId, startedAtMs: 0, completedAtMs: 1, valid: true as const, invalidReason: null, kind: 'time' as const, condition: 'baseline' as const, targetDurationMs: 3000 as const, observedDurationMs: 3000 });
const completeDay1Time = { assessmentType: 'day1_time' as const, trials: [validTimeTrial('t1'), validTimeTrial('t2'), validTimeTrial('t3')] };
const checkpoint = (completedAssessmentIds: unknown[], partialRawResults: unknown[]) => ({
  sessionId: 's', startedAt: '2026-08-01T00:00:00Z', startedLocalDateKey: '2026-08-01', completedAssessmentIds, partialRawResults,
});
const finalTimeTrials = ['plain', 'distracted', 'plain'].map((condition, index) => ({
  trialId: `f${index}`, startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null, kind: 'timeCondition', condition, targetDurationMs: 3000, observedDurationMs: 3000,
}));
const finalRecord = (outerAbility: string, rawAbility: string) => ({
  recordId: 'f', sessionId: 's', selectedAbility: outerAbility, assessmentType: 'finalTime', startedAt: '2026-08-07T00:00:00Z', completedAt: '2026-08-07T00:01:00Z', localDateKey: '2026-08-07',
  rawResult: { assessmentType: 'finalTime', selectedAbility: rawAbility, trials: finalTimeTrials },
});

describe('persisted root schema와 migration', () => {
  it('현재 버전의 빈 root를 검증한다', () => expect(validatePersistedAppData({ schemaVersion: 1, dailyRecords: [], metadata: {} }).ok).toBe(true));
  it('파생 userState를 persistent root에서 거부한다', () => expect(validatePersistedAppData({ schemaVersion: 1, dailyRecords: [], metadata: {}, userState: 'A' }).ok).toBe(false));
  it('unknown payload를 corruptData로 처리한다', () => expect(migratePersistedData(null)).toEqual({ ok: false, error: 'corruptData' }));
  it('미래 schemaVersion을 덮어쓰지 않는다', () => expect(migratePersistedData({ schemaVersion: 2 })).toEqual({ ok: false, error: 'unsupportedSchemaVersion' }));
  it('unknown assessmentType을 throw 없이 corruptData로 거부한다', () => {
    const baseline = { recordId: 'b', sessionId: 's', startedAt: '2026-08-01T00:00:00Z', completedAt: '2026-08-01T00:01:00Z', startedLocalDateKey: '2026-08-01', completedLocalDateKey: '2026-08-01', assessmentRawResults: [{ assessmentType: 'day1_unknown', trials: [] }] };
    expect(() => validatePersistedAppData({ schemaVersion: 1, baseline, dailyRecords: [], metadata: {} })).not.toThrow();
    expect(validatePersistedAppData({ schemaVersion: 1, baseline, dailyRecords: [], metadata: {} })).toEqual({ ok: false, error: 'corruptData' });
  });
  it('잘못된 DAY 5 exact config persisted payload를 throw 없이 corruptData로 거부한다', () => {
    const trials = DAY5_CONTROL_TRIAL_CONFIGS.map((config, index) => ({ ...config, kind: 'controlCondition' as const, trialId: `d5-${index}`, startedAtMs: index, completedAtMs: index + 1, observedPosition: config.targetPosition, valid: true as const, invalidReason: null }));
    const day5 = { recordId: 'd5', sessionId: 'd5', analysisDay: 5, assessmentType: 'day5_control_surprise', startedAt: '2026-08-16T01:00:00Z', completedAt: '2026-08-16T01:01:00Z', localDateKey: '2026-08-16', rawResult: { assessmentType: 'day5_control_surprise', trials: trials.map((trial, index) => index === 1 ? { ...trial, speedChangeAtNormalizedTime: 0.40 } : trial) } };
    const payload = { ...throughDay4Fixture, dailyRecords: [...throughDay4Fixture.dailyRecords, day5] };
    expect(() => validatePersistedAppData(payload)).not.toThrow();
    expect(validatePersistedAppData(payload)).toEqual({ ok: false, error: 'corruptData' });
  });
  it('완료된 DAY 1 result만 checkpoint 완료 근거로 허용한다', () => {
    expect(isActiveBaselineSession(checkpoint(['day1_time'], [completeDay1Time]))).toBe(true);
    expect(isActiveBaselineSession(checkpoint(['day1_time'], [{ ...completeDay1Time, trials: [validTimeTrial('t1')] }]))).toBe(false);
  });
  it('checkpoint의 duplicate, unknown, mismatch ID와 duplicate result를 거부한다', () => {
    expect(isActiveBaselineSession(checkpoint(['day1_time', 'day1_time'], [completeDay1Time, completeDay1Time]))).toBe(false);
    expect(isActiveBaselineSession(checkpoint(['day1_unknown'], [completeDay1Time]))).toBe(false);
    expect(isActiveBaselineSession(checkpoint(['day1_center'], [completeDay1Time]))).toBe(false);
    expect(isActiveBaselineSession(checkpoint(['day1_time', 'day1_center'], [completeDay1Time, completeDay1Time]))).toBe(false);
  });
  it('checkpoint는 DAY 1 고정 순서의 canonical prefix만 허용한다', () => {
    expect(isActiveBaselineSession(checkpoint(['day1_center'], [day1RawFixture[1]]))).toBe(false);
    expect(isActiveBaselineSession(checkpoint(['day1_time', 'day1_balance_two_way'], [day1RawFixture[0], day1RawFixture[2]]))).toBe(false);
    expect(isActiveBaselineSession(checkpoint(['day1_time', 'day1_center'], day1RawFixture.slice(0, 2)))).toBe(true);
  });
  it('FinalRecord outer/raw ability와 assessment arm literal을 모두 일치시킨다', () => {
    expect(isFinalRecord(finalRecord('time', 'time'))).toBe(true);
    expect(isFinalRecord(finalRecord('focus', 'time'))).toBe(false);
    expect(isFinalRecord(finalRecord('focus', 'focus'))).toBe(false);
  });
});
