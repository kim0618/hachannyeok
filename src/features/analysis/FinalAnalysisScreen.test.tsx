import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import { throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { FinalAnalysisScreen } from './FinalAnalysisScreen';
import { FINAL_TIME_CONDITIONS } from '../../domain/assessment/finalCalibrationConfig';
import type { FinalRecord } from '../../domain/storage/types';

const follows=(first:Element,second:Element)=>Boolean(first.compareDocumentPosition(second)&Node.DOCUMENT_POSITION_FOLLOWING);

describe('FinalAnalysisScreen brand', () => {
  it('최종 분석서와 seal에 쓸능검 브랜드를 표시한다', () => {
    const analysis = deriveAnalysis(throughDay6Fixture);
    const view=render(<FinalAnalysisScreen baseline={throughDay6Fixture.baseline} dailyRecords={throughDay6Fixture.dailyRecords} analysis={analysis} saveStatus="saved" />);
    expect(view.container.firstElementChild).toHaveClass('final-completion-motion');
    expect(screen.getByText('쓸능검 · 최종 분석서')).toBeInTheDocument();
    expect(screen.getByText('최종 종합 쓸능검')).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'7일 변화 지도'})).toBeInTheDocument();
    expect(screen.getByRole('figure',{name:/쓸능검 최종 결과\. 7일 완료/})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'결과 공유하기'})).toBeEnabled();
    expect(view.container.querySelector('[class*=overlay]')).not.toBeInTheDocument();
    expect(document.querySelector('.certification-seal-brand')).toHaveTextContent('쓸능검');
  });
  it('hero에 실제 selected Ability의 preFinal, final, change를 표시한다',()=>{
    const rawResult={assessmentType:'finalTime' as const,selectedAbility:'time' as const,trials:FINAL_TIME_CONDITIONS.map((condition,index)=>({trialId:`hero-${index}`,startedAtMs:index,completedAtMs:index+1,valid:true as const,invalidReason:null,kind:'timeCondition' as const,condition,targetDurationMs:3000 as const,observedDurationMs:3000}))};
    const finalRecord:FinalRecord={recordId:'hero-final',sessionId:'hero',selectedAbility:'time',assessmentType:'finalTime',startedAt:'2026-08-18T01:00:00Z',completedAt:'2026-08-18T01:01:00Z',localDateKey:'2026-08-18',rawResult};
    const analysis=deriveAnalysis({...throughDay6Fixture,finalRecord});
    expect(analysis.ok).toBe(true);if(!analysis.ok)return;
    render(<FinalAnalysisScreen baseline={throughDay6Fixture.baseline} dailyRecords={throughDay6Fixture.dailyRecords} finalRecord={finalRecord} analysis={analysis} saveStatus="saved"/>);
    const summary=screen.getByLabelText('DAY 7 마지막 보정 · 시간');
    expect(summary).toHaveTextContent(`DAY 6까지${analysis.value.preFinalScores.time}`);
    expect(summary).toHaveTextContent(`최종${analysis.value.scores.time}`);
    expect(summary).toHaveTextContent(`최종 보정+${analysis.value.scores.time-analysis.value.preFinalScores.time}`);
    expect(summary).not.toHaveTextContent('시각 집중');
    const changeMap=screen.getByRole('heading',{name:'7일 변화 지도'}).closest('section');
    expect(changeMap).toBeInTheDocument();
    for(const ability of ['time','center','balance','control','focus'] as const){
      const labels={time:'시간',center:'중심',balance:'균형',control:'통제',focus:'집중'} as const;
      const delta=analysis.value.scores[ability]-analysis.value.baselineScores[ability];
      expect(screen.getByRole('img',{name:`${labels[ability]} DAY 1 ${analysis.value.baselineScores[ability]}점에서 FINAL ${analysis.value.scores[ability]}점, 변화 ${delta>0?'+':''}${delta}점`})).toBeInTheDocument();
    }
    expect(changeMap).toHaveTextContent('DAY 7 보정');
  });
  it('reduced-motion 선호에서도 Final 핵심 정보가 첫 render DOM에 모두 존재한다',()=>{
    const original=window.matchMedia;
    window.matchMedia=()=>({matches:true,media:'(prefers-reduced-motion: reduce)',onchange:null,addListener:()=>undefined,removeListener:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,dispatchEvent:()=>true});
    const analysis=deriveAnalysis(throughDay6Fixture);
    render(<FinalAnalysisScreen baseline={throughDay6Fixture.baseline} dailyRecords={throughDay6Fixture.dailyRecords} analysis={analysis} saveStatus="saved"/>);
    expect(screen.getByText('최종 종합 쓸능검')).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'7일 변화 지도'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'결과 공유하기'})).toBeEnabled();
    window.matchMedia=original;
  });
  it('Final dossier 순서와 필수 report content, semantic heading, action을 유지한다',()=>{
    const analysis=deriveAnalysis(throughDay6Fixture);expect(analysis.ok).toBe(true);if(!analysis.ok)return;
    const view=render(<FinalAnalysisScreen baseline={throughDay6Fixture.baseline} dailyRecords={throughDay6Fixture.dailyRecords} analysis={analysis} saveStatus="saved" onHome={()=>undefined}/>);
    const hero=view.container.querySelector('.final-report-hero')!;
    const change=screen.getByRole('heading',{name:'7일 변화 지도'}).closest('section')!;
    const abilities=screen.getByRole('heading',{name:'최종 5개 능력치'}).closest('section')!;
    const pattern=screen.getByLabelText('최종 분석 대표 지표');
    const cross=screen.getByRole('heading',{name:'누적 조건 해석'}).closest('section')!;
    const evidence=screen.getByRole('heading',{name:'누적 실제 측정 근거'}).closest('section')!;
    const manual=screen.getByLabelText('최종 사용자 설명서');
    const share=view.container.querySelector('.final-share-block')!;
    expect(follows(hero,change)&&follows(change,abilities)&&follows(abilities,pattern)&&follows(pattern,cross)&&follows(cross,evidence)&&follows(evidence,manual)&&follows(manual,share)).toBe(true);
    expect(screen.getByText('가장 안정적으로 유지된 능력')).toBeInTheDocument();
    expect(screen.getByText('조건 변화에 가장 민감했던 능력')).toBeInTheDocument();
    expect(screen.getByText('추가 분석에서 가장 긍정적으로 보정된 능력')).toBeInTheDocument();
    expect(manual).toHaveTextContent('STRENGTH');expect(manual).toHaveTextContent('WATCH');expect(manual).toHaveTextContent('HANDLING NOTE');
    expect(evidence.querySelectorAll('.evidence-disclosure').length).toBeGreaterThanOrEqual(10);
    expect(screen.getByRole('button',{name:'결과 공유하기'})).toBeEnabled();expect(screen.getByRole('button',{name:'홈으로'})).toBeEnabled();
    expect(share.querySelector('.final-share-card')).toBeInTheDocument();
    expect(view.container.querySelectorAll('h1')).toHaveLength(1);
    expect(view.container.firstElementChild).toHaveClass('final-completion-motion');
  });
});
