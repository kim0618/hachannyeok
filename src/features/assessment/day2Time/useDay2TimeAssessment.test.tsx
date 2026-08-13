import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDay2TimeAssessment } from './useDay2TimeAssessment';

function setup() {
  let time = 0; let date = new Date('2026-08-13T12:00:00'); let id = 0;
  const hook = renderHook(() => useDay2TimeAssessment({ sessionDateKey: '2026-08-13', clock: { now: () => time }, dateNow: () => date, createTrialId: () => `d2-${++id}` }));
  return { ...hook, setTime: (value: number) => { time = value; }, setDate: (value: string) => { date = new Date(value); } };
}

describe('useDay2TimeAssessment', () => {
  it('unrounded performance duration과 condition을 raw evidence로 보존한다', () => {
    const { result, setTime } = setup();
    act(() => result.current.startTrial()); setTime(3187.25); act(() => result.current.completeTrial());
    expect(result.current.trials[0]).toMatchObject({ condition: 'plain', targetDurationMs: 3000, observedDurationMs: 3187.25 });
  });
  it('동기 guard가 double tap을 trial 하나로 제한한다', () => {
    const { result, setTime } = setup(); act(() => result.current.startTrial()); setTime(3000);
    act(() => { result.current.completeTrial(); result.current.completeTrial(); });
    expect(result.current.trials).toHaveLength(1);
  });
  it('네 target trial을 plain/distracted 순서로 완료한다', () => {
    const { result, setTime } = setup();
    for (let index = 0; index < 4; index += 1) { act(() => result.current.startTrial()); setTime((index + 1) * 3000); act(() => result.current.completeTrial()); }
    expect(result.current.trials.map((trial) => trial.condition)).toEqual(['plain', 'distracted', 'plain', 'distracted']);
    expect(result.current.phase).toBe('complete');
  });
  it('background와 visibility/date race를 한 invalid trial로 확정한다', () => {
    const { result, setDate } = setup(); vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => result.current.startTrial()); setDate('2026-08-14T00:00:01');
    act(() => { document.dispatchEvent(new Event('visibilitychange')); result.current.completeTrial(); });
    expect(result.current.trials).toHaveLength(1); expect(result.current.trials[0]).toMatchObject({ valid: false, invalidReason: 'dateChanged' }); expect(result.current.phase).toBe('dateInvalidated');
  });
  it('target+3에서 condition minimum을 못 채우면 incomplete다', () => {
    const { result } = setup(); vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    for (let index = 0; index < 7; index += 1) { act(() => result.current.startTrial()); act(() => document.dispatchEvent(new Event('visibilitychange'))); }
    expect(result.current.phase).toBe('incomplete'); expect(result.current.completion.status).toBe('assessmentIncomplete');
  });
});
