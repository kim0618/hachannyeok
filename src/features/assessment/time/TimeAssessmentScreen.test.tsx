import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimeAssessmentScreen } from './TimeAssessmentScreen';
import { describeTimeError } from './formatTimeResult';

describe('TimeAssessmentScreen', () => {
  it('3180ms는 3.18초와 0.18초 늦음으로 표시한다', () => {
    let now = 0;
    render(<TimeAssessmentScreen onNext={() => undefined} clock={{ now: () => now }} createTrialId={() => 'one'} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    now = 3180;
    fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.getByRole('heading', { name: '3.18초' })).toBeInTheDocument();
    expect(screen.getByText('목표보다 0.18초 늦었습니다.')).toBeInTheDocument();
  });

  it('2840ms는 2.84초와 0.16초 빠름으로 표시한다', () => {
    expect(describeTimeError(2840)).toBe('목표보다 0.16초 빨랐습니다.');
  });

  it('완료 summary는 retry 횟수에 종속되지 않는 closest 문구를 사용한다', () => {
    let now = 0;
    render(<TimeAssessmentScreen onNext={() => undefined} clock={{ now: () => now }} createTrialId={() => String(now)} />);
    for (const completedAt of [3000, 6000, 9000]) {
      fireEvent.click(screen.getByRole('button', { name: completedAt === 3000 ? '시작하기' : '다음 측정' }));
      now = completedAt;
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    expect(screen.getByText('가장 가까운 기록')).toBeInTheDocument();
    expect(screen.queryByText('세 번 중 가장 가까운 기록')).not.toBeInTheDocument();
  });

  it('trial 사이 날짜가 바뀌면 전체 재시작 안내와 CTA를 보여준다', () => {
    let now = 0;
    let date = new Date('2026-08-10T12:00:00');
    render(<TimeAssessmentScreen onNext={() => undefined} clock={{ now: () => now }} dateNow={() => date} createTrialId={() => String(now)} />);
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    now = 3000;
    fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    date = new Date('2026-08-11T12:00:00');
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('heading', { name: '날짜가 바뀌어서 측정을 다시 시작해야 합니다.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();
  });
});
