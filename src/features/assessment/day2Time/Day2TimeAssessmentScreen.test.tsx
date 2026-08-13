import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Day2TimeAssessmentScreen } from './Day2TimeAssessmentScreen';

describe('Day2TimeAssessmentScreen', () => {
  it('distracted trial에 접근성에서 숨긴 particle DOM을 표시한다', () => {
    let now = 0;
    render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} createTrialId={() => String(now)} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); now = 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.queryByTestId('day2-particles')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    const particles = screen.getByTestId('day2-particles');
    expect(particles).toHaveAttribute('aria-hidden', 'true'); expect(particles.children).toHaveLength(4);
  });
});
