import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FocusAssessmentScreen } from './FocusAssessmentScreen';
import { FOCUS_BASELINE_CONFIGS } from './focusConfig';
import type { FocusFrameScheduler } from './useFocusAssessment';

class ImmediateScheduler implements FocusFrameScheduler {
  callbacks: FrameRequestCallback[] = [];
  request(callback: FrameRequestCallback) { this.callbacks.push(callback); return this.callbacks.length; }
  cancel() { return undefined; }
  activate() { this.callbacks.shift()?.(0); this.callbacks.shift()?.(0); }
}

describe('FocusAssessmentScreen', () => {
  it('READY와 4x3 button grid를 렌더하며 label에 정답을 노출하지 않는다', () => {
    const scheduler = new ImmediateScheduler();
    render(<FocusAssessmentScreen onComplete={() => undefined} clock={{ now: () => 0 }} frameScheduler={scheduler} createTrialId={() => 'id'} />);
    expect(screen.getByRole('heading', { name: '시각 집중' })).toBeInTheDocument(); expect(screen.getByText('5 / 5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); act(() => scheduler.activate());
    expect(screen.getAllByRole('button')).toHaveLength(12);
    expect(screen.queryByRole('button', { name: /정답|타겟|도형/ })).not.toBeInTheDocument();
  });
  it('READY dummy matrix는 12개 중립 장식이며 RAF/raw/interaction을 시작하지 않는다', () => {
    const request = vi.fn(() => 1); const createTrialId = vi.fn(() => 'focus-ready'); const clock = { now: vi.fn(() => 10) };
    const { container } = render(<FocusAssessmentScreen onComplete={() => undefined} clock={clock} frameScheduler={{ request, cancel: vi.fn() }} createTrialId={createTrialId} />);
    const preview = container.querySelector('.focus-ready-preview');
    expect(container.querySelectorAll('.focus-ready-content')).toHaveLength(1);
    expect(container.querySelector('.instrument-ready')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.focus-ready-cell')).toHaveLength(12);
    expect(container.querySelectorAll('.focus-ready-cell button,[tabindex]')).toHaveLength(0);
    expect(preview).toHaveAttribute('aria-hidden', 'true'); expect(preview).toHaveStyle({ pointerEvents: 'none' });
    fireEvent.click(preview!); fireEvent.pointerDown(preview!);
    expect(request).not.toHaveBeenCalled(); expect(createTrialId).not.toHaveBeenCalled(); expect(clock.now).not.toHaveBeenCalled();
    expect(container.querySelector('.focus-grid')).not.toBeInTheDocument();
  });
  it('측정 시작 후 pending→첫 RAF→둘째 RAF에서만 interactive와 reaction clock을 시작한다', () => {
    const callbacks: FrameRequestCallback[] = []; const clock = { now: vi.fn(() => 321) };
    const { container } = render(<FocusAssessmentScreen onComplete={() => undefined} clock={clock} frameScheduler={{ request: (callback) => { callbacks.push(callback); return callbacks.length; }, cancel: vi.fn() }} createTrialId={() => 'focus-running'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(container.querySelector('.focus-ready-preview')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').every((button) => button.hasAttribute('disabled'))).toBe(true); expect(clock.now).not.toHaveBeenCalled();
    act(() => callbacks.shift()?.(0));
    expect(screen.getAllByRole('button').every((button) => button.hasAttribute('disabled'))).toBe(true); expect(clock.now).not.toHaveBeenCalled();
    act(() => callbacks.shift()?.(0));
    expect(screen.getAllByRole('button').some((button) => !button.hasAttribute('disabled'))).toBe(true); expect(clock.now).toHaveBeenCalledTimes(1);
  });

  it('RUNNING은 config row-major 순서와 동일 item style을 유지하고 정답 cue·timer·confirm CTA를 만들지 않는다', () => {
    const scheduler = new ImmediateScheduler();
    const { container } = render(<FocusAssessmentScreen onComplete={() => undefined} clock={{ now: () => 100 }} frameScheduler={scheduler} createTrialId={() => 'running-style'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); act(() => scheduler.activate());
    const items = screen.getAllByRole('button');
    const shapeTag = (button: HTMLElement) => button.querySelector('.focus-shape')?.firstElementChild?.tagName.toLowerCase();
    const expectedTag = { circle: 'circle', square: 'rect', triangle: 'path', diamond: 'path' } as const;
    expect(items.map(shapeTag)).toEqual(FOCUS_BASELINE_CONFIGS[0].items.map((item) => expectedTag[item.shape]));
    expect(new Set(items.map((item) => item.className))).toEqual(new Set(['focus-item']));
    expect(container.querySelectorAll('[class*="target"].focus-item,.focus-item[class*="correct"],.focus-item[class*="glow"]')).toHaveLength(0);
    expect(screen.queryByText(/ms|초|countdown|elapsed/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '정확하게 찾아주세요' })).not.toBeInTheDocument();
    expect(container.querySelector('.focus-running-status')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.focus-running-decoration')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.focus-result-item,.is-selected,.is-target,.focus-result-legend')).toHaveLength(0);
  });

  it('correct RESULT는 842ms와 동일 좌표의 selected/target 의미를 실제 config 순서로 표시한다', () => {
    let now = 100; const scheduler = new ImmediateScheduler();
    const { container } = render(<FocusAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} frameScheduler={scheduler} createTrialId={() => 'correct-result'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); act(() => scheduler.activate()); now = 942;
    fireEvent.click(screen.getByRole('button', { name: '선택지 2' }));
    expect(screen.getByRole('heading', { name: '정답' })).toBeInTheDocument(); expect(screen.getAllByText('0.842초')).toHaveLength(2);
    const resultItems = [...container.querySelectorAll('.focus-result-item')];
    expect(resultItems).toHaveLength(12); expect(resultItems[1]).toHaveClass('is-selected', 'is-target');
    expect(container.querySelectorAll('.focus-result-item.is-selected')).toHaveLength(1); expect(container.querySelectorAll('.focus-result-item.is-target')).toHaveLength(1);
    expect(container.querySelectorAll('.focus-result-item button,[tabindex]')).toHaveLength(0);
    expect(screen.getByLabelText('결과 표시 범례')).toHaveTextContent('선택한 항목정답 항목다른 항목');
    expect(screen.getByRole('button', { name: '다음 측정' })).toBeInTheDocument();
  });

  it('incorrect RESULT는 1004ms와 실제 selected/target을 서로 다른 항목에 표시한다', () => {
    let now = 500; const scheduler = new ImmediateScheduler();
    const { container } = render(<FocusAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} frameScheduler={scheduler} createTrialId={() => 'incorrect-result'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); act(() => scheduler.activate()); now = 1504;
    fireEvent.click(screen.getByRole('button', { name: '선택지 1' }));
    expect(screen.getByRole('heading', { name: '다른 항목 선택' })).toBeInTheDocument(); expect(screen.getAllByText('1.004초')).toHaveLength(2);
    const resultItems = [...container.querySelectorAll('.focus-result-item')];
    expect(resultItems[0]).toHaveClass('is-selected'); expect(resultItems[0]).not.toHaveClass('is-target');
    expect(resultItems[1]).toHaveClass('is-target'); expect(resultItems[1]).not.toHaveClass('is-selected');
    const shapeTag = (item: Element) => item.querySelector('.focus-shape')?.firstElementChild?.tagName.toLowerCase();
    expect(resultItems.map(shapeTag)).toEqual(FOCUS_BASELINE_CONFIGS[0].items.map((item) => ({ circle: 'circle', square: 'rect', triangle: 'path', diamond: 'path' } as const)[item.shape]));
  });

  it('correct-only 평균과 valid 정답 수를 표시하고 raw Focus result를 전달한다', () => {
    let now = 100;
    const scheduler = new ImmediateScheduler(); const onNext = vi.fn();
    render(<FocusAssessmentScreen onComplete={onNext} clock={{ now: () => now }} frameScheduler={scheduler} createTrialId={() => String(now)} />);
    const selections = [2, 1, 11];
    selections.forEach((selection, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' })); act(() => scheduler.activate()); now += (index + 1) * 1000;
      fireEvent.click(screen.getByRole('button', { name: `선택지 ${selection}` }));
    });
    expect(screen.getByRole('heading', { name: '시각 집중 측정 완료' })).toBeInTheDocument();
    expect(screen.getByText('유효 측정 3회 중 2회')).toBeInTheDocument();
    expect(screen.getByText('2.00초')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '기본 분석 보기' }));
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ assessmentType: 'day1_focus_search', trials: expect.any(Array) }));
  });

  it('정답이 없으면 0초 대신 정답 기록 없음을 표시한다', () => {
    let now = 0; const scheduler = new ImmediateScheduler();
    render(<FocusAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} frameScheduler={scheduler} createTrialId={() => String(now)} />);
    for (let index = 0; index < 3; index += 1) { fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' })); act(() => scheduler.activate()); now += 500; fireEvent.click(screen.getByRole('button', { name: '선택지 1' })); }
    expect(screen.getByText('정답 기록 없음')).toBeInTheDocument();
  });
});
