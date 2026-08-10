import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BALANCE_INITIAL_POSITIONS } from './balanceMeasurement';
import { useBalanceAssessment } from './useBalanceAssessment';

function setup() {
  let time = 0;
  let date = new Date('2026-08-10T12:00:00');
  let id = 0;
  const hook = renderHook(() => useBalanceAssessment({ clock: { now: () => time }, dateNow: () => date, createTrialId: () => `trial-${++id}` }));
  return { ...hook, setTime: (value: number) => { time = value; }, setDate: (value: string) => { date = new Date(value); } };
}
afterEach(() => vi.restoreAllMocks());

describe('useBalanceAssessment', () => {
  it('vertical에서 시작하고 확정 위치를 raw evidence로 저장한 뒤 horizontal로 진행한다', () => {
    const { result, setTime } = setup();
    act(() => result.current.startTrial());
    expect(result.current.orientation).toBe('vertical');
    expect(result.current.dividerRatio).toBe(BALANCE_INITIAL_POSITIONS.vertical);
    act(() => result.current.moveDivider(0.42));
    setTime(100);
    act(() => { result.current.confirmTrial(); result.current.confirmTrial(); });
    expect(result.current.trials).toHaveLength(1);
    expect(result.current.trials[0]).toMatchObject({ valid: true, targetRatio: 0.5, observedRatio: 0.42, orientation: 'vertical', startedAtMs: 0, completedAtMs: 100 });
    act(() => result.current.startTrial());
    expect(result.current.orientation).toBe('horizontal');
    expect(result.current.dividerRatio).toBe(BALANCE_INITIAL_POSITIONS.horizontal);
  });

  it('2 valid attempts면 complete다', () => {
    const { result } = setup();
    act(() => result.current.startTrial()); act(() => result.current.moveDivider(0.48)); act(() => result.current.confirmTrial());
    act(() => result.current.startTrial()); act(() => result.current.moveDivider(0.53)); act(() => result.current.confirmTrial());
    expect(result.current.phase).toBe('complete');
  });

  it('2 attempts 중 valid가 하나면 retry다', () => {
    const { result } = setup();
    act(() => result.current.startTrial()); act(() => result.current.confirmTrial());
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial()); act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.validTrials).toHaveLength(1);
    expect(result.current.completion.status).toBe('retryAllowed');
  });

  it('retry orientation은 vertical/horizontal로 결정적으로 순환한다', () => {
    const { result } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const orientations: string[] = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      act(() => result.current.startTrial()); orientations.push(result.current.orientation);
      act(() => document.dispatchEvent(new Event('visibilitychange')));
    }
    expect(orientations).toEqual(['vertical', 'horizontal', 'vertical']);
    expect(result.current.completion.status).toBe('retryAllowed');
  });

  it('5 attempts에서 valid가 부족하면 incomplete다', () => {
    const { result } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    for (let attempt = 0; attempt < 5; attempt += 1) { act(() => result.current.startTrial()); act(() => document.dispatchEvent(new Event('visibilitychange'))); }
    expect(result.current.phase).toBe('incomplete');
  });

  it('running 중 background는 invalid attempt다', () => {
    const { result } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial());
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.trials[0]).toMatchObject({ valid: false, invalidReason: 'backgrounded' });
  });

  it('running 자정 변경은 dateChanged 하나만 기록하고 전체 reset을 요구한다', () => {
    const { result, setDate } = setup();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial());
    setDate('2026-08-11T00:00:01');
    act(() => { document.dispatchEvent(new Event('visibilitychange')); result.current.confirmTrial(); });
    expect(result.current.trials).toHaveLength(1);
    expect(result.current.trials[0]).toMatchObject({ invalidReason: 'dateChanged' });
    expect(result.current.phase).toBe('dateInvalidated');
    act(() => result.current.resetAssessment());
    expect(result.current.trials).toHaveLength(0);
    expect(result.current.phase).toBe('ready');
  });

  it('trial 사이 날짜 변경은 evidence를 섞지 않는다', () => {
    const { result, setDate } = setup();
    act(() => result.current.startTrial()); act(() => result.current.confirmTrial());
    setDate('2026-08-11T12:00:00');
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('dateInvalidated');
    expect(result.current.trials).toHaveLength(1);
  });
});
