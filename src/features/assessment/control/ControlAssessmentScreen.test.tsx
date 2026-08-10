import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ControlAssessmentScreen } from './ControlAssessmentScreen';
import type { AnimationScheduler } from './useControlAssessment';

const scheduler: AnimationScheduler = { request: () => 1, cancel: () => undefined };

describe('ControlAssessmentScreen', () => {
  it('ready에서 숫자 측정값 없이 running으로 진입한다', () => {
    render(<ControlAssessmentScreen onNext={() => undefined} clock={{ now: () => 0 }} animationScheduler={scheduler} createTrialId={() => 'id'} />);
    expect(screen.getByRole('heading', { name: '손가락 통제' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '시작하기' }));
    expect(screen.getByRole('button', { name: '멈춰!' })).toBeInTheDocument();
    expect(screen.queryByText(/속도/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/표시가 움직이고 있습니다/)).toBeInTheDocument();
  });

  it('정확한 stop의 result와 valid-only complete summary를 표시한다', () => {
    let now = 0;
    const clock = { now: () => now };
    const createTrialId = () => `${now}`;
    render(<ControlAssessmentScreen onNext={() => undefined} clock={clock} animationScheduler={scheduler} createTrialId={createTrialId} />);
    for (const elapsed of [1000, 3000, 1250]) {
      fireEvent.click(screen.getByRole('button', { name: now === 0 ? '시작하기' : /다음 측정|다시 측정/ }));
      now += elapsed;
      fireEvent.click(screen.getByRole('button', { name: '멈춰!' }));
      if (elapsed === 1000) expect(screen.getByRole('heading', { name: '거의 정확한 위치입니다.' })).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { name: '손가락 통제 측정 완료' })).toBeInTheDocument();
    expect(screen.getByText('1번째 측정')).toBeInTheDocument();
  });
});
