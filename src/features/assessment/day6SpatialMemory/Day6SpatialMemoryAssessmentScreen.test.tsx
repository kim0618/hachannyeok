import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DAY6_SPATIAL_MEMORY_CONFIGS } from '../../../domain/assessment/day6SpatialMemoryConfig';
import type { Day6TimerScheduler } from './useDay6SpatialMemoryAssessment';
import { Day6SpatialMemoryAssessmentScreen } from './Day6SpatialMemoryAssessmentScreen';

class Scheduler implements Day6TimerScheduler { callbacks: Array<() => void> = []; delays: number[] = []; set(callback: () => void, delay: number) { this.callbacks.push(callback); this.delays.push(delay); return this.callbacks.length; } clear() {} run() { this.callbacks.shift()?.(); } }
const setup = () => { const scheduler = new Scheduler(); const view = render(<Day6SpatialMemoryAssessmentScreen sessionDateKey="2026-08-17" dateNow={() => new Date('2026-08-17T12:00:00Z')} scheduler={scheduler} clock={{ now: () => 2000 }} onDateInvalidated={() => undefined} onComplete={() => undefined}/>); return { scheduler, ...view }; };

describe('Day6SpatialMemoryAssessmentScreen presentation', () => {
  it('실제 target은 exposure에만 있고 blank/recall에는 ghost가 없다', () => {
    const { scheduler, container } = setup();
    expect(container.querySelectorAll('.day6-preview .memory-target')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(scheduler.delays).toEqual([1200]);
    expect(container.querySelectorAll('.memory-target')).toHaveLength(3);
    expect([...container.querySelectorAll<HTMLElement>('.memory-target')].map((node) => [node.style.left, node.style.top])).toEqual(DAY6_SPATIAL_MEMORY_CONFIGS[0].map((point) => [`${point.x * 100}%`, `${point.y * 100}%`]));
    act(() => scheduler.run());
    expect(scheduler.delays).toEqual([1200, 300]);
    expect(container.querySelectorAll('.memory-target')).toHaveLength(0);
    act(() => scheduler.run());
    expect(container.querySelectorAll('.memory-target')).toHaveLength(0);
    expect(screen.getByRole('application', { name: '기억나는 위치를 선택하는 영역' })).toBeInTheDocument();
  });

  it('세 번째 선택 직후 RESULT가 기존 매칭 line 3개를 표시한다', () => {
    const { scheduler, container } = setup();
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); act(() => { scheduler.run(); scheduler.run(); });
    const area = screen.getByRole('application', { name: '기억나는 위치를 선택하는 영역' });
    Object.defineProperty(area, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 100, height: 100 }) });
    for (const [clientX, clientY] of [[20, 30], [70, 30], [50, 70]]) fireEvent.pointerDown(area, { clientX, clientY });
    expect(screen.getByRole('heading', { name: /평균 위치 오차/ })).toBeInTheDocument();
    expect(container.querySelectorAll('.memory-result .memory-target')).toHaveLength(3);
    expect(container.querySelectorAll('.memory-result .memory-selected')).toHaveLength(3);
    expect(container.querySelectorAll('.memory-match-lines line')).toHaveLength(3);
  });
});
