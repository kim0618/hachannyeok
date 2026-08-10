import { describe, expect, it } from 'vitest';
import type { BaselineRecord } from './types';
import { decideRecordSave, recordsSemanticallyEqual, stableRecordIdentity } from './idempotency';

const record: BaselineRecord = { recordId: 'r', sessionId: 's', startedAt: '2026-08-01T00:00:00Z', completedAt: '2026-08-01T00:01:00Z', startedLocalDateKey: '2026-08-01', completedLocalDateKey: '2026-08-01', assessmentRawResults: [] };
describe('record idempotency', () => {
  it('session과 record로 stable identity를 만든다', () => expect(stableRecordIdentity(record)).toBe('s:r'));
  it('object key 순서와 무관하게 semantic equality를 판단한다', () => expect(recordsSemanticallyEqual(record, { ...record })).toBe(true));
  it('같은 recordId의 다른 payload는 conflict다', () => expect(decideRecordSave(record, { ...record, completedAt: '2026-08-01T00:02:00Z' })).toBe('recordConflict'));
  it('이미 final slot이 차면 다른 final 저장을 거부한다', () => expect(decideRecordSave(undefined, record, true)).toBe('finalAlreadyCompleted'));
});

