import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BalanceAssessmentScreen, BalanceResultInstrument } from './BalanceAssessmentScreen';

describe('BalanceAssessmentScreen', () => {
  const showVerticalResult = (ratio: number) => {
    const rendered = render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 1000, height: 1000 }) });
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: ratio * 1000, clientY: 400 });
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    return rendered;
  };
  it('Ready 카피와 3/5를 표시한다', () => {
    const { container } = render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    expect(screen.getByRole('heading', { name: '균형 분배' })).toBeInTheDocument();
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
    expect(screen.getByText('균형을 나누는 감각을 측정합니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
    expect(container.querySelectorAll('.balance-ready-content')).toHaveLength(1);
    expect(container.querySelector('.identity-ready-content')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('50%');
  });
  it('READY preview는 비상호작용 장식이며 raw trial을 만들지 않는다', () => {
    const createTrialId = vi.fn(() => 'balance-ready');
    const { container } = render(<BalanceAssessmentScreen onComplete={() => undefined} createTrialId={createTrialId} />);
    const preview = container.querySelector('.balance-ready-preview');
    expect(preview).toHaveAttribute('aria-hidden', 'true');
    expect(preview).toHaveStyle({ pointerEvents: 'none' });
    fireEvent.pointerDown(preview!);
    fireEvent.click(preview!);
    expect(createTrialId).not.toHaveBeenCalled();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
  it('측정 시작 1회로 READY를 제거하고 기존 initial config의 RUNNING으로 진입한다', () => {
    const createTrialId = vi.fn(() => 'balance-running');
    const { container } = render(<BalanceAssessmentScreen onComplete={() => undefined} createTrialId={createTrialId} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(createTrialId).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.balance-ready-content')).not.toBeInTheDocument();
    expect(container.querySelector('.balance-ready-preview')).not.toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '32');
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal');
    expect(container.querySelector('.balance-divider')).toHaveStyle({ left: '32%' });
    expect(container.querySelector('.balance-running-decoration')).toHaveAttribute('aria-hidden', 'true');
    expect(container).not.toHaveTextContent('50%');
    expect(container.querySelector('.balance-target')).not.toBeInTheDocument();
  });
  it('두 번째 horizontal 시도도 기존 initial config와 visual 위치를 동일하게 사용한다', () => {
    const { container } = render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '68');
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
    expect(container.querySelector('.balance-divider')).toHaveStyle({ top: '68%' });
    expect(container.querySelector('.balance-instrument-frame')).toHaveClass('is-horizontal');
  });
  it('confirm 전에는 결과가 없고 한 번 confirm한 뒤 trial RESULT 하나를 표시한다', () => {
    const { container } = render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(container.querySelector('.trial-result')).not.toBeInTheDocument();
    const confirm = screen.getByRole('button', { name: '여기서 나누기' });
    fireEvent.click(confirm);
    expect(container.querySelectorAll('.trial-result')).toHaveLength(1);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
  it('drag로 divider를 변경하고 CTA로 확정한다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} createTrialId={() => 'v'} clock={{ now: () => 10 }} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'getBoundingClientRect', { value: () => ({ left: 100, top: 200, width: 200, height: 100 }) });
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 150, clientY: 225 });
    expect(slider).toHaveAttribute('aria-valuenow', '25');
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains('balance-result-note') && element.textContent === '반에서 약 25.0% 벗어났습니다.'))).toBeInTheDocument();
  });
  it('vertical 0.493 raw를 0.7%와 actual/target 좌표로 직접 표시한다', () => {
    const { container } = showVerticalResult(0.493);
    expect(screen.getByRole('heading', { name: '약 0.7%' })).toBeInTheDocument();
    expect(container.querySelector('.balance-result-actual.vertical')).toHaveStyle({ left: '49.3%' });
    expect(container.querySelector('.balance-result-target.vertical')).toHaveStyle({ left: '50%' });
    expect(container.querySelector('.balance-result-distance.vertical')).toHaveStyle({ left: '49.3%', width: '0.7000000000000028%' });
    expect(screen.getByText('내가 나눈 위치')).toBeInTheDocument();
    expect(screen.getByText('정확한 반')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 측정' })).toBeInTheDocument();
  });
  it('vertical 0.507은 같은 오차를 target 반대편 실제 좌표에 표시한다', () => {
    const { container } = showVerticalResult(0.507);
    expect(screen.getByRole('heading', { name: '약 0.7%' })).toBeInTheDocument();
    expect(container.querySelector('.balance-result-actual.vertical')).toHaveStyle({ left: '50.7%' });
    expect(container.querySelector('.balance-result-target.vertical')).toHaveStyle({ left: '50%' });
    expect(container.querySelector('.balance-result-distance.vertical')).toHaveStyle({ left: '50%' });
  });
  it('exact 0.5는 0.0%이며 actual과 target이 겹친다', () => {
    const { container } = showVerticalResult(0.5);
    expect(screen.getByRole('heading', { name: '약 0.0%' })).toBeInTheDocument();
    expect(screen.getByText('정확했어요')).toBeInTheDocument();
    expect(container.querySelector('.balance-result-actual.vertical')).toHaveStyle({ left: '50%' });
    expect(container.querySelector('.balance-result-target.vertical')).toHaveStyle({ left: '50%' });
  });
  it('horizontal raw는 actual/target/distance를 top 좌표에 매핑한다', () => {
    const { container } = render(<BalanceResultInstrument skinClass="visual-skin-0" trial={{ kind: 'balanceTwoWay', orientation: 'horizontal', targetRatio: 0.5, observedRatio: 0.493, trialId: 'horizontal-result', startedAtMs: 1, completedAtMs: 2, valid: true, invalidReason: null }} />);
    expect(container.querySelector('.balance-result-actual.horizontal')).toHaveStyle({ top: '49.3%' });
    expect(container.querySelector('.balance-result-target.horizontal')).toHaveStyle({ top: '50%' });
    expect(container.querySelector('.balance-result-distance.horizontal')).toHaveStyle({ top: '49.3%' });
  });
  it('invalid geometry에서는 divider를 이동하지 않는다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const slider = screen.getByRole('slider');
    Object.defineProperty(slider, 'getBoundingClientRect', { value: () => ({ left: 0, top: 0, width: 0, height: 100 }) });
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 50, clientY: 50 });
    expect(slider).toHaveAttribute('aria-valuenow', '32');
  });
  it('keyboard로 이동한 ratio를 confirm raw 결과에 반영한다', () => {
    render(<BalanceAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '33');
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains('balance-result-note') && element.textContent === '반에서 약 17.0% 벗어났습니다.'))).toBeInTheDocument();
  });
  it('완료 시 raw Balance result를 전달한다', () => {
    const onComplete = vi.fn();
    render(<BalanceAssessmentScreen onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ assessmentType: 'day1_balance_two_way', trials: expect.any(Array) }));
  });
});
