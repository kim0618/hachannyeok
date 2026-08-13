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
    render(<CenterAssessmentScreen onComplete={() => undefined} />);
    expect(screen.getByRole('heading', { name: '중심 감각' })).toBeInTheDocument();
    expect(screen.getByText(/정확한 가운데라고 느껴지는 곳/)).toBeInTheDocument();
  });

  it('시작 후 접근 가능한 rectangle 입력 영역과 결과 marker/텍스트를 표시한다', () => {
    render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    const target = screen.getByLabelText('도형의 가운데라고 생각하는 위치를 선택');
    expect(target).toHaveClass('center-shape-rectangle');
    expect(target).toHaveAttribute('aria-describedby', 'center-running-instruction');
    expect(document.getElementById('center-running-instruction')).toHaveTextContent('가운데라고 느끼는 곳을 눌러주세요.');
    select(200, 250);
    expect(document.querySelector('.center-result-shape')).toHaveClass('center-shape-rectangle');
    expect(screen.getByRole('heading', { name: '거의 가운데입니다.' })).toBeInTheDocument();
    expect(screen.getByText('선택한 점')).toBeInTheDocument();
    expect(screen.getByText('실제 중심')).toBeInTheDocument();
  });

  it('RUNNING과 RESULT에서 trial별 shape class를 동일하게 사용한다', () => {
    render(<CenterAssessmentScreen onComplete={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    expect(screen.getByRole('application')).toHaveClass('center-shape-rectangle');
    select(99, 250);
    fireEvent.click(screen.getByRole('button', { name: '다시 측정' }));
    expect(screen.getByRole('application')).toHaveClass('center-shape-wideRectangle');
    select(99, 250);
    fireEvent.click(screen.getByRole('button', { name: '다시 측정' }));
    expect(screen.getByRole('application')).toHaveClass('center-shape-square');
    select(200, 250);
    expect(document.querySelector('.center-result-shape')).toHaveClass('center-shape-square');
  });

  it('완료 요약은 valid trial만 사용하고 raw Center result를 전달한다', () => {
    const onNext = vi.fn();
    render(<CenterAssessmentScreen onComplete={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
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
