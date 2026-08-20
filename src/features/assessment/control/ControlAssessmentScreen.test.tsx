import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ControlAssessmentScreen } from './ControlAssessmentScreen';
import type { AnimationScheduler } from './useControlAssessment';

const scheduler: AnimationScheduler = { request: () => 1, cancel: () => undefined };

describe('ControlAssessmentScreen', () => {
  const showFirstResult = (elapsedMs: number) => {
    let now = 0;
    const rendered = render(<ControlAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} animationScheduler={scheduler} createTrialId={() => 'result'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    now = elapsedMs;
    fireEvent.click(screen.getByRole('button', { name: '지금 멈추기' }));
    return rendered;
  };
  it('ready에서 숫자 측정값 없이 running으로 진입한다', () => {
    render(<ControlAssessmentScreen onComplete={() => undefined} clock={{ now: () => 0 }} animationScheduler={scheduler} createTrialId={() => 'id'} />);
    expect(screen.getByRole('heading', { name: '손가락 통제' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(screen.getByRole('button', { name: '지금 멈추기' })).toBeInTheDocument();
    expect(screen.queryByText(/속도/)).not.toBeInTheDocument();
    expect(screen.getByText(/표시가 움직이고 있습니다/)).toBeInTheDocument();
  });
  it('RUNNING START/TARGET/live marker는 실제 config와 RAF state에 직접 연결된다', () => {
    let now = 0; let frame: FrameRequestCallback | undefined;
    const { container } = render(<ControlAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} animationScheduler={{ request: (callback) => { frame = callback; return 1; }, cancel: vi.fn() }} createTrialId={() => 'live'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(container.querySelector('.control-start')).toHaveStyle({ left: '8%' });
    expect(container.querySelector('.control-target')).toHaveStyle({ left: '40%' });
    expect(container.querySelector('.control-marker')).toHaveStyle({ left: '8%' });
    now = 500; act(() => frame?.(now));
    expect(container.querySelector('.control-marker')).toHaveStyle({ left: '24%' });
    expect(container.querySelector('.control-marker')?.className).toBe('control-marker');
    expect(container.querySelector('.control-running-decoration')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText(/%|속도|남은 거리|가까워요|곧 도착/)).not.toBeInTheDocument();
  });
  it('READY preview는 비상호작용이며 RAF/raw를 시작하지 않는다', () => {
    const request = vi.fn(() => 1);
    const createTrialId = vi.fn(() => 'control-ready');
    const { container } = render(<ControlAssessmentScreen onComplete={() => undefined} animationScheduler={{ request, cancel: vi.fn() }} createTrialId={createTrialId} />);
    const preview = container.querySelector('.control-ready-preview');
    expect(container.querySelectorAll('.control-ready-content')).toHaveLength(1);
    expect(container.querySelector('.instrument-ready')).not.toBeInTheDocument();
    expect(preview).toHaveAttribute('aria-hidden', 'true');
    expect(preview).toHaveStyle({ pointerEvents: 'none' });
    fireEvent.pointerDown(preview!); fireEvent.click(preview!);
    expect(request).not.toHaveBeenCalled();
    expect(createTrialId).not.toHaveBeenCalled();
  });
  it('측정 시작 1회로 READY를 제거하고 기존 첫 config와 timing으로 RUNNING에 진입한다', () => {
    const request = vi.fn(() => 7);
    const clock = { now: vi.fn(() => 1234) };
    const { container } = render(<ControlAssessmentScreen onComplete={() => undefined} clock={clock} animationScheduler={{ request, cancel: vi.fn() }} createTrialId={() => 'control-running'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(container.querySelector('.control-ready-content')).not.toBeInTheDocument();
    expect(container.querySelector('.control-ready-preview')).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
    expect(clock.now).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.control-marker')).toHaveStyle({ left: '8%' });
    expect(container.querySelector('.control-target')).toHaveStyle({ left: '40%' });
    expect(screen.queryByText(/속도|거리|곧 도착/)).not.toBeInTheDocument();
  });
  it('target .40 / observed .417을 actual 좌표와 1.7% overshoot로 표시한다', () => {
    const { container } = showFirstResult(1053.125);
    expect(screen.getByRole('heading', { name: '약 1.7%' })).toBeInTheDocument();
    expect(screen.getAllByText('40.0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('41.7%').length).toBeGreaterThan(0);
    expect(screen.getByText('목표보다 약 1.7% 지나쳤어요.')).toBeInTheDocument();
    expect(container.querySelector('.control-result-start')).toHaveStyle({ left: '8%' });
    expect(container.querySelector('.control-result-target')).toHaveStyle({ left: '40%' });
    expect(container.querySelector('.control-result-actual')).toHaveStyle({ left: '41.7%' });
    expect(container.querySelector('.control-result-distance')).toHaveStyle({ left: '40%', width: '1.7000000000000028%' });
    expect(screen.getAllByText('실제 정지 위치')).toHaveLength(2);
    expect(screen.getAllByText('목표 위치')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '다음 측정' })).toBeInTheDocument();
  });
  it('target .40 / observed .383을 1.7% undershoot로 표시한다', () => {
    const { container } = showFirstResult(946.875);
    expect(screen.getByRole('heading', { name: '약 1.7%' })).toBeInTheDocument();
    expect(screen.getByText('목표보다 약 1.7% 덜 갔어요.')).toBeInTheDocument();
    expect(container.querySelector('.control-result-actual')).toHaveStyle({ left: '38.3%' });
    expect(container.querySelector('.control-result-distance')).toHaveStyle({ left: '38.3%' });
  });
  it('target과 observed가 같으면 0.0%, exact copy, marker overlap을 표시한다', () => {
    const { container } = showFirstResult(1000);
    expect(screen.getByRole('heading', { name: '약 0.0%' })).toBeInTheDocument();
    expect(screen.getByText('목표 위치에 정확히 멈췄어요.')).toBeInTheDocument();
    expect(container.querySelector('.control-result-target')).toHaveStyle({ left: '40%' });
    expect(container.querySelector('.control-result-actual')).toHaveStyle({ left: '40%' });
    expect(container.querySelector('.control-result-distance')).toHaveStyle({ width: '0%' });
  });

  it('정확한 stop의 result와 valid-only complete summary를 표시한다', () => {
    let now = 0;
    const clock = { now: () => now };
    const createTrialId = () => `${now}`;
    render(<ControlAssessmentScreen onComplete={() => undefined} clock={clock} animationScheduler={scheduler} createTrialId={createTrialId} />);
    for (const elapsed of [1000, 3000, 1250]) {
      fireEvent.click(screen.getByRole('button', { name: now === 0 ? '측정 시작' : /다음 측정|다시 측정/ }));
      now += elapsed;
      fireEvent.click(screen.getByRole('button', { name: '지금 멈추기' }));
      if (elapsed === 1000) expect(screen.getByRole('heading', { name: '약 0.0%' })).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { name: '손가락 통제 측정 완료' })).toBeInTheDocument();
    expect(screen.getByText('1번째 측정')).toBeInTheDocument();
  });
  it('완료 시 raw Control result를 전달한다', () => {
    let now = 0;
    const onComplete = vi.fn();
    render(<ControlAssessmentScreen onComplete={onComplete} clock={{ now: () => now }} animationScheduler={scheduler} createTrialId={() => String(now)} />);
    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' }));
      now += 1000;
      fireEvent.click(screen.getByRole('button', { name: '지금 멈추기' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ assessmentType: 'day1_control_constant', trials: expect.any(Array) }));
  });
});
