import { decideRecordSave } from './idempotency';
import { validatePersistedAppData } from './schema';
import type { DailyRecord, PersistedAppData } from './types';

export type PrepareDailySaveResult =
  | { ok: true; data: PersistedAppData; idempotent: boolean }
  | { ok: false; error: 'recordConflict' | 'duplicateDailyDate' | 'unexpectedAnalysisDay' | 'corruptData' };

export function prepareDailySave(current: PersistedAppData, record: DailyRecord, writtenAt: string): PrepareDailySaveResult {
  const sameId = current.dailyRecords.find((item) => item.recordId === record.recordId);
  const decision = decideRecordSave(sameId, record);
  if (decision === 'recordConflict' || decision === 'finalAlreadyCompleted') return { ok: false, error: 'recordConflict' };
  if (decision === 'idempotentSuccess') return { ok: true, data: current, idempotent: true };
  const expectedDay = current.dailyRecords.length + 2;
  if (record.analysisDay !== expectedDay) return { ok: false, error: 'unexpectedAnalysisDay' };
  if (current.dailyRecords.some((item) => item.localDateKey === record.localDateKey)) return { ok: false, error: 'duplicateDailyDate' };
  const candidate: PersistedAppData = { ...current, dailyRecords: [...current.dailyRecords, record], metadata: { ...current.metadata, lastSuccessfulWriteAt: writtenAt } };
  const validation = validatePersistedAppData(candidate);
  return validation.ok ? { ok: true, data: validation.data, idempotent: false } : { ok: false, error: 'corruptData' };
}
