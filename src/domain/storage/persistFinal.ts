import { decideRecordSave } from './idempotency';
import { validatePersistedAppData } from './schema';
import type { FinalRecord, PersistedAppData } from './types';

export type PrepareFinalSaveResult = { ok: true; data: PersistedAppData; idempotent: boolean } | { ok: false; error: 'recordConflict' | 'finalAlreadyCompleted' | 'finalDateInvalid' | 'corruptData' };
export function prepareFinalSave(current: PersistedAppData, record: FinalRecord, writtenAt: string): PrepareFinalSaveResult {
  const decision = decideRecordSave(current.finalRecord, record, current.finalRecord !== undefined);
  if (decision === 'idempotentSuccess') return { ok: true, data: current, idempotent: true };
  if (decision === 'recordConflict') return { ok: false, error: current.finalRecord ? 'finalAlreadyCompleted' : 'recordConflict' };
  if (decision === 'finalAlreadyCompleted') return { ok: false, error: 'finalAlreadyCompleted' };
  if (current.dailyRecords.length !== 5 || record.localDateKey <= current.dailyRecords[4]!.localDateKey) return { ok: false, error: 'finalDateInvalid' };
  const candidate = { ...current, finalRecord: record, metadata: { ...current.metadata, lastSuccessfulWriteAt: writtenAt } };
  const validation = validatePersistedAppData(candidate);
  return validation.ok ? { ok: true, data: validation.data, idempotent: false } : { ok: false, error: 'corruptData' };
}
