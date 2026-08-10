import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { AnimationScheduler } from './useControlAssessment';
import { useControlAssessment } from './useControlAssessment';

class FakeScheduler implements AnimationScheduler {
  callbacks = new Map<number, FrameRequestCallback>();
  nextId = 1;
  cancelled: number[] = [];
  request(callback: FrameRequestCallback) { const id = this.nextId++; this.callbacks.set(id, callback); return id; }
  cancel(id: number) { this.cancelled.push(id); this.callbacks.delete(id); }
  frame() { const callbacks = [...this.callbacks.values()]; this.callbacks.clear(); callbacks.forEach((callback) => callback(0)); }
}

const setup = () => {
  let now = 100;
  let day = 10;
  let id = 0;
  const scheduler = new FakeScheduler();
  const options = { clock: { now: () => now }, dateNow: () => new Date(2026, 7, day), createTrialId: () => `trial-${++id}`, animationScheduler: scheduler };
  const hook = renderHook(() => useControlAssessment(options));
  return { ...hook, scheduler, setNow: (value: number) => { now = value; }, setDay: (value: number) => { day = value; } };
};

afterEach(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); });

describe('useControlAssessment', () => {
  it('fake clock stop 위치를 마지막 render state가 아닌 순수 clock으로 저장한다', () => {
    const test = setup();
    act(() => test.result.current.startTrial());
    test.setNow(1100);
    act(() => test.result.current.stopTrial());
    expect(test.result.current.lastTrial).toMatchObject({ valid: true, observedPosition: 0.4, targetPosition: 0.4, speedNormalized: 0.32 });
  });

  it('duplicate stop은 trial 하나만 만든다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.setNow(1100);
    act(() => { test.result.current.stopTrial(); test.result.current.stopTrial(); });
    expect(test.result.current.trials).toHaveLength(1);
  });

  it('end 도달은 insufficientObservation invalid이며 stop/end race도 하나만 기록한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.setNow(2726);
    act(() => { test.scheduler.frame(); test.result.current.stopTrial(); });
    expect(test.result.current.trials).toHaveLength(1);
    expect(test.result.current.lastTrial).toMatchObject({ valid: false, invalidReason: 'insufficientObservation' });
    expect(test.result.current.validTrials).toHaveLength(0);
  });

  it.each([
    [0, 2624.999, true], [0, 2625, false], [0, 2625.001, false],
    [1, 2099.999, true], [1, 2100, false], [1, 2100.001, false],
    [2, 1749.999, true], [2, 1750, false], [2, 1750.001, false],
  ])('config %i elapsed %fms에서 RAF보다 stop을 먼저 처리한다', (attemptIndex, elapsedMs, expectedValid) => {
    const test = setup();
    let now = 100;
    for (let attempt = 0; attempt < attemptIndex; attempt += 1) {
      act(() => test.result.current.startTrial());
      now += 100;
      test.setNow(now);
      act(() => test.result.current.stopTrial());
    }
    act(() => test.result.current.startTrial());
    now += elapsedMs;
    test.setNow(now);
    act(() => test.result.current.stopTrial());

    expect(test.result.current.trials).toHaveLength(attemptIndex + 1);
    expect(test.result.current.lastTrial).toMatchObject(expectedValid
      ? { valid: true }
      : { valid: false, invalidReason: 'insufficientObservation' });
  });

  it('visibility/end race는 active trial을 한 번만 확정한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.setNow(2726);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); test.scheduler.frame(); });
    expect(test.result.current.trials).toHaveLength(1);
    expect(test.result.current.lastTrial).toMatchObject({ valid: false, invalidReason: 'backgrounded' });
  });

  it('date/end race는 dateInvalidated를 유지하고 reset한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.setDay(11); test.setNow(2726);
    act(() => test.scheduler.frame());
    expect(test.result.current.phase).toBe('dateInvalidated');
    expect(test.result.current.lastTrial).toMatchObject({ valid: false, invalidReason: 'dateChanged' });
    act(() => test.result.current.resetAssessment());
    expect(test.result.current.phase).toBe('ready'); expect(test.result.current.trials).toHaveLength(0);
  });

  it('3 attempts valid2는 complete, valid1은 retry, max6 valid 부족은 incomplete다', () => {
    const complete = setup();
    for (const elapsed of [1000, 3000, 1250]) { act(() => complete.result.current.startTrial()); complete.setNow(complete.result.current.trials.length === 0 ? 1100 : complete.result.current.trials.at(-1)!.completedAtMs! + elapsed); act(() => complete.result.current.stopTrial()); }
    expect(complete.result.current.phase).toBe('complete');

    const incomplete = setup();
    for (let attempt = 0; attempt < 6; attempt += 1) { act(() => incomplete.result.current.startTrial()); incomplete.setNow(10000 + attempt * 10000); act(() => incomplete.scheduler.frame()); }
    expect(incomplete.result.current.phase).toBe('incomplete');
  });

  it('unmount 시 RAF를 정리한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); const requested = test.scheduler.nextId - 1;
    test.unmount();
    expect(test.scheduler.cancelled).toContain(requested);
  });
});
