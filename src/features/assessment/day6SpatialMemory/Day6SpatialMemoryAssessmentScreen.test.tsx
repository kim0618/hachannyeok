import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DAY6_BLANK_DURATION_MS, DAY6_EXPOSURE_DURATION_MS, DAY6_SPATIAL_MEMORY_CONFIGS } from '../../../domain/assessment/day6SpatialMemoryConfig';
import { Day6SpatialMemoryAssessmentScreen } from './Day6SpatialMemoryAssessmentScreen';
import type { Day6TimerScheduler } from './useDay6SpatialMemoryAssessment';

class Scheduler implements Day6TimerScheduler {
  callbacks: { callback: () => void; delay: number }[] = [];
  set = (callback: () => void, delay: number) => { this.callbacks.push({ callback, delay }); return this.callbacks.length; };
  clear = () => {};
  run() { this.callbacks.shift()?.callback(); }
}
const props = (scheduler: Scheduler) => ({ sessionDateKey: '2026-08-17' as const, dateNow: () => new Date('2026-08-17T12:00:00Z'), scheduler, createTrialId: () => 'memory-trial', onComplete: vi.fn(), onDateInvalidated: vi.fn() });

describe('Day6SpatialMemoryAssessmentScreen presentation', () => {
  it('READY는 실제 target preview 없이 OBSERVE → CLEAR → RECALL 과정을 설명한다', () => {
    const view = render(<Day6SpatialMemoryAssessmentScreen {...props(new Scheduler())}/>);
    expect(screen.getByText('보고 난 위치를 얼마나 정확히 기억할까?')).toBeInTheDocument();
    expect(screen.getByText('01 · OBSERVE')).toBeInTheDocument();
    expect(screen.getByText('02 · CLEAR')).toBeInTheDocument();
    expect(screen.getByText('03 · RECALL')).toBeInTheDocument();
    expect(screen.getByText(/넓은 배치 · SPREAD/)).toBeInTheDocument();
    expect(view.container.querySelectorAll('.memory-target')).toHaveLength(0);
    expect(view.container.querySelectorAll('.day6-preview .memory-target')).toHaveLength(0);
  });

  it('Exposure 3개 → Blank 0개 → Recall 0개이며 상태와 timing 계약을 유지한다', () => {
    const scheduler = new Scheduler();
    const view = render(<Day6SpatialMemoryAssessmentScreen {...props(scheduler)}/>);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(screen.getByText('OBSERVE')).toBeInTheDocument();
    expect(view.container.querySelectorAll('.memory-target')).toHaveLength(3);
    expect([...view.container.querySelectorAll<HTMLElement>('.memory-target')].map((node) => [node.style.left, node.style.top])).toEqual(DAY6_SPATIAL_MEMORY_CONFIGS[0]!.map((point) => [`${point.x * 100}%`, `${point.y * 100}%`]));
    expect(scheduler.callbacks[0]?.delay).toBe(DAY6_EXPOSURE_DURATION_MS);
    act(() => scheduler.run());
    expect(screen.getByText('MEMORY HOLD')).toBeInTheDocument();
    expect(view.container.querySelectorAll('.memory-target')).toHaveLength(0);
    expect(view.container.querySelectorAll('.memory-selected')).toHaveLength(0);
    expect(scheduler.callbacks[0]?.delay).toBe(DAY6_BLANK_DURATION_MS);
    act(() => scheduler.run());
    expect(screen.getByText('RECALL')).toBeInTheDocument();
    expect(screen.getByText('선택 0 / 3')).toBeInTheDocument();
    expect(view.container.querySelectorAll('.memory-target,.memory-match-lines')).toHaveLength(0);
  });

  it('Recall은 선택 count만 표시하고 RESULT는 기존 matching 선 3개를 사용한다', () => {
    const scheduler = new Scheduler();
    const view = render(<Day6SpatialMemoryAssessmentScreen {...props(scheduler)}/>);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    act(() => { scheduler.run(); scheduler.run(); });
    const area = screen.getByRole('application', { name: '기억나는 위치를 선택하는 영역' });
    Object.defineProperty(area, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 100, height: 100 }) });
    fireEvent.pointerDown(area, { clientX: 22, clientY: 28 });
    expect(screen.getByText('선택 1 / 3')).toBeInTheDocument();
    fireEvent.pointerDown(area, { clientX: 72, clientY: 30 });
    expect(screen.getByText('선택 2 / 3')).toBeInTheDocument();
    fireEvent.pointerDown(area, { clientX: 50, clientY: 72 });
    expect(screen.getByText('MEMORY RECONSTRUCTION')).toBeInTheDocument();
    expect(screen.getByText(/넓은 배치 · SPREAD/)).toBeInTheDocument();
    expect(view.container.querySelectorAll('.memory-match-lines line')).toHaveLength(3);
    expect(view.container.querySelectorAll('.memory-result .memory-target')).toHaveLength(3);
    expect(view.container.querySelectorAll('.memory-result .memory-selected')).toHaveLength(3);
    expect(screen.getByText('위치 기억 오차')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /평균/ })).toBeInTheDocument();
  });
});
