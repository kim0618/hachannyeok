import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { deriveAnalysis } from './domain/scoring/deriveAnalysis';
import type { DailyRecord, PersistedAppData } from './domain/storage/types';
import { MemoryStorageAdapter } from './infrastructure/storage/MemoryStorageAdapter';
import { day2Fixture, throughDay6Fixture } from './test/dailyThroughDay4Fixture';

describe('App DAY7',()=>{
  it('STATE E에서 FinalRecord를 저장하고 STATE F 최종 report를 reload한다',async()=>{
    if(day2Fixture.rawResult.assessmentType!=='day2_time_distraction')throw new Error('fixture mismatch');
    const unstableDay2:DailyRecord={...day2Fixture,rawResult:{...day2Fixture.rawResult,trials:day2Fixture.rawResult.trials.map((trial,index)=>trial.valid?{...trial,observedDurationMs:index%2===0?1000:5000}:trial)}};
    const timeSelectedFixture:PersistedAppData={...throughDay6Fixture,dailyRecords:[unstableDay2,...throughDay6Fixture.dailyRecords.slice(1)]};
    const storage=new MemoryStorageAdapter(timeSelectedFixture);
    const shareOpen=vi.fn().mockResolvedValue(undefined);
    const first=render(<App storagePort={storage} sharePort={{open:shareOpen}} bypassInitialLoad={false} dateNow={()=>new Date('2026-08-18T12:00:00Z')} createSessionId={()=> 'day7-session'}/>);
    fireEvent.click(await screen.findByRole('button',{name:'최종 분석 시작'}));
    fireEvent.click(screen.getByRole('button',{name:'최종 보정 시작'}));
    fireEvent.click(screen.getByRole('button',{name:'최종 보정 시작'}));
    expect(screen.getByRole('heading',{name:'3초라고 느껴질 때 눌러주세요.'})).toBeInTheDocument();
    for(let index=0;index<3;index++){
      fireEvent.click(screen.getByRole('button',{name:'지금!'}));
      fireEvent.click(screen.getByRole('button',{name:index===2?'결과 보기':'다음 측정'}));
    }
    fireEvent.click(screen.getByRole('button',{name:'최종 결과 확인'}));
    expect(await screen.findByText('최종 분석 완료')).toBeInTheDocument();
    expect(screen.getByText('7 / 7 COMPLETE')).toBeInTheDocument();
    expect(document.querySelector('.certification-seal-copy')).toHaveTextContent('PRECISION CERTIFIED');
    expect(document.querySelector('.certification-hero .certification-seal')).toHaveAttribute('aria-hidden','true');
    const compact=screen.getByLabelText('최종 분석 5개 능력 요약');
    expect(compact.children).toHaveLength(5);
    const evidenceDetails=document.querySelectorAll('.evidence-disclosure');
    expect(evidenceDetails.length).toBeGreaterThanOrEqual(10);
    const firstSummary=evidenceDetails[0]!.querySelector('summary')!;
    expect(firstSummary.querySelector('.evidence-summary-title')).toBeInTheDocument();
    expect(firstSummary.querySelector('.evidence-summary-value')).toBeInTheDocument();
    expect(firstSummary.querySelector('.evidence-summary-title')).not.toBe(firstSummary.querySelector('.evidence-summary-value'));
    expect(evidenceDetails[0]).not.toHaveAttribute('open');
    fireEvent.click(evidenceDetails[0]!.querySelector('summary')!);
    expect(evidenceDetails[0]).toHaveAttribute('open');
    await waitFor(()=>expect(storage.peek()?.finalRecord?.selectedAbility).toBe('time'));
    const saved=storage.peek();
    expect(saved?.dailyRecords).toEqual(timeSelectedFixture.dailyRecords);
    const beforeReload=deriveAnalysis(saved!);
    if(!beforeReload.ok)throw new Error('final fixture must derive');
    Object.values(beforeReload.value.scores).forEach(score=>expect(within(compact).getByText(String(score))).toBeInTheDocument());
    expect(screen.getByRole('button',{name:'결과 공유하기'})).toBeEnabled();
    const storageBeforeShare=structuredClone(storage.peek());
    fireEvent.click(screen.getByRole('button',{name:'결과 공유하기'}));
    await waitFor(()=>expect(shareOpen).toHaveBeenCalledTimes(1));
    expect(storage.peek()).toEqual(storageBeforeShare);
    first.unmount();
    render(<App initialPersistedData={saved??undefined} dateNow={()=>new Date('2026-08-19T12:00:00Z')}/>);
    fireEvent.click(screen.getByRole('button',{name:'최종 사용설명서 보기'}));
    expect(screen.getByText('최종 분석 완료')).toBeInTheDocument();
    expect(deriveAnalysis(saved!)).toEqual(beforeReload);
  });
});
