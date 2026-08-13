import type { StorageLoadResult, StoragePort, StorageWriteResult } from '../../domain/storage/StoragePort';
import type { PersistedAppData } from '../../domain/storage/types';

type Failure = 'load' | 'save' | 'clear';

export class MemoryStorageAdapter implements StoragePort {
  private data: PersistedAppData | null;
  private failures = new Set<Failure>();

  constructor(initial: PersistedAppData | null = null) { this.data = initial === null ? null : structuredClone(initial); }
  fail(operation: Failure): void { this.failures.add(operation); }
  recover(operation: Failure): void { this.failures.delete(operation); }
  peek(): PersistedAppData | null { return this.data === null ? null : structuredClone(this.data); }

  async load(): Promise<StorageLoadResult> {
    if (this.failures.has('load')) return { ok: false, error: 'readFailed' };
    return { ok: true, data: this.peek() };
  }
  async save(data: PersistedAppData): Promise<StorageWriteResult> {
    if (this.failures.has('save')) return { ok: false, error: 'writeFailed' };
    this.data = structuredClone(data);
    return { ok: true };
  }
  async clear(): Promise<StorageWriteResult> {
    if (this.failures.has('clear')) return { ok: false, error: 'writeFailed' };
    this.data = null;
    return { ok: true };
  }
}
