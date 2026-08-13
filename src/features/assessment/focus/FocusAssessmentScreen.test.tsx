import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FocusAssessmentScreen } from './FocusAssessmentScreen';
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
    fireEvent.click(screen.getByRole('button', { name: '시작하기' })); act(() => scheduler.activate());
    expect(screen.getAllByRole('button')).toHaveLength(12);
    expect(screen.queryByRole('button', { name: /정답|타겟|도형/ })).not.toBeInTheDocument();
  });

  it('correct-only 평균과 valid 정답 수를 표시하고 raw Focus result를 전달한다', () => {
    let now = 100;
    const scheduler = new ImmediateScheduler(); const onNext = vi.fn();
    render(<FocusAssessmentScreen onComplete={onNext} clock={{ now: () => now }} frameScheduler={scheduler} createTrialId={() => String(now)} />);
    const selections = [2, 1, 11];
    selections.forEach((selection, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '시작하기' : '다음 측정' })); act(() => scheduler.activate()); now += (index + 1) * 1000;
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
    for (let index = 0; index < 3; index += 1) { fireEvent.click(screen.getByRole('button', { name: index === 0 ? '시작하기' : '다음 측정' })); act(() => scheduler.activate()); now += 500; fireEvent.click(screen.getByRole('button', { name: '선택지 1' })); }
    expect(screen.getByText('정답 기록 없음')).toBeInTheDocument();
  });
});
