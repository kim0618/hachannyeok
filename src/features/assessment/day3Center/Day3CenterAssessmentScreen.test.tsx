import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { normalizePointerPosition } from '../center/centerMeasurement';
import { Day3CenterAssessmentScreen } from './Day3CenterAssessmentScreen';
const rect = { left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120, x: 10, y: 20, toJSON: () => ({}) };
const props = (overrides = {}) => ({ sessionDateKey: '2026-08-14' as const, dateNow: () => new Date('2026-08-14T12:00:00'), onComplete: vi.fn(), onDateInvalidated: vi.fn(), ...overrides });
const start = () => { fireEvent.click(screen.getByRole('button', { name: /측정 시작/ })); const area = screen.getByRole('application', { name: '위치를 선택하는 영역' }); vi.spyOn(area, 'getBoundingClientRect').mockReturnValue(rect); return area; };
describe('Day3CenterAssessmentScreen', () => {
  it('normalized coordinate는 clamp하지 않고 geometry 오류를 거부한다', () => {
    expect(normalizePointerPosition({ clientX: 110, clientY: 70 }, rect)).toEqual({ ok: true, point: { x: .5, y: .5 } });
    expect(normalizePointerPosition({ clientX: 9, clientY: 70 }, rect)).toEqual({ ok: false, reason: 'outOfBounds' });
    expect(normalizePointerPosition({ clientX: 10, clientY: 20 }, { ...rect, width: 0 })).toEqual({ ok: false, reason: 'outOfBounds' });
    expect(normalizePointerPosition({ clientX: Number.NaN, clientY: 20 }, rect)).toEqual({ ok: false, reason: 'outOfBounds' });
    expect(normalizePointerPosition({ clientX: Infinity, clientY: 20 }, rect)).toEqual({ ok: false, reason: 'outOfBounds' });
  });
  it('plain/left/right를 표시하고 duplicate pointer는 trial 하나만 만든다', () => {
    const done = vi.fn(); render(<Day3CenterAssessmentScreen {...props({ onComplete: done })} />);
    let area = start();
    for (let index = 0; index < 3; index += 1) { expect(area.querySelectorAll('.day3-decoration')).toHaveLength(index === 0 ? 0 : 5); fireEvent.pointerDown(area, { clientX: 110, clientY: 70 }); fireEvent.pointerDown(area, { clientX: 120, clientY: 70 }); if (index < 2) { fireEvent.click(screen.getByRole('button', { name: '다음 측정' })); area = screen.getByRole('application', { name: '위치를 선택하는 영역' }); vi.spyOn(area, 'getBoundingClientRect').mockReturnValue(rect); } }
    fireEvent.click(screen.getByRole('button', { name: '결과 확인' })); expect(done).toHaveBeenCalledOnce(); expect(done.mock.calls[0]![0].trials).toHaveLength(3);
  });
  it('RUNNING background는 invalid retry로 보내고 기존 기록 삭제를 요구하지 않는다', () => {
    render(<Day3CenterAssessmentScreen {...props()} />); start(); Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByRole('alert')).toHaveTextContent('다시 측정'); Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });
  it('trial 사이 날짜 변경을 다음 시작 전에 차단한다', () => {
    let day = 14; const invalidated = vi.fn(); render(<Day3CenterAssessmentScreen {...props({ dateNow: () => new Date(`2026-08-${day}T12:00:00`), onDateInvalidated: invalidated })} />);
    const area = start(); fireEvent.pointerDown(area, { clientX: 110, clientY: 70 }); day = 15; fireEvent.click(screen.getByRole('button', { name: '다음 측정' })); expect(screen.getByRole('alert')).toHaveTextContent('날짜');
  });
});
