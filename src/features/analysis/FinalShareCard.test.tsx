import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Ability, DerivedAnalysis } from '../../domain/scoring/types';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import { throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { FinalShareCard } from './FinalShareCard';
import { finalShareCardData } from './finalShareCardModel';

const derivedResult = deriveAnalysis(throughDay6Fixture);
if (!derivedResult.ok) throw new Error('fixture analysis unavailable');
const derived: DerivedAnalysis = derivedResult.value;

function withCalibration(ability: Ability, before: number, final: number): DerivedAnalysis {
  return {
    ...derived,
    scores: { ...derived.scores, [ability]: final },
    preFinalScores: { ...derived.preFinalScores, [ability]: before },
    selectedFinalAbility: ability,
    finalMetrics: { ...derived.finalMetrics, mostPositivelyUpdated: { status: 'noClearPositiveUpdate' } },
  };
}

describe('FinalShareCard', () => {
  it('engine output에서 overall, profile, 대표 자격과 기존 positive-update metric을 표시한다', () => {
    const value: DerivedAnalysis = {
      ...derived,
      baselineScores: { ...derived.baselineScores, balance: 70 },
      scores: { ...derived.scores, balance: 74 },
      selectedFinalAbility: 'focus',
      finalMetrics: { ...derived.finalMetrics, mostPositivelyUpdated: { status: 'selected', ability: 'balance', magnitude: 4 } },
    };
    const data = finalShareCardData(value);
    expect(data).not.toBeNull();
    render(<FinalShareCard value={value}/>);
    expect(screen.getByText(String(value.overallScore))).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent(data!.profile.replace('\n',' '));
    expect(screen.getByText(data!.certification)).toBeInTheDocument();
    expect(data!.change).toMatchObject({mode:'sevenDayUpdate',ability:'balance',before:70,final:74,delta:4});
  });
  it.each([[70,74,'+4'],[74,70,'-4'],[72,72,'0']] as const)('마지막 보정의 positive/negative/zero 변화 %s→%s를 중립적으로 표시한다',(before,final,label)=>{
    const value=withCalibration('focus',before,final);
    const data=finalShareCardData(value)!;
    expect(data.change).toMatchObject({mode:'finalCalibration',ability:'focus',before,final,delta:final-before});
    render(<FinalShareCard value={value}/>);
    expect(screen.getByText(`변화 ${label}`)).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`변화 ${label.replace('+','\\+')}점`))).toBeInTheDocument();
  });
  it('동일 분석은 동일 data를 만들고 내부 식별자를 포함하지 않는다',()=>{
    const first=finalShareCardData(derived);
    expect(finalShareCardData(derived)).toEqual(first);
    const serialized=JSON.stringify(first);
    expect(serialized).not.toMatch(/sessionId|recordId|userId|storage|deploymentId|timestamp|coordinates/);
  });
});
