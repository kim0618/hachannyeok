import { describe, expect, it } from 'vitest';
import { StorageMutationCoordinator } from './StorageMutationCoordinator';

describe('StorageMutationCoordinator', () => {
  it('앞선 mutation이 끝난 뒤 다음 mutation을 시작한다', async () => {
    const coordinator = new StorageMutationCoordinator();
    const events: string[] = [];
    let releaseFirst: (() => void) | undefined;
    const first = coordinator.enqueue(async () => {
      events.push('first:start');
      await new Promise<void>((resolve) => { releaseFirst = resolve; });
      events.push('first:end');
    });
    const second = coordinator.enqueue(async () => { events.push('second'); });

    await Promise.resolve();
    expect(events).toEqual(['first:start']);
    releaseFirst?.();
    await Promise.all([first, second]);
    expect(events).toEqual(['first:start', 'first:end', 'second']);
  });

  it('실패한 mutation 뒤에도 queue를 계속 처리한다', async () => {
    const coordinator = new StorageMutationCoordinator();
    const first = coordinator.enqueue(async () => { throw new Error('failed'); });
    const second = coordinator.enqueue(async () => 'saved');
    await expect(first).rejects.toThrow('failed');
    await expect(second).resolves.toBe('saved');
  });

  it('느린 checkpoint 뒤 final baseline을 실행해 최종 root를 baseline으로 유지한다', async () => {
    const coordinator = new StorageMutationCoordinator();
    let stored = 'empty'; let releaseCheckpoint: (() => void) | undefined;
    const checkpoint = coordinator.enqueue(async () => {
      await new Promise<void>((resolve) => { releaseCheckpoint = resolve; });
      stored = 'checkpoint';
    });
    const final = coordinator.enqueue(async () => { stored = 'baseline'; });
    await Promise.resolve();
    releaseCheckpoint?.();
    await Promise.all([checkpoint, final]);
    expect(stored).toBe('baseline');
  });

  it('연속 checkpoint와 reset을 enqueue 순서대로 적용한다', async () => {
    const coordinator = new StorageMutationCoordinator();
    let stored: string | null = null; let releaseFirst: (() => void) | undefined;
    const first = coordinator.enqueue(async () => {
      await new Promise<void>((resolve) => { releaseFirst = resolve; });
      stored = 'checkpoint-1';
    });
    const second = coordinator.enqueue(async () => { stored = 'checkpoint-2'; });
    const reset = coordinator.enqueue(async () => { stored = null; });
    await Promise.resolve();
    releaseFirst?.();
    await Promise.all([first, second, reset]);
    expect(stored).toBeNull();
  });
});
