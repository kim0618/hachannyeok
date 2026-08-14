import { isDay6SpreadAttempt } from '../../domain/assessment/day6SpatialMemoryConfig';
import type { CrossInsight, CrossInsightKey } from '../../domain/scoring/types';
import { deriveCenterShiftDirection } from '../../domain/scoring/centerShiftDirection';
import { matchingMeanDistance, threeWayError, twoWayError } from '../../domain/scoring/normalizers';
import type { BaselineRecord, DailyRecord, FinalRecord } from '../../domain/storage/types';
import { deriveTerminalDirection } from './day4Presentation';
import { ABILITY_LABELS } from './basicAnalysisContent';

export interface EvidenceRow { key:string;title:string;value:string }
const mean=(values:readonly number[])=>values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;
const ms=(value:number)=>`${Math.round(value)}ms`;
const pct=(value:number)=>`${(value*100).toFixed(1)}%`;
const deltaMs=(value:number)=>`${value>=0?'+':''}${Math.round(value)}ms`;
const deltaPct=(value:number)=>`${value>=0?'+':''}${(value*100).toFixed(1)}%p`;
const directionLabel={left:'왼쪽',right:'오른쪽',up:'위',down:'아래',neutral:'뚜렷한 방향 없음'} as const;
type CrossInsightSemanticFamily='stability'|'sensitivity'|'weakness'|'update';
const crossInsightFamily:Record<CrossInsightKey,CrossInsightSemanticFamily>={
  stableStrength:'stability',
  crossContextResilience:'stability',
  conditionSensitiveStrength:'sensitivity',
  consistentWeakness:'weakness',
  positiveUpdate:'update',
};

export function selectPresentedCrossInsights(insights:readonly CrossInsight[]):CrossInsight[]{
  const seen=new Set<string>();const selected:CrossInsight[]=[];
  for(const insight of insights){const identity=`${insight.ability}:${crossInsightFamily[insight.key]}`;if(seen.has(identity))continue;seen.add(identity);selected.push(insight);if(selected.length===2)break}
  return selected;
}

export function crossInsightCopy(insight:CrossInsight):string{
  const ability=ABILITY_LABELS[insight.ability];
  const copy:Record<CrossInsightKey,string>={
    stableStrength:`${ability}은 여러 조건에서도 비교적 안정적으로 유지됐어요.`,
    conditionSensitiveStrength:`평소 강점인 ${ability}이 조건 변화에는 더 민감한 편이에요.`,
    consistentWeakness:`${ability}은 여러 측정에서 한 번 더 확인할 영역으로 나타났어요.`,
    positiveUpdate:`${ability}은 추가 분석에서 가장 긍정적으로 보정됐어요.`,
    crossContextResilience:`${ability}은 조건이 달라져도 비교적 잘 유지됐어요.`,
  };
  return copy[insight.key];
}

export function cumulativeEvidenceRows(baseline:BaselineRecord,dailyRecords:readonly DailyRecord[],finalRecord?:FinalRecord):EvidenceRow[]{
  const rows:EvidenceRow[]=[];
  const day2=dailyRecords.find(record=>record.rawResult.assessmentType==='day2_time_distraction');
  if(day2?.rawResult.assessmentType==='day2_time_distraction'){
    const errors=(condition:'plain'|'distracted')=>day2.rawResult.trials.flatMap(trial=>trial.kind==='timeCondition'&&trial.valid&&trial.condition===condition?[Math.abs(trial.observedDurationMs-trial.targetDurationMs)]:[]);
    const plain=mean(errors('plain')),distracted=mean(errors('distracted'));if(plain!==null&&distracted!==null)rows.push({key:'day2',title:'DAY 2 · 시간 조건 비교',value:`평소 ${ms(plain)} · 방해 ${ms(distracted)} · 차이 ${deltaMs(distracted-plain)}`});
  }
  const day3=dailyRecords.find(record=>record.rawResult.assessmentType==='day3_decorated_center');
  if(day3?.rawResult.assessmentType==='day3_decorated_center'){
    const valid=day3.rawResult.trials.filter(trial=>trial.valid);const plain=valid.filter(trial=>trial.condition==='plain'),decorated=valid.filter(trial=>trial.condition!=='plain');const error=(trials:typeof valid)=>mean(trials.map(trial=>Math.hypot(trial.observed.x-.5,trial.observed.y-.5)));const pe=error(plain),de=error(decorated);if(pe!==null&&de!==null&&plain.length&&decorated.length){const px=mean(plain.map(trial=>trial.observed.x))!,py=mean(plain.map(trial=>trial.observed.y))!,dx=mean(decorated.map(trial=>trial.observed.x))!-px,dy=mean(decorated.map(trial=>trial.observed.y))!-py,direction=deriveCenterShiftDirection(dx,dy);rows.push({key:'day3',title:'DAY 3 · 중심 조건 비교',value:`무장식 ${pct(pe)} · 장식 ${pct(de)} · 이동 ${pct(Math.hypot(dx,dy))} (${direction?directionLabel[direction]:'계산 불가'})`})}
  }
  const baseBalance=baseline.assessmentRawResults.find(result=>result.assessmentType==='day1_balance_two_way');const day4=dailyRecords.find(record=>record.rawResult.assessmentType==='day4_balance_three_way');
  if(baseBalance?.assessmentType==='day1_balance_two_way'&&day4?.rawResult.assessmentType==='day4_balance_three_way'){
    const two=mean(baseBalance.trials.map(twoWayError).filter((value):value is number=>value!==null));const valid=day4.rawResult.trials.filter(trial=>trial.valid);const three=mean(valid.map(threeWayError).filter((value):value is number=>value!==null));if(two!==null&&three!==null&&valid.length){const segments=valid.map(trial=>[trial.cutPositions[0],trial.cutPositions[1]-trial.cutPositions[0],1-trial.cutPositions[1]] as const);const avg=[0,1,2].map(index=>mean(segments.map(values=>values[index]!))!);const terminal=deriveTerminalDirection(avg[2]!-1/3);const terminalCopy=terminal==='large'?'마지막 구간 큼':terminal==='small'?'마지막 구간 작음':'뚜렷한 terminal 편향 없음';rows.push({key:'day4',title:'DAY 4 · 분배 조건 비교',value:`2등분 ${pct(two)} · 3등분 ${pct(three)} · 평균 ${avg.map(pct).join(' / ')} · ${terminalCopy}`})}
  }
  const day5=dailyRecords.find(record=>record.rawResult.assessmentType==='day5_control_surprise');
  if(day5?.rawResult.assessmentType==='day5_control_surprise'){
    const errors=(condition:'predictable'|'surprise')=>day5.rawResult.trials.flatMap(trial=>trial.kind==='controlCondition'&&trial.valid&&trial.condition===condition?[Math.abs(trial.observedPosition-trial.targetPosition)]:[]);const predictable=mean(errors('predictable')),surprise=mean(errors('surprise'));if(predictable!==null&&surprise!==null)rows.push({key:'day5',title:'DAY 5 · 정지 조건 비교',value:`예측 ${pct(predictable)} · Surprise ${pct(surprise)} · 차이 ${deltaPct(surprise-predictable)}`});
  }
  const day6=dailyRecords.find(record=>record.rawResult.assessmentType==='day6_spatial_memory');
  if(day6?.rawResult.assessmentType==='day6_spatial_memory'){
    const errors=(spread:boolean)=>day6.rawResult.trials.flatMap((trial,index)=>trial.kind==='spatialMemory'&&trial.valid&&isDay6SpreadAttempt(index)===spread?[matchingMeanDistance(trial)!]:[]);const spread=mean(errors(true)),clustered=mean(errors(false));if(spread!==null&&clustered!==null)rows.push({key:'day6',title:'DAY 6 · 위치 기억 비교',value:`Spread ${pct(spread)} · Clustered ${pct(clustered)} · 차이 ${deltaPct(clustered-spread)}`});
  }
  if(finalRecord){const valid=finalRecord.rawResult.trials.filter(trial=>trial.valid);let value='';switch(finalRecord.rawResult.assessmentType){case'finalTime':{const errors=valid.flatMap(trial=>trial.kind==='timeCondition'?[Math.abs(trial.observedDurationMs-trial.targetDurationMs)]:[]);value=`평균 시간 오차 ${ms(mean(errors)??0)}`;break}case'finalCenter':{const errors=valid.flatMap(trial=>trial.kind==='centerCondition'?[Math.hypot(trial.observed.x-.5,trial.observed.y-.5)]:[]);value=`평균 중심 오차 ${pct(mean(errors)??0)}`;break}case'finalBalance':{const errors=valid.flatMap(trial=>trial.kind==='balanceTwoWay'?[twoWayError(trial)!]:trial.kind==='balanceThreeWay'?[threeWayError(trial)!]:[]);value=`평균 분배 오차 ${pct(mean(errors)??0)}`;break}case'finalControl':{const errors=valid.flatMap(trial=>trial.kind==='controlCondition'?[Math.abs(trial.observedPosition-trial.targetPosition)]:[]);value=`평균 정지 오차 ${pct(mean(errors)??0)}`;break}case'finalFocus':{const searches=valid.filter(trial=>trial.kind==='focus'),memory=valid.flatMap(trial=>trial.kind==='spatialMemory'?[matchingMeanDistance(trial)!]:[]);value=`탐색 정답 ${searches.filter(trial=>trial.correct).length}/${searches.length} · 반응 ${ms(mean(searches.flatMap(trial=>trial.reactionTimeMs===null?[]:[trial.reactionTimeMs]))??0)} · 기억 오차 ${pct(mean(memory)??0)}`;break}}rows.push({key:'day7',title:`DAY 7 · 최종 보정 ${ABILITY_LABELS[finalRecord.selectedAbility]}`,value})}
  return rows;
}
