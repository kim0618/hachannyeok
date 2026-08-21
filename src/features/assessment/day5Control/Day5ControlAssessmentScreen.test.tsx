import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AnimationScheduler } from '../control/useControlAssessment';
import { Day5ControlAssessmentScreen } from './Day5ControlAssessmentScreen';

const scheduler: AnimationScheduler = { request: () => 1, cancel: () => undefined };

describe('Day5ControlAssessmentScreen signature', () => {
  it('RUNNING은 condition identity 없이 cue 없는 중립 frame을 표시한다', () => {
    const view=render(<Day5ControlAssessmentScreen sessionDateKey="2026-08-16" dateNow={()=>new Date('2026-08-16T12:00:00Z')} clock={{now:()=>0}} animationScheduler={scheduler} createTrialId={()=> 'signature-day5'} onDateInvalidated={vi.fn()} onComplete={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));
    expect(screen.getByText('움직임 통제 측정')).toBeInTheDocument();
    expect(screen.getByText('MOTION CONTROL')).toBeInTheDocument();
    expect(screen.getByText('MEASUREMENT IN PROGRESS')).toBeInTheDocument();
    expect(view.container).not.toHaveTextContent(/SURPRISE|PREDICTABLE|STEADY MOTION|VARIABLE MOTION|변속 조건|예측 조건/);
    expect(screen.getByRole('button',{name:'멈춰!'})).toBeEnabled();
    expect(view.container.querySelector('.day5-control-running .control-target')).toBeInTheDocument();
    expect(view.container.querySelector('.day5-control-running .control-marker')).toBeInTheDocument();
    expect(view.container.querySelector('.speed-cue,.proximity-cue,.transition-warning,.flash,.glow')).not.toBeInTheDocument();
  });
  it('READY는 변화 가능성을 안내하고 RESULT는 실제 condition을 공개하지만 다음 RUNNING은 중립이다',()=>{let now=0;const view=render(<Day5ControlAssessmentScreen sessionDateKey="2026-08-16" dateNow={()=>new Date('2026-08-16T12:00:00Z')} clock={{now:()=>now}} animationScheduler={scheduler} createTrialId={()=> 'signature-day5-surprise'} onDateInvalidated={vi.fn()} onComplete={vi.fn()}/>);expect(screen.getByText('움직임이 중간에 달라질 수 있어요.')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));now=500;fireEvent.click(screen.getByRole('button',{name:'멈춰!'}));expect(screen.getByText('예측 가능한 움직임 기록입니다.')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'다음 측정'}));expect(screen.getByText('움직임 통제 측정')).toBeVisible();expect(view.container).not.toHaveTextContent(/SURPRISE|PREDICTABLE|STEADY MOTION|VARIABLE MOTION|변속 조건|예측 조건/);expect(document.querySelector('.speed-cue,.transition-warning,.proximity-cue')).not.toBeInTheDocument();});
});
