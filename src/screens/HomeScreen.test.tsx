import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('원본 poster asset과 접근 가능한 interaction overlay를 표시한다', () => {
    const onStart = vi.fn();
    const { container } = render(<HomeScreen onStart={onStart} />);
    const poster = container.querySelector<HTMLImageElement>('.home-reference-poster > img');
    expect(poster).toHaveAttribute('src', '/assets/home-reference.png');
    expect(poster).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.home-accessible-summary')).toHaveTextContent('쓸능검');
    expect(container).not.toHaveTextContent(/\d+\s*점/);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '오늘의 추가 검사 보기' })).toBeDisabled();
    expect(container.querySelector('.home-accessible-summary')).toHaveTextContent('의학·심리 진단이 아닙니다');
  });
});
