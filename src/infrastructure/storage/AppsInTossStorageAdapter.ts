import { Storage } from '@apps-in-toss/web-framework';
import type { StorageLoadResult, StoragePort, StorageWriteResult } from '../../domain/storage/StoragePort';
import { migratePersistedData } from '../../domain/storage/migration';
import type { PersistedAppData } from '../../domain/storage/types';

export const STORAGE_KEY = 'hachannyeok.profile.v1';

export interface StringStorageApi {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class AppsInTossStorageAdapter implements StoragePort {
  private readonly storage: StringStorageApi;
  constructor(storage: StringStorageApi = Storage) { this.storage = storage; }

  async load(): Promise<StorageLoadResult> {
    let serialized: string | null;
    try {
      serialized = await this.storage.getItem(STORAGE_KEY);
    } catch {
      return { ok: false, error: 'readFailed' };
    }
    if (serialized === null) return { ok: true, data: null };
    let payload: unknown;
    try {
      payload = JSON.parse(serialized);
    } catch {
      return { ok: false, error: 'corruptData' };
    }
    return migratePersistedData(payload);
  }

  async save(data: PersistedAppData): Promise<StorageWriteResult> {
    try {
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch {
      return { ok: false, error: 'writeFailed' };
    }
  }

  async clear(): Promise<StorageWriteResult> {
    try {
      await this.storage.removeItem(STORAGE_KEY);
      return { ok: true };
    } catch {
      return { ok: false, error: 'writeFailed' };
    }
  }
}

export const appsInTossStorage = new AppsInTossStorageAdapter();
