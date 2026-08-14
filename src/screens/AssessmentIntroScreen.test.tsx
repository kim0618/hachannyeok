import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { AssessmentIntroScreen } from './AssessmentIntroScreen';

describe('AssessmentIntroScreen', () => {
  it('원본 poster asset과 접근 가능한 interaction overlay를 표시한다', () => {
    const onStart = vi.fn();
    const onBack = vi.fn();
    const { container } = render(<AssessmentIntroScreen onStart={onStart} onBack={onBack} />);

    const poster = container.querySelector<HTMLImageElement>('.intro-reference-poster > img');
    expect(poster).toHaveAttribute('src', '/assets/intro-reference.png');
    expect(poster).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.intro-accessible-summary')).toHaveTextContent('쓸능검');
    expect(container.querySelector('.intro-accessible-summary')).toHaveTextContent('총 5개 · 약 90초');
    expect(container.querySelector('.screen-heading')).not.toBeInTheDocument();
    expect(container.querySelector('.instruction-card')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(onBack).toHaveBeenCalledOnce();
  });
});
