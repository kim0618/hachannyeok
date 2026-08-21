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
    const journey = screen.getByRole('region', { name: '7일 분석 과정' });
    expect(journey).toBeVisible();
    expect(journey).toHaveTextContent('DAY 1기준 측정');
    expect(journey).toHaveTextContent('DAY 2–6조건 변화');
    expect(journey).toHaveTextContent('DAY 7최종 보정');
    expect(container).not.toHaveTextContent(/\d+\s*점/);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: '오늘의 추가 검사 보기' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(container.querySelector('.home-accessible-summary')).toHaveTextContent('의학·심리 진단이 아닙니다');
  });
});
