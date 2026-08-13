import { decideRecordSave } from './idempotency';
import { validatePersistedAppData } from './schema';
import type { BaselineRecord, PersistedAppData } from './types';

export type PrepareBaselineSaveResult =
  | { ok: true; data: PersistedAppData; idempotent: boolean }
  | { ok: false; error: 'recordConflict' | 'corruptData' };

export function prepareBaselineSave(current: PersistedAppData, baseline: BaselineRecord, writtenAt: string): PrepareBaselineSaveResult {
  const decision = decideRecordSave(current.baseline, baseline);
  if (decision === 'recordConflict' || decision === 'finalAlreadyCompleted') return { ok: false, error: 'recordConflict' };
  if (decision === 'idempotentSuccess') return { ok: true, data: current, idempotent: true };
  const candidate: PersistedAppData = {
    ...current,
    baseline,
    activeBaselineSession: null,
    metadata: { ...current.metadata, lastSuccessfulWriteAt: writtenAt },
  };
  const validation = validatePersistedAppData(candidate);
  return validation.ok ? { ok: true, data: validation.data, idempotent: false } : { ok: false, error: 'corruptData' };
}
