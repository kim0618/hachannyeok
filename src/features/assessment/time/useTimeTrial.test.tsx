import { act, renderHook } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTimeTrial, type MeasurementClock } from './useTimeTrial';

function setup(initialTime = 0, initialDate = '2026-08-10T12:00:00') {
  let time = initialTime;
  let date = new Date(initialDate);
  let id = 0;
  const clock: MeasurementClock = { now: () => time };
  const hook = renderHook(() => useTimeTrial({ clock, dateNow: () => date, createTrialId: () => `trial-${++id}` }));
  return {
    ...hook,
    setTime: (next: number) => { time = next; },
    setDate: (next: string) => { date = new Date(next); },
  };
}

afterEach(() => vi.restoreAllMocks());

describe('useTimeTrial', () => {
  it('ready에서 시작하면 running이 된다', () => {
    const { result } = setup();
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('running');
  });

  it('주입 clock 0 → 3000을 반올림 없이 보존한다', () => {
    const { result, setTime } = setup();
    act(() => result.current.startTrial());
    setTime(3000);
    act(() => result.current.completeTrial());
    expect(result.current.trials[0]).toMatchObject({ valid: true, observedDurationMs: 3000, startedAtMs: 0, completedAtMs: 3000 });
  });

  it('빠른 중복 completion 입력은 trial 하나만 만든다', () => {
    const { result, setTime } = setup();
    act(() => result.current.startTrial());
    setTime(3180);
    act(() => { result.current.completeTrial(); result.current.completeTrial(); });
    expect(result.current.trials).toHaveLength(1);
  });

  it('running 중 visibility hidden이면 backgrounded invalid trial을 만든다', () => {
    const { result, setTime } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial());
    setTime(1000);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.trials[0]).toMatchObject({ valid: false, invalidReason: 'backgrounded' });
  });

  it('시작 후 local date가 바뀌면 dateChanged invalid trial을 만든다', () => {
    const { result, setTime, setDate } = setup();
    act(() => result.current.startTrial());
    setTime(3000);
    setDate('2026-08-11T00:00:01');
    act(() => result.current.completeTrial());
    expect(result.current.trials[0]).toMatchObject({ valid: false, invalidReason: 'dateChanged' });
    expect(result.current.phase).toBe('dateInvalidated');
  });

  it('trial 사이에 날짜가 바뀌면 새 trial을 시작하거나 기존 evidence와 결합하지 않는다', () => {
    const { result, setTime, setDate } = setup();
    act(() => result.current.startTrial());
    setTime(3000);
    act(() => result.current.completeTrial());
    setDate('2026-08-11T12:00:00');
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('dateInvalidated');
    expect(result.current.trials).toHaveLength(1);
    expect(result.current.getAssessmentStartedLocalDateKey()).toBe('2026-08-10');
  });

  it('이전 날짜 valid 1개와 새 날짜 trial을 합쳐 complete하지 않는다', () => {
    const { result, setTime, setDate } = setup();
    act(() => result.current.startTrial()); setTime(3000); act(() => result.current.completeTrial());
    setDate('2026-08-11T12:00:00');
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('dateInvalidated');
    expect(result.current.completion.status).toBe('notEnoughAttempts');
    expect(result.current.validTrials).toHaveLength(1);
  });

  it('이전 날짜 valid 2개 뒤 새 날짜 세 번째 trial로 complete하지 않는다', () => {
    const { result, setTime, setDate } = setup();
    act(() => result.current.startTrial()); setTime(3000); act(() => result.current.completeTrial());
    act(() => result.current.startTrial()); setTime(6000); act(() => result.current.completeTrial());
    setDate('2026-08-11T12:00:00');
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('dateInvalidated');
    expect(result.current.trials).toHaveLength(2);
    expect(result.current.completion.status).toBe('notEnoughAttempts');
  });

  it('자정 변경과 visibility hidden이 연속되어도 trial 하나만 append하고 전체 재시작을 요구한다', () => {
    const { result, setDate } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial());
    setDate('2026-08-11T00:00:01');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      result.current.completeTrial();
    });
    expect(result.current.trials).toHaveLength(1);
    expect(result.current.trials[0]).toMatchObject({ valid: false, invalidReason: 'dateChanged' });
    expect(result.current.phase).toBe('dateInvalidated');
    expect(result.current.validTrials).toHaveLength(0);
  });

  it('날짜 변경 후 다시 시작하면 assessment evidence와 날짜를 모두 초기화한다', () => {
    const { result, setTime, setDate } = setup();
    act(() => result.current.startTrial()); setTime(3000); act(() => result.current.completeTrial());
    setDate('2026-08-11T12:00:00');
    act(() => result.current.startTrial());
    act(() => result.current.resetAssessment());
    expect(result.current.phase).toBe('ready');
    expect(result.current.trials).toHaveLength(0);
    expect(result.current.validTrials).toHaveLength(0);
    expect(result.current.getAssessmentStartedLocalDateKey()).toBeNull();
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('running');
    expect(result.current.getAssessmentStartedLocalDateKey()).toBe('2026-08-11');
  });

  it('3 attempts 중 valid 2개면 complete다', () => {
    const { result, setTime } = setup();
    act(() => result.current.startTrial()); setTime(3000); act(() => result.current.completeTrial());
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial()); setTime(4000); act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => result.current.startTrial()); setTime(7000); act(() => result.current.completeTrial());
    expect(result.current.phase).toBe('complete');
    expect(result.current.validTrials).toHaveLength(2);
  });

  it('3 attempts에서 valid가 부족하면 retry를 허용한다', () => {
    const { result, setTime } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    for (let index = 0; index < 3; index += 1) {
      act(() => result.current.startTrial()); setTime(index + 1); act(() => document.dispatchEvent(new Event('visibilitychange')));
    }
    expect(result.current.completion.status).toBe('retryAllowed');
    expect(result.current.phase).toBe('result');
  });

  it('6 attempts에서도 valid 2개 미만이면 assessmentIncomplete다', () => {
    const { result, setTime } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    for (let index = 0; index < 6; index += 1) {
      act(() => result.current.startTrial()); setTime(index + 1); act(() => document.dispatchEvent(new Event('visibilitychange')));
    }
    expect(result.current.completion.status).toBe('assessmentIncomplete');
    expect(result.current.phase).toBe('incomplete');
  });

  it('invalid trial은 validTrials에서 제외한다', () => {
    const { result } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial());
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.trials).toHaveLength(1);
    expect(result.current.validTrials).toHaveLength(0);
  });

  it('StrictMode effect 재실행 때 visibility listener를 정리한다', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;
    const { unmount } = renderHook(() => useTimeTrial({ createTrialId: () => 'id' }), { wrapper });
    unmount();
    const added = add.mock.calls.filter(([name]) => name === 'visibilitychange').length;
    const removed = remove.mock.calls.filter(([name]) => name === 'visibilitychange').length;
    expect(added).toBeGreaterThanOrEqual(2);
    expect(removed).toBe(added);
  });
});
