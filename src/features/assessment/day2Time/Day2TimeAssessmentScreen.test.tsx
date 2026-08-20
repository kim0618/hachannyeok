import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Day2TimeAssessmentScreen } from './Day2TimeAssessmentScreen';

describe('Day2TimeAssessmentScreen', () => {
  it('h-18 READY에 실제 protocol 설정을 표시하고 시작 전 raw를 만들지 않는다', () => {
    const done = vi.fn();
    render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} onComplete={done} onDateInvalidated={() => undefined} />);
    expect(screen.getByRole('heading', { name: '시간 감각 · 조건 비교' })).toBeInTheDocument();
    expect(screen.getAllByText('3.000').length).toBeGreaterThan(0);
    expect(screen.getByText('4회 측정으로 조건별 평균 오차를 계산합니다.')).toBeInTheDocument();
    expect(screen.getAllByText('PLAIN')).toHaveLength(2);
    expect(done).not.toHaveBeenCalled();
  });

  it('distracted trial에 접근성에서 숨긴 particle DOM을 표시한다', () => {
    let now = 0;
    render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} createTrialId={() => String(now)} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(screen.getByRole('heading', { name: '3초라고 느껴질 때버튼을 눌러주세요' })).toBeInTheDocument();
    expect(screen.queryByText('3.000')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '측정 시작' })).not.toBeInTheDocument();
    now = 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.queryByTestId('day2-particles')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 측정으로 이동' }));
    const particles = screen.getByTestId('day2-particles');
    expect(particles).toHaveAttribute('aria-hidden', 'true'); expect(particles.children).toHaveLength(4);
    expect(Array.from(particles.children).map((item) => item.className)).toEqual(['day2-particle particle-1', 'day2-particle particle-2', 'day2-particle particle-3', 'day2-particle particle-4']);
    expect(screen.getByLabelText('현재 전체 측정 2 / 4')).toBeInTheDocument();
    expect(screen.getAllByText('방해 조건 · DISTRACTED').length).toBeGreaterThan(0);
    expect(screen.queryByText('3.000')).not.toBeInTheDocument();
  });

  it('두 번째 distracted는 4/4이며 응답 후 기존 complete flow로 이동한다', () => {
    let now = 0;
    render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      now += 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
      fireEvent.click(screen.getByRole('button', { name: '다음 측정으로 이동' }));
    }
    expect(screen.getByLabelText('현재 전체 측정 4 / 4')).toBeInTheDocument();
    expect(screen.getByTestId('day2-particles').children).toHaveLength(4);
    now += 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.getByRole('heading', { name: '방해 조건 측정을 마쳤습니다.' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 측정으로 이동' })).not.toBeInTheDocument();
  });

  it('Plain RUNNING은 전체 attempt 1/4와 3/4를 표시하고 reference 수치를 제거한다', () => {
    let now = 0;
    render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} createTrialId={() => `trial-${now}`} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(screen.getByLabelText('현재 전체 측정 1 / 4')).toBeInTheDocument();
    expect(screen.queryByText('3.000')).not.toBeInTheDocument();
    expect(screen.queryByText('SECONDS')).not.toBeInTheDocument();
    now = 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정으로 이동' }));
    now = 6000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정으로 이동' }));
    expect(screen.getByLabelText('현재 전체 측정 3 / 4')).toBeInTheDocument();
    expect(screen.queryByText('3.000')).not.toBeInTheDocument();
  });

  it('plain 3127ms RESULT를 raw/config 기반 늦음 지표로 표시한다', () => {
    let now = 0;
    const { container } = render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); now = 3127; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.getAllByText('기본 조건 · PLAIN').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3.127초')).toHaveLength(2);
    expect(screen.getAllByText('3.000초').length).toBeGreaterThan(0);
    expect(screen.getByText('+0.127초')).toBeInTheDocument();
    expect(screen.getByText('목표보다 늦었어요.')).toBeInTheDocument();
    expect(screen.getByLabelText('현재 전체 측정 1 / 4')).toBeInTheDocument();
    expect(container.querySelector('.day2-result-scale')).toHaveStyle({ '--day2-actual-position': '53.175%' });
  });

  it('distracted 2941ms와 exact 3000ms RESULT의 condition·방향을 구분한다', () => {
    let now = 0;
    const view = render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); now = 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' })); fireEvent.click(screen.getByRole('button', { name: '다음 측정으로 이동' }));
    now = 5941; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.getAllByText('방해 조건 · DISTRACTED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.941초')).toHaveLength(2);
    expect(screen.getByText('-0.059초')).toBeInTheDocument();
    expect(screen.getByText('목표보다 빨랐어요.')).toBeInTheDocument();
    expect(screen.getByLabelText('현재 전체 측정 2 / 4')).toBeInTheDocument();
    view.unmount();

    now = 0;
    render(<Day2TimeAssessmentScreen sessionDateKey="2026-08-13" dateNow={() => new Date('2026-08-13T12:00:00')} clock={{ now: () => now }} onComplete={() => undefined} onDateInvalidated={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' })); now = 3000; fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    expect(screen.getByText('0.000초')).toBeInTheDocument();
    expect(screen.getByText('목표 시간과 정확히 일치했어요.')).toBeInTheDocument();
    expect(document.querySelector('.day2-result-scale')).toHaveStyle({ '--day2-actual-position': '50%' });
  });
});
