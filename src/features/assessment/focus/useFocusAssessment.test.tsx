import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useFocusAssessment, type FocusFrameScheduler } from './useFocusAssessment';

class FakeFrameScheduler implements FocusFrameScheduler {
  callbacks = new Map<number, FrameRequestCallback>();
  cancelled: number[] = [];
  nextId = 1;
  request(callback: FrameRequestCallback) { const id = this.nextId++; this.callbacks.set(id, callback); return id; }
  cancel(id: number) { this.cancelled.push(id); this.callbacks.delete(id); }
  frame() { const callbacks = [...this.callbacks.values()]; this.callbacks.clear(); callbacks.forEach((callback) => callback(0)); }
}

const setup = () => {
  let now = 100;
  let day = 10;
  let id = 0;
  const scheduler = new FakeFrameScheduler();
  const options = { clock: { now: () => now }, dateNow: () => new Date(2026, 7, day), createTrialId: () => `trial-${++id}`, frameScheduler: scheduler };
  const hook = renderHook(() => useFocusAssessment(options));
  return { ...hook, scheduler, setNow: (value: number) => { now = value; }, setDay: (value: number) => { day = value; }, activate: () => { act(() => scheduler.frame()); act(() => scheduler.frame()); } };
};

afterEach(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); });

describe('useFocusAssessment', () => {
  it('double RAF 전 입력을 무시하고 두 번째 RAF 뒤 활성화한다', () => {
    const test = setup(); act(() => test.result.current.startTrial());
    act(() => test.result.current.selectItem('focus-baseline-1-item-02'));
    expect(test.result.current.trials).toHaveLength(0); expect(test.result.current.interactive).toBe(false);
    act(() => test.scheduler.frame());
    act(() => test.result.current.selectItem('focus-baseline-1-item-02'));
    expect(test.result.current.trials).toHaveLength(0); expect(test.result.current.interactive).toBe(false);
    act(() => test.scheduler.frame());
    expect(test.result.current.interactive).toBe(true);
  });

  it('target 선택은 correct true이고 fake clock raw RT를 반올림 없이 보존한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.activate(); test.setNow(1340.25);
    act(() => test.result.current.selectItem('focus-baseline-1-item-02'));
    expect(test.result.current.lastTrial).toMatchObject({ valid: true, correct: true, reactionTimeMs: 1240.25, selectedTargetId: 'focus-baseline-1-item-02' });
  });

  it('distractor 선택도 valid이며 incorrect RT를 보존하고 중복 선택은 막는다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.activate(); test.setNow(765.5);
    act(() => { test.result.current.selectItem('focus-baseline-1-item-01'); test.result.current.selectItem('focus-baseline-1-item-02'); });
    expect(test.result.current.trials).toHaveLength(1);
    expect(test.result.current.lastTrial).toMatchObject({ valid: true, correct: false, reactionTimeMs: 665.5, selectedTargetId: 'focus-baseline-1-item-01' });
  });

  it('activation 중 visibility hidden은 background invalid이고 stale RAF가 되살리지 않는다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); act(() => test.scheduler.frame());
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    test.setNow(150);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(test.result.current.lastTrial).toMatchObject({ valid: false, invalidReason: 'backgrounded' });
    act(() => test.scheduler.frame());
    expect(test.result.current.interactive).toBe(false); expect(test.result.current.trials).toHaveLength(1);
  });

  it('active background은 한 번만 invalid 처리한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.activate();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); document.dispatchEvent(new Event('visibilitychange')); });
    expect(test.result.current.trials).toHaveLength(1); expect(test.result.current.lastTrial).toMatchObject({ invalidReason: 'backgrounded' });
  });

  it('RUNNING 날짜 변경은 dateChanged invalid와 전체 restart 상태다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.activate(); test.setDay(11);
    act(() => test.result.current.selectItem('focus-baseline-1-item-02'));
    expect(test.result.current.phase).toBe('dateInvalidated'); expect(test.result.current.lastTrial).toMatchObject({ valid: false, invalidReason: 'dateChanged' });
    act(() => test.result.current.resetAssessment());
    expect(test.result.current.phase).toBe('ready'); expect(test.result.current.trials).toHaveLength(0);
  });

  it('trial 사이 날짜 변경은 evidence를 섞지 않고 restart를 요구한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); test.activate(); act(() => test.result.current.selectItem('focus-baseline-1-item-02'));
    test.setDay(11); act(() => test.result.current.startTrial());
    expect(test.result.current.phase).toBe('dateInvalidated'); expect(test.result.current.trials).toHaveLength(1);
  });

  it('3 attempts valid2는 complete이고 valid incorrect도 valid count에 포함한다', () => {
    const test = setup();
    const choices = ['focus-baseline-1-item-01', 'focus-baseline-2-item-08', 'focus-baseline-3-item-01'];
    choices.forEach((choice) => { act(() => test.result.current.startTrial()); test.activate(); test.setNow(200 + test.result.current.trials.length * 100); act(() => test.result.current.selectItem(choice)); });
    expect(test.result.current.phase).toBe('complete'); expect(test.result.current.validTrials).toHaveLength(3);
  });

  it('6 attempts 모두 background invalid이면 incomplete이고 retry config가 순환한다', () => {
    const test = setup();
    for (let attempt = 0; attempt < 6; attempt += 1) {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      act(() => test.result.current.startTrial());
      expect(test.result.current.activeConfig.stimulusId).toBe(`focus-baseline-${(attempt % 3) + 1}`);
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      act(() => document.dispatchEvent(new Event('visibilitychange')));
    }
    expect(test.result.current.phase).toBe('incomplete'); expect(test.result.current.completion.status).toBe('assessmentIncomplete');
  });

  it('unmount가 activation RAF를 취소한다', () => {
    const test = setup(); act(() => test.result.current.startTrial()); const requested = test.scheduler.nextId - 1; test.unmount();
    expect(test.scheduler.cancelled).toContain(requested);
  });
});
