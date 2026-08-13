import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BalanceAssessmentScreen } from './BalanceAssessmentScreen';

describe('BalanceAssessmentScreen', () => {
  it('Ready 카피와 3/5를 표시한다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    expect(screen.getByRole('heading', { name: '균형 분배' })).toBeInTheDocument();
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });
  it('drag로 divider를 변경하고 CTA로 확정한다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} createTrialId={() => 'v'} clock={{ now: () => 10 }} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'getBoundingClientRect', { value: () => ({ left: 100, top: 200, width: 200, height: 100 }) });
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 150, clientY: 225 });
    expect(slider).toHaveAttribute('aria-valuenow', '25');
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    expect(screen.getByText('반에서 약 25.0% 벗어났습니다.')).toBeInTheDocument();
  });
  it('invalid geometry에서는 divider를 이동하지 않는다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'getBoundingClientRect', { value: () => ({ left: 0, top: 0, width: 0, height: 100 }) });
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 50, clientY: 50 });
    expect(slider).toHaveAttribute('aria-valuenow', '32');
  });
  it('keyboard로 이동한 ratio를 confirm raw 결과에 반영한다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '33');
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    expect(screen.getByText('반에서 약 17.0% 벗어났습니다.')).toBeInTheDocument();
  });
  it('완료 시 raw Balance result를 전달한다', () => {
    const onComplete = vi.fn();
    render(<BalanceAssessmentScreen onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ assessmentType: 'day1_balance_two_way', trials: expect.any(Array) }));
  });
});
