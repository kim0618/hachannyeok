import { describe, expect, it, vi } from 'vitest';
import { baselineFixture } from '../../test/day1Fixture';
import { AppsInTossStorageAdapter, STORAGE_KEY, type StringStorageApi } from './AppsInTossStorageAdapter';

const data = { schemaVersion: 1 as const, baseline: baselineFixture, dailyRecords: [], metadata: {} };
const api = (stored: string | null = null): StringStorageApi => ({ getItem: vi.fn().mockResolvedValue(stored), setItem: vi.fn().mockResolvedValue(undefined), removeItem: vi.fn().mockResolvedValue(undefined) });

describe('AppsInTossStorageAdapter', () => {
  it('고정 key에서 JSON을 읽고 migration/runtime validation을 수행한다', async () => {
    const sdk = api(JSON.stringify(data));
    await expect(new AppsInTossStorageAdapter(sdk).load()).resolves.toEqual({ ok: true, data });
    expect(sdk.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
  it('문자열 JSON으로 저장하고 앱 전용 key만 삭제한다', async () => {
    const sdk = api(); const adapter = new AppsInTossStorageAdapter(sdk);
    await expect(adapter.save(data)).resolves.toEqual({ ok: true });
    expect(sdk.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(data));
    await expect(adapter.clear()).resolves.toEqual({ ok: true });
    expect(sdk.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
  it('없는 값, JSON 손상, future version과 SDK reject를 구분한다', async () => {
    await expect(new AppsInTossStorageAdapter(api()).load()).resolves.toEqual({ ok: true, data: null });
    await expect(new AppsInTossStorageAdapter(api('{')).load()).resolves.toEqual({ ok: false, error: 'corruptData' });
    await expect(new AppsInTossStorageAdapter(api('{"schemaVersion":2}')).load()).resolves.toEqual({ ok: false, error: 'unsupportedSchemaVersion' });
    const failed = api(); vi.mocked(failed.getItem).mockRejectedValue(new Error('bridge'));
    await expect(new AppsInTossStorageAdapter(failed).load()).resolves.toEqual({ ok: false, error: 'readFailed' });
  });
});
