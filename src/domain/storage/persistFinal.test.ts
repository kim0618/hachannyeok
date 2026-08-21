import { describe, expect, it } from 'vitest';
import { FINAL_BALANCE_KINDS, FINAL_CENTER_STIMULI, FINAL_CONTROL_CONFIGS, FINAL_FOCUS_KINDS, FINAL_FOCUS_MEMORY_POSITIONS, FINAL_FOCUS_VISUAL_CONFIG, FINAL_TIME_CONDITIONS } from '../assessment/finalCalibrationConfig';
import type { FinalRawResult } from '../assessment/results';
import type { AnyTrial } from '../assessment/trials';
import type { FinalRecord } from './types';
import { throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { prepareFinalSave } from './persistFinal';
import { deriveAnalysis } from '../scoring/deriveAnalysis';

const record=(id='final'):FinalRecord=>({recordId:id,sessionId:'final-session',selectedAbility:'time',assessmentType:'finalTime',startedAt:'2026-08-18T01:00:00Z',completedAt:'2026-08-18T01:01:00Z',localDateKey:'2026-08-18',rawResult:{assessmentType:'finalTime',selectedAbility:'time',trials:FINAL_TIME_CONDITIONS.map((condition,index)=>({trialId:`f-${index}`,startedAtMs:index,completedAtMs:index+1,valid:true,invalidReason:null,kind:'timeCondition',condition,targetDurationMs:3000,observedDurationMs:3000}))}});
const valid=(index:number)=>({trialId:`arm-${index}`,startedAtMs:index,completedAtMs:index+1,valid:true as const,invalidReason:null});
const armTrial=(ability:FinalRawResult['selectedAbility'],index:number):AnyTrial=>{
  if(ability==='time')return{...valid(index),kind:'timeCondition',condition:FINAL_TIME_CONDITIONS[index%3]!,targetDurationMs:3000,observedDurationMs:3000};
  if(ability==='center'){const config=FINAL_CENTER_STIMULI[index%3]!;return{...valid(index),kind:'centerCondition',condition:config.condition,decorationSide:config.decorationSide,stimulusId:config.stimulusId,target:{x:.5,y:.5},observed:{x:.5,y:.5}};}
  if(ability==='balance')return FINAL_BALANCE_KINDS[index%2]==='balanceTwoWay'?{...valid(index),kind:'balanceTwoWay',orientation:'vertical',targetRatio:.5,observedRatio:.5}:{...valid(index),kind:'balanceThreeWay',cutPositions:[1/3,2/3]};
  if(ability==='control'){const config=FINAL_CONTROL_CONFIGS[index%3]!;return{...valid(index),...config,kind:'controlCondition',observedPosition:config.targetPosition};}
  return FINAL_FOCUS_KINDS[index%2]==='focus'?{...valid(index),kind:'focus',condition:'visualSearch',stimulusId:FINAL_FOCUS_VISUAL_CONFIG.stimulusId,correctTargetId:FINAL_FOCUS_VISUAL_CONFIG.correctTargetId,selectedTargetId:FINAL_FOCUS_VISUAL_CONFIG.correctTargetId,reactionTimeMs:500,correct:true}:{...valid(index),kind:'spatialMemory',shownPositions:FINAL_FOCUS_MEMORY_POSITIONS.map(point=>({...point})),selectedPositions:FINAL_FOCUS_MEMORY_POSITIONS.map(point=>({...point})),exposureDurationMs:1200,responseTimeMs:500};
};
const finalRaw=(ability:FinalRawResult['selectedAbility']):FinalRawResult=>{
  const count=ability==='balance'||ability==='focus'?2:3;
  return {assessmentType:`final${ability[0]!.toUpperCase()}${ability.slice(1)}` as FinalRawResult['assessmentType'],selectedAbility:ability,trials:Array.from({length:count},(_,index)=>armTrial(ability,index))} as FinalRawResult;
};

describe('prepareFinalSave',()=>{
  it('FinalRecord를 저장하고 같은 payload retry는 idempotent success다',()=>{const first=prepareFinalSave(throughDay6Fixture,record(),'2026-08-18T01:01:00Z');expect(first.ok).toBe(true);if(!first.ok)return;expect(first.data.dailyRecords).toEqual(throughDay6Fixture.dailyRecords);const retry=prepareFinalSave(first.data,record(),'2026-08-18T01:02:00Z');expect(retry).toEqual({ok:true,data:first.data,idempotent:true})});
  it('다른 final은 기존 final을 보존하며 충돌한다',()=>{const first=prepareFinalSave(throughDay6Fixture,record(),'2026-08-18T01:01:00Z');expect(first.ok).toBe(true);if(!first.ok)return;const conflict=prepareFinalSave(first.data,record('other'),'2026-08-18T01:02:00Z');expect(conflict).toEqual({ok:false,error:'finalAlreadyCompleted'});expect(first.data.finalRecord?.recordId).toBe('final')});
  it('DAY6와 같은 날짜에는 final을 저장하지 않는다',()=>expect(prepareFinalSave(throughDay6Fixture,{...record(),localDateKey:'2026-08-17'},'2026-08-17T02:00:00Z')).toEqual({ok:false,error:'finalDateInvalid'}));
  it('DAY7 선택 능력 외 네 능력 점수는 그대로 유지한다',()=>{const before=deriveAnalysis(throughDay6Fixture);const saved=prepareFinalSave(throughDay6Fixture,record(),'2026-08-18T01:01:00Z');expect(before.ok&&saved.ok).toBe(true);if(!before.ok||!saved.ok)return;const after=deriveAnalysis(saved.data);expect(after.ok).toBe(true);if(!after.ok)return;for(const ability of ['center','balance','control','focus'] as const)expect(after.value.scores[ability]).toBe(before.value.scores[ability])});
  it.each(['time','center','balance','control','focus'] as const)('%s selected final은 선택된 능력 하나에만 DAY7 점수를 적용한다',(selected)=>{
    const before=deriveAnalysis(throughDay6Fixture);
    const rawResult=finalRaw(selected);
    const after=deriveAnalysis({...throughDay6Fixture,finalRecord:{recordId:`${selected}-final`,sessionId:`${selected}-session`,selectedAbility:selected,assessmentType:rawResult.assessmentType,startedAt:'2026-08-18T01:00:00Z',completedAt:'2026-08-18T01:01:00Z',localDateKey:'2026-08-18',rawResult}});
    expect(before.ok&&after.ok).toBe(true);if(!before.ok||!after.ok)return;
    expect(after.value.preFinalScores).toEqual(before.value.scores);
    for(const ability of ['time','center','balance','control','focus'] as const){
      if(ability!==selected)expect(after.value.scores[ability]).toBe(before.value.scores[ability]);
      expect(Math.abs(after.value.scores[ability]-before.value.scores[ability])).toBeLessThanOrEqual(6);
    }
  });
});
