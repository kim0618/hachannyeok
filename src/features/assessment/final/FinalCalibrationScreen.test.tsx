import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FinalCalibrationScreen, type FinalFrameScheduler, type FinalTimerScheduler } from './FinalCalibrationScreen';

class Frames implements FinalFrameScheduler {
  callbacks: FrameRequestCallback[]=[];
  request=(callback:FrameRequestCallback)=>{this.callbacks.push(callback);return this.callbacks.length-1};
  cancel=()=>{};
  run(index:number){this.callbacks[index]?.(0)}
}
class Timers implements FinalTimerScheduler {
  callbacks:(()=>void)[]=[];
  set=(callback:()=>void)=>{this.callbacks.push(callback);return this.callbacks.length-1};
  clear=()=>{};
  run(index:number){this.callbacks[index]?.()}
}
const setVisibility=(value:'visible'|'hidden')=>Object.defineProperty(document,'visibilityState',{configurable:true,value});

describe('FinalCalibrationScreen',()=>{
  it.each([
    ['time','시간 감각'],['center','중심 인지'],['balance','균형 분배'],['control','손가락 통제'],['focus','시각 집중'],
  ] as const)('%s selector output을 READY와 RUNNING의 공통 DAY7 frame에 표시한다',(ability,label)=>{
    const frames=new Frames();
    const view=render(<FinalCalibrationScreen ability={ability} sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} frameScheduler={frames} onComplete={()=>{}} onRestart={()=>{}}/>);
    expect(screen.getByText('최종 보정 대상')).toBeInTheDocument();
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    expect(view.container.querySelector('.final-calibration-seal')).toHaveAttribute('aria-hidden','true');
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));
    expect(view.container.firstElementChild).toHaveClass('final-calibration-running');
    expect(screen.getByText(`최종 보정 · ${label}`)).toBeInTheDocument();
    expect(view.container).not.toHaveTextContent('현재 점수');
    expect(view.container).not.toHaveTextContent('최종 점수');
    view.unmount();
  });
  it('completion 마지막 attempt도 RESULT와 실제값을 거친 뒤 COMPLETE한다',()=>{
    let now=0;
    const complete=vi.fn();
    const view=render(<FinalCalibrationScreen ability="time" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} clock={{now:()=>now}} onComplete={complete} onRestart={()=>{}}/>);
    expect(view.container.firstElementChild).toHaveClass('final-calibration-screen');
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));
    for(let index=0;index<3;index++){
      now+=3000;
      fireEvent.click(screen.getByRole('button',{name:'지금!'}));
      expect(screen.getByText('FINAL TRIAL RESULT')).toBeInTheDocument();
      expect(document.querySelector('.final-input-stamp')).toHaveAttribute('aria-hidden','true');
      expect(screen.getByText(/목표 3,000ms · 실제 3000ms · 오차 0ms/)).toBeInTheDocument();
      expect(view.container).not.toHaveTextContent('최종 점수');
      const last=index===2;
      expect(screen.getByRole('button',{name:last?'결과 보기':'다음 측정'})).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button',{name:last?'결과 보기':'다음 측정'}));
    }
    expect(screen.getByRole('heading',{name:'최종 보정 측정을 마쳤습니다.'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'최종 결과 확인'}));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete.mock.calls[0]?.[0].trials).toHaveLength(3);
  });
  it('날짜 변경 시 DAY7 draft만 폐기하는 재시작 화면으로 이동한다',()=>{
    let date='2026-08-18T12:00:00Z';
    const restart=vi.fn();
    render(<FinalCalibrationScreen ability="time" sessionDateKey="2026-08-18" dateNow={()=>new Date(date)} onComplete={()=>{}} onRestart={restart}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));
    date='2026-08-19T00:00:01Z';
    fireEvent.click(screen.getByRole('button',{name:'지금!'}));
    expect(screen.getByText('DAY 1~6 기록은 그대로 유지됩니다.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'최종 보정 다시 시작'}));
    expect(restart).toHaveBeenCalledOnce();
  });
  it('시각 탐색은 double RAF 뒤에만 활성화되고 그 시점부터 반응 시간을 잰다',()=>{
    const frames=new Frames();let now=100;
    render(<FinalCalibrationScreen ability="focus" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} clock={{now:()=>now}} frameScheduler={frames} onComplete={()=>{}} onRestart={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));
    const target=screen.getByRole('button',{name:'focus-baseline-2-item-08'});
    expect(target).toBeDisabled();act(()=>frames.run(0));expect(target).toBeDisabled();act(()=>frames.run(1));expect(target).toBeEnabled();
    now=351;fireEvent.click(target);
    expect(screen.getByText(/반응 251ms/)).toBeInTheDocument();
  });
  it('memory exposure에서 backgrounded 된 뒤 stale timer가 recall을 열지 않는다',()=>{
    setVisibility('visible');const frames=new Frames();const timers=new Timers();
    render(<FinalCalibrationScreen ability="focus" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} frameScheduler={frames} timerScheduler={timers} onComplete={()=>{}} onRestart={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));act(()=>frames.run(0));act(()=>frames.run(1));fireEvent.click(screen.getByRole('button',{name:'focus-baseline-2-item-08'}));fireEvent.click(screen.getByRole('button',{name:'다음 측정'}));
    expect(screen.getByText('세 위치를 기억해 주세요.')).toBeInTheDocument();setVisibility('hidden');act(()=>document.dispatchEvent(new window.Event('visibilitychange')));
    expect(screen.getByText('이번 측정은 제외됩니다.')).toBeInTheDocument();act(()=>timers.run(0));
    expect(screen.queryByLabelText('기억 위치 선택')).not.toBeInTheDocument();setVisibility('visible');
  });
  it('control은 exact end에서 invalid이고 end 직전 stop은 valid다',()=>{
    const frames=new Frames();let now=0;
    const first=render(<FinalCalibrationScreen ability="control" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} clock={{now:()=>now}} frameScheduler={frames} onComplete={()=>{}} onRestart={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));now=2624.999;fireEvent.click(screen.getByRole('button',{name:'멈춰!'}));expect(screen.getByText('이번 측정이 기록됐습니다.')).toBeInTheDocument();first.unmount();
    const exactFrames=new Frames();now=0;render(<FinalCalibrationScreen ability="control" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} clock={{now:()=>now}} frameScheduler={exactFrames} onComplete={()=>{}} onRestart={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));now=2625;fireEvent.click(screen.getByRole('button',{name:'멈춰!'}));expect(screen.getByText('이번 측정은 제외됩니다.')).toBeInTheDocument();
  });
  it('control RAF가 먼저 exact end를 관찰해도 한 번만 invalid 처리한다',()=>{
    const frames=new Frames();let now=0;
    render(<FinalCalibrationScreen ability="control" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} clock={{now:()=>now}} frameScheduler={frames} onComplete={()=>{}} onRestart={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));now=2625;act(()=>frames.run(0));
    expect(screen.getAllByText('이번 측정은 제외됩니다.')).toHaveLength(1);
  });
  it('3등분 divider crossing 입력을 거부하고 valid raw 결과를 만든다',()=>{
    render(<FinalCalibrationScreen ability="balance" sessionDateKey="2026-08-18" dateNow={()=>new Date('2026-08-18T12:00:00Z')} onComplete={()=>{}} onRestart={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:'측정 시작'}));fireEvent.click(screen.getByRole('button',{name:'확정'}));fireEvent.click(screen.getByRole('button',{name:'다음 측정'}));
    const first=screen.getByRole('slider',{name:'첫 구분선'});const second=screen.getByRole('slider',{name:'두 번째 구분선'});
    fireEvent.change(first,{target:{value:'90'}});fireEvent.change(second,{target:{value:'10'}});fireEvent.click(screen.getByRole('button',{name:'확정'}));
    expect(screen.getByText('실제 분배 28.0% / 44.0% / 28.0%')).toBeInTheDocument();
  });
});
