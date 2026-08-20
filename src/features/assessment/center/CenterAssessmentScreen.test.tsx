import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CenterAssessmentScreen } from './CenterAssessmentScreen';

const rect = { left: 100, top: 200, width: 200, height: 100, right: 300, bottom: 300, x: 100, y: 200, toJSON: () => ({}) };

function select(clientX: number, clientY: number) {
  const target = screen.getByRole('application');
  vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect);
  fireEvent.pointerDown(target, { clientX, clientY });
}

describe('CenterAssessmentScreen', () => {
  it('Ready 안내와 시작 CTA를 렌더한다', () => {
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} />);
    expect(screen.getByRole('heading', { name: '중심 감각' })).toBeInTheDocument();
    expect(container.querySelector('.center-ready-heading p')).toHaveTextContent('도형의 정확한 가운데라고 느껴지는 곳을 눌러주세요');
    expect(screen.getByText('중심을 찾는 감각을 측정합니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
    expect(container.querySelectorAll('.center-ready-content')).toHaveLength(1);
    expect(container.querySelector('.identity-ready-content')).not.toBeInTheDocument();
  });

  it('READY optical preview는 장식이며 클릭해도 trial을 만들지 않는다', () => {
    const createTrialId = vi.fn(() => 'center-ready');
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} createTrialId={createTrialId} />);
    const preview = container.querySelector('.center-ready-optical');
    expect(preview).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(preview!);
    expect(createTrialId).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
  });

  it('측정 시작 1회로 READY를 제거하고 center guide 없는 RUNNING으로 진입한다', () => {
    const createTrialId = vi.fn(() => 'center-running');
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} createTrialId={createTrialId} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(createTrialId).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.center-ready-content')).not.toBeInTheDocument();
    expect(container.querySelector('.center-ready-optical')).not.toBeInTheDocument();
    expect(container.querySelector('.center-marker')).not.toBeInTheDocument();
    expect(container.querySelector('.center-crosshair')).not.toBeInTheDocument();
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  it('시작 후 접근 가능한 rectangle 입력 영역과 결과 marker/텍스트를 표시한다', () => {
    render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const target = screen.getByLabelText('가운데라고 느껴지는 위치 선택');
    expect(target).toHaveClass('center-shape-rectangle');
    expect(target).toHaveAttribute('aria-describedby', 'center-running-instruction');
    expect(document.getElementById('center-running-instruction')).toHaveTextContent('화면 안의 도형을 보고 정확한 중심이라고 느껴지는 위치를 눌러주세요.');
    select(200, 250);
    expect(document.querySelector('.center-result-shape')).toHaveClass('center-shape-rectangle');
    expect(screen.getByRole('heading', { name: '약 0.0%' })).toBeInTheDocument();
    expect(screen.getByText('선택한 점')).toBeInTheDocument();
    expect(screen.getByText('실제 중심')).toBeInTheDocument();
  });

  it('RUNNING과 RESULT에서 trial별 shape class를 동일하게 사용한다', () => {
    render(<CenterAssessmentScreen variationSessionId="center-skin-fixture" onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const firstSkin = [...screen.getByRole('application').classList].find(name => name.startsWith('visual-skin-'));
    expect(firstSkin).toBeDefined();
    expect(screen.getByRole('application')).toHaveClass('center-shape-rectangle');
    select(99, 250);
    fireEvent.click(screen.getByRole('button', { name: '다시 측정' }));
    const secondSkin = [...screen.getByRole('application').classList].find(name => name.startsWith('visual-skin-'));
    expect(secondSkin).not.toBe(firstSkin);
    expect(screen.getByRole('application')).toHaveClass('center-shape-wideRectangle');
    select(99, 250);
    fireEvent.click(screen.getByRole('button', { name: '다시 측정' }));
    const thirdSkin = [...screen.getByRole('application').classList].find(name => name.startsWith('visual-skin-'));
    expect(thirdSkin).not.toBe(secondSkin);
    expect(screen.getByRole('application')).toHaveClass('center-shape-square');
    select(200, 250);
    expect(document.querySelector('.center-result-shape')).toHaveClass('center-shape-square');
    expect(document.querySelector('.center-result-shape')).toHaveClass(thirdSkin!);
  });

  it('RUNNING 장식은 입력면과 분리되고 pointer event를 받지 않는다', () => {
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    const decoration = container.querySelector('.center-running-decoration');
    expect(decoration).toHaveAttribute('aria-hidden', 'true');
    expect(decoration).toHaveStyle({ pointerEvents: 'none' });
    expect(decoration?.querySelector('.center-marker')).not.toBeInTheDocument();
    expect(decoration?.querySelector('.center-crosshair')).not.toBeInTheDocument();
    expect(screen.getByRole('application')).toHaveClass('center-shape-rectangle');
  });

  it('RESULT는 raw 좌표에서 오차, marker, connection line을 파생한다', () => {
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    select(150, 225);
    expect(screen.getByRole('heading', { name: '약 35.4%' })).toBeInTheDocument();
    expect(screen.getAllByText('약 35.4%')).toHaveLength(2);
    expect(screen.getByText('조금 벗어났어요')).toBeInTheDocument();
    expect(container.querySelector('.center-selected-marker')).toHaveStyle({ left: '25%', top: '25%' });
    expect(container.querySelector('.center-true-marker')).toHaveStyle({ left: '50%', top: '50%' });
    const line = container.querySelector('.center-result-connection line');
    expect(line).toHaveAttribute('x1', '25');
    expect(line).toHaveAttribute('y1', '25');
    expect(line).toHaveAttribute('x2', '50');
    expect(line).toHaveAttribute('y2', '50');
    expect(screen.getByRole('button', { name: '다음 도형' })).toBeInTheDocument();
  });

  it('exact center는 0.0%이며 두 marker와 line 끝점이 겹친다', () => {
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    select(200, 250);
    expect(screen.getByRole('heading', { name: '약 0.0%' })).toBeInTheDocument();
    expect(screen.getByText('정확한 중심이에요')).toBeInTheDocument();
    expect(container.querySelector('.center-selected-marker')).toHaveStyle({ left: '50%', top: '50%' });
    expect(container.querySelector('.center-true-marker')).toHaveStyle({ left: '50%', top: '50%' });
    const line = container.querySelector('.center-result-connection line');
    expect(line).toHaveAttribute('x1', '50');
    expect(line).toHaveAttribute('y1', '50');
    expect(line).toHaveAttribute('x2', '50');
    expect(line).toHaveAttribute('y2', '50');
  });

  it.each([
    { name: 'left', clientX: 120, clientY: 250, left: '10%', top: '50%' },
    { name: 'right', clientX: 280, clientY: 250, left: '90%', top: '50%' },
    { name: 'up', clientX: 200, clientY: 210, left: '50%', top: '10%' },
    { name: 'down', clientX: 200, clientY: 290, left: '50%', top: '90%' },
  ])('$name 선택은 raw normalized 좌표 그대로 marker에 반영한다', ({ clientX, clientY, left, top }) => {
    const { container } = render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    select(clientX, clientY);
    expect(container.querySelector('.center-selected-marker')).toHaveStyle({ left, top });
    expect(container.querySelector('.center-true-marker')).toHaveStyle({ left: '50%', top: '50%' });
  });

  it('완료 요약은 valid trial만 사용하고 raw Center result를 전달한다', () => {
    const onNext = vi.fn();
    render(<CenterAssessmentScreen onComplete={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    select(200, 250);
    fireEvent.click(screen.getByRole('button', { name: '다음 도형' }));
    select(150, 225);
    fireEvent.click(screen.getByRole('button', { name: '다음 도형' }));
    select(99, 250);
    expect(screen.getByRole('heading', { name: '중심 감각 측정 완료' })).toBeInTheDocument();
    expect(screen.getByText('17.7%')).toBeInTheDocument();
    expect(screen.getByText('기본 사각형')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ assessmentType: 'day1_center', trials: expect.any(Array) }));
  });
});
