import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeAssessmentScreen } from './TimeAssessmentScreen';
import { describeTimeError } from './formatTimeResult';

describe('TimeAssessmentScreen', () => {
  it('3180ms는 3자리 기록과 signed delta, late 방향으로 표시한다', () => {
    let now = 0;
    render(<TimeAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} createTrialId={() => 'one'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    now = 3180;
    fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.getByRole('heading', { name: '3.180초' })).toBeInTheDocument();
    expect(screen.getByText('+0.180초')).toBeInTheDocument();
    expect(screen.getAllByText('조금 길었어요')).toHaveLength(2);
    expect(screen.getByText('목표보다 0.18초 늦었습니다.')).toBeInTheDocument();
  });

  it.each([
    { duration: 3041, value: '3.041초', delta: '+0.041초', direction: '조금 길었어요', markerSide: '51.025%' },
    { duration: 2959, value: '2.959초', delta: '-0.041초', direction: '조금 빨랐어요', markerSide: '48.975%' },
    { duration: 3000, value: '3.000초', delta: '0.000초', direction: '정확했어요', markerSide: '50%' },
  ])('$duration ms RESULT는 precise data와 marker 방향을 일치시킨다', ({ duration, value, delta, direction, markerSide }) => {
    let now = 0;
    const { container } = render(<TimeAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} createTrialId={() => String(duration)} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    now = duration;
    fireEvent.click(screen.getByRole('button', { name: '지금!' }));

    expect(screen.getByRole('heading', { name: value })).toBeInTheDocument();
    expect(screen.getByText(delta)).toBeInTheDocument();
    expect(screen.getAllByText(direction)).toHaveLength(2);
    expect(screen.getByText(`목표 (3.000초)`)).toBeInTheDocument();
    expect(screen.getByText(`실제 (${value})`)).toBeInTheDocument();
    expect(container.querySelector('.time-result-instrument')).toHaveStyle(`--actual-marker-position: ${markerSide}`);
    expect(screen.getByRole('button', { name: '다음 측정' })).toBeInTheDocument();
  });

  it('다음 측정 CTA를 연속 클릭해도 active trial은 하나만 시작한다', () => {
    let now = 0;
    const createTrialId = vi.fn(() => `trial-${createTrialId.mock.calls.length}`);
    render(<TimeAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} createTrialId={createTrialId} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    now = 3041;
    fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    const next = screen.getByRole('button', { name: '다음 측정' });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(createTrialId).toHaveBeenCalledTimes(2);
  });

  it('2840ms는 2.84초와 0.16초 빠름으로 표시한다', () => {
    expect(describeTimeError(2840)).toBe('목표보다 0.16초 빨랐습니다.');
  });

  it('완료 summary는 retry 횟수에 종속되지 않는 closest 문구를 사용한다', () => {
    let now = 0;
    const onComplete = vi.fn();
    render(<TimeAssessmentScreen onComplete={onComplete} clock={{ now: () => now }} createTrialId={() => String(now)} />);
    for (const completedAt of [3000, 6000, 9000]) {
      fireEvent.click(screen.getByRole('button', { name: completedAt === 3000 ? '측정 시작' : '다음 측정' }));
      now = completedAt;
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    expect(screen.getByText('가장 가까운 기록')).toBeInTheDocument();
    expect(screen.queryByText('세 번 중 가장 가까운 기록')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ assessmentType: 'day1_time', trials: expect.any(Array) }));
  });

  it('trial 사이 날짜가 바뀌면 전체 재시작 안내와 CTA를 보여준다', () => {
    let now = 0;
    let date = new Date('2026-08-10T12:00:00');
    render(<TimeAssessmentScreen onComplete={() => undefined} clock={{ now: () => now }} dateNow={() => date} createTrialId={() => String(now)} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    now = 3000;
    fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    date = new Date('2026-08-11T12:00:00');
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('heading', { name: '날짜가 바뀌어서 측정을 다시 시작해야 합니다.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
  });

  it('READY reference poster를 표시하고 RUNNING 진입 시 완전히 제거한다', () => {
    const { container } = render(<TimeAssessmentScreen onComplete={() => undefined} createTrialId={() => 'ready'} />);
    const poster = container.querySelector<HTMLImageElement>('.time-ready-reference-poster > img');
    expect(poster).toHaveAttribute('src', '/assets/day1-time-ready-reference.png');
    expect(poster).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.time-ready-accessible-summary')).toHaveTextContent('검사 1 / 5');
    expect(container.querySelector('.time-ready-accessible-summary')).toHaveTextContent('연습 아님');
    expect(container.querySelector('.time-ready-accessible-summary')).toHaveTextContent('총 3회 측정 후 평균값을 분석합니다.');

    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(container.querySelector('.time-ready-reference-poster')).not.toBeInTheDocument();
    expect(container.querySelector('.time-ready-accessible-summary')).not.toBeInTheDocument();
    expect(screen.queryByText('3.000')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '지금!' })).toBeInTheDocument();
  });

  it('RUNNING 화면은 정답 힌트 없이 확정 시안 문구와 정적 계측기를 표시한다', () => {
    const { container } = render(<TimeAssessmentScreen onComplete={() => undefined} createTrialId={() => 'running'} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));

    expect(container.querySelector('.time-running-instrument')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('3초라고 느껴질 때')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '지금!' })).toBeInTheDocument();
    expect(screen.getByText(/정확히 3초가 지났다고 느껴지는 순간/)).toBeInTheDocument();
    expect(screen.queryByText(/3\.000|남음|지남/)).not.toBeInTheDocument();
  });
});
