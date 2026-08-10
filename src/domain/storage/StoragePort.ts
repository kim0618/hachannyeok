import type { PersistedAppData } from './types';

export type StorageLoadResult = { ok: true; data: PersistedAppData | null } | { ok: false; error: 'readFailed' | 'corruptData' | 'unsupportedSchemaVersion' };
export type StorageWriteResult = { ok: true } | { ok: false; error: 'writeFailed' };
export interface StoragePort {
  load(): Promise<StorageLoadResult>;
  save(data: PersistedAppData): Promise<StorageWriteResult>;
  clear(): Promise<StorageWriteResult>;
}

