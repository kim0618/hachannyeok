import { describe, expect, it } from 'vitest';
import { baselineFixture } from '../../test/day1Fixture';
import { MemoryStorageAdapter } from './MemoryStorageAdapter';

const data = { schemaVersion: 1 as const, baseline: baselineFixture, dailyRecords: [], metadata: {} };
describe('MemoryStorageAdapter', () => {
  it('load/save/clear와 failure injection을 제공한다', async () => {
    const storage = new MemoryStorageAdapter();
    expect(await storage.load()).toEqual({ ok: true, data: null });
    expect(await storage.save(data)).toEqual({ ok: true });
    expect(storage.peek()).toEqual(data);
    storage.fail('save'); expect(await storage.save({ ...data, baseline: undefined })).toEqual({ ok: false, error: 'writeFailed' });
    storage.recover('save'); expect(storage.peek()?.baseline?.recordId).toBe(baselineFixture.recordId);
    expect(await storage.clear()).toEqual({ ok: true }); expect(storage.peek()).toBeNull();
  });
});
