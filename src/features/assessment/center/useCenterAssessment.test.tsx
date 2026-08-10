import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCenterAssessment } from './useCenterAssessment';

const rect = { left: 100, top: 200, width: 200, height: 100 };
const clock = { now: vi.fn(() => 100) };

describe('Center assessment state', () => {
  it('세 도형을 고정 순서로 진행하고 valid 2회면 완료한다', () => {
    const { result } = renderHook(() => useCenterAssessment({ clock, dateNow: () => new Date(2026, 7, 10), createTrialId: () => 'id' }));
    const shapes: unknown[] = [];
    for (const pointer of [{ clientX: 200, clientY: 250 }, { clientX: 150, clientY: 225 }, { clientX: 99, clientY: 250 }]) {
      act(() => result.current.startTrial());
      shapes.push(result.current.activeShape);
      act(() => result.current.selectPosition(pointer, rect));
    }
    expect(shapes).toEqual(['rectangle', 'wideRectangle', 'square']);
    expect(result.current.phase).toBe('complete');
    expect(result.current.trials).toHaveLength(3);
    expect(result.current.trials[0]).toMatchObject({ valid: true, target: { x: 0.5, y: 0.5 }, observed: { x: 0.5, y: 0.5 } });
    expect(result.current.trials[1]).toMatchObject({ valid: true, observed: { x: 0.25, y: 0.25 } });
    expect(result.current.trials[2]).toMatchObject({ valid: false, invalidReason: 'outOfBounds' });
  });

  it('동기 guard로 한 trial의 중복 pointer 입력을 한 번만 기록한다', () => {
    const { result } = renderHook(() => useCenterAssessment({ createTrialId: () => 'id' }));
    act(() => result.current.startTrial());
    act(() => { result.current.selectPosition({ clientX: 200, clientY: 250 }, rect); result.current.selectPosition({ clientX: 150, clientY: 225 }, rect); });
    expect(result.current.trials).toHaveLength(1);
  });

  it('3 attempts valid1이면 retry 후 최대 6회 valid1이면 incomplete다', () => {
    const { result } = renderHook(() => useCenterAssessment());
    for (let index = 0; index < 3; index += 1) {
      act(() => result.current.startTrial());
      act(() => result.current.selectPosition({ clientX: index === 0 ? 200 : 99, clientY: 250 }, rect));
    }
    expect(result.current.completion.status).toBe('retryAllowed');
    for (let index = 0; index < 3; index += 1) {
      act(() => result.current.startTrial());
      act(() => result.current.selectPosition({ clientX: 99, clientY: 250 }, rect));
    }
    expect(result.current.phase).toBe('incomplete');
  });

  it('RUNNING background 전환을 invalid attempt로 기록한다', () => {
    const { result } = renderHook(() => useCenterAssessment());
    act(() => result.current.startTrial());
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.trials[0]).toMatchObject({ valid: false, invalidReason: 'backgrounded' });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  it('RUNNING 날짜 변경과 trial 사이 날짜 변경 모두 전체 restart를 요구한다', () => {
    let day = 10;
    const { result } = renderHook(() => useCenterAssessment({ dateNow: () => new Date(2026, 7, day) }));
    act(() => result.current.startTrial());
    day = 11;
    act(() => result.current.selectPosition({ clientX: 200, clientY: 250 }, rect));
    expect(result.current.phase).toBe('dateInvalidated');
    expect(result.current.trials[0]).toMatchObject({ invalidReason: 'dateChanged' });
    act(() => result.current.resetAssessment());
    act(() => result.current.startTrial());
    act(() => result.current.selectPosition({ clientX: 200, clientY: 250 }, rect));
    day = 12;
    act(() => result.current.startTrial());
    expect(result.current.phase).toBe('dateInvalidated');
    act(() => result.current.resetAssessment());
    expect(result.current.trials).toEqual([]);
    expect(result.current.phase).toBe('ready');
  });
});
