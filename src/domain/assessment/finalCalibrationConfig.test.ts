import { describe, expect, it } from 'vitest';
import { validateCompletion } from './completion';
import {
  FINAL_BALANCE_KINDS, FINAL_CENTER_STIMULI, FINAL_CONTROL_CONFIGS,
  FINAL_FOCUS_KINDS, FINAL_FOCUS_MEMORY_POSITIONS, FINAL_FOCUS_VISUAL_CONFIG,
  FINAL_TIME_CONDITIONS, finalAssessmentTypeForAbility, isFinalTrialForAttempt,
} from './finalCalibrationConfig';
import type { FinalRawResult } from './results';
import type { AnyTrial } from './trials';

const valid = (index:number)=>({trialId:`f-${index}`,startedAtMs:index,completedAtMs:index+1,valid:true as const,invalidReason:null});
const time=(index:number,ok=true):AnyTrial=>ok?{...valid(index),kind:'timeCondition',condition:FINAL_TIME_CONDITIONS[index%3]!,targetDurationMs:3000,observedDurationMs:3000}:{...valid(index),kind:'timeCondition',condition:'plain',targetDurationMs:3000,observedDurationMs:3000};
const center=(index:number):AnyTrial=>{const c=FINAL_CENTER_STIMULI[index%3]!;return{...valid(index),kind:'centerCondition',condition:c.condition,decorationSide:c.decorationSide,stimulusId:c.stimulusId,target:{x:.5,y:.5},observed:{x:.5,y:.5}}};
const balance=(index:number):AnyTrial=>FINAL_BALANCE_KINDS[index%2]==='balanceTwoWay'?{...valid(index),kind:'balanceTwoWay',orientation:'vertical',targetRatio:.5,observedRatio:.5}:{...valid(index),kind:'balanceThreeWay',cutPositions:[1/3,2/3]};
const control=(index:number):AnyTrial=>{const c=FINAL_CONTROL_CONFIGS[index%3]!;return{...valid(index),...c,kind:'controlCondition',observedPosition:c.targetPosition}};
const focus=(index:number):AnyTrial=>FINAL_FOCUS_KINDS[index%2]==='focus'?{...valid(index),kind:'focus',condition:'visualSearch',stimulusId:FINAL_FOCUS_VISUAL_CONFIG.stimulusId,correctTargetId:FINAL_FOCUS_VISUAL_CONFIG.correctTargetId,selectedTargetId:FINAL_FOCUS_VISUAL_CONFIG.correctTargetId,reactionTimeMs:500,correct:true}:{...valid(index),kind:'spatialMemory',shownPositions:FINAL_FOCUS_MEMORY_POSITIONS.map(p=>({...p})),selectedPositions:FINAL_FOCUS_MEMORY_POSITIONS.map(p=>({...p})),exposureDurationMs:1200,responseTimeMs:500};

describe('DAY7 exact final config',()=>{
  it('selected Ability를 final arm에 1:1 매핑한다',()=>expect((['time','center','balance','control','focus'] as const).map(finalAssessmentTypeForAbility)).toEqual(['finalTime','finalCenter','finalBalance','finalControl','finalFocus']));
  it('전체 attempt index 기준 sequence와 retry identity를 반복한다',()=>{
    expect(Array.from({length:6},(_,i)=>FINAL_TIME_CONDITIONS[i%3])).toEqual(['plain','distracted','plain','plain','distracted','plain']);
    expect(Array.from({length:6},(_,i)=>FINAL_CENTER_STIMULI[i%3]!.stimulusId)).toEqual(['day3-plain-01','day3-left-01','day3-right-01','day3-plain-01','day3-left-01','day3-right-01']);
    expect(Array.from({length:5},(_,i)=>FINAL_BALANCE_KINDS[i%2])).toEqual(['balanceTwoWay','balanceThreeWay','balanceTwoWay','balanceThreeWay','balanceTwoWay']);
    expect(Array.from({length:6},(_,i)=>FINAL_CONTROL_CONFIGS[i%3]!.condition)).toEqual(['predictable','surprise','surprise','predictable','surprise','surprise']);
    expect(Array.from({length:5},(_,i)=>FINAL_FOCUS_KINDS[i%2])).toEqual(['focus','spatialMemory','focus','spatialMemory','focus']);
  });
  it.each([
    ['time',{assessmentType:'finalTime',selectedAbility:'time',trials:Array.from({length:6},(_,i)=>time(i))}],
    ['center',{assessmentType:'finalCenter',selectedAbility:'center',trials:Array.from({length:6},(_,i)=>center(i))}],
    ['balance',{assessmentType:'finalBalance',selectedAbility:'balance',trials:Array.from({length:5},(_,i)=>balance(i))}],
    ['control',{assessmentType:'finalControl',selectedAbility:'control',trials:Array.from({length:6},(_,i)=>control(i))}],
    ['focus',{assessmentType:'finalFocus',selectedAbility:'focus',trials:Array.from({length:5},(_,i)=>focus(i))}],
  ] as const)('%s arm은 target+3 retry에서도 attempt config를 유지한다',(_name,result)=>{
    const typed=result as FinalRawResult;
    expect(typed.trials.every((trial,index)=>isFinalTrialForAttempt(typed,trial,index))).toBe(true);
    expect(validateCompletion(typed).status).toBe('completed');
  });
  it('잘못된 final tuple을 completion boundary에서 거부한다',()=>{
    const result={assessmentType:'finalTime',selectedAbility:'time',trials:[time(0),time(1),time(2)]} as FinalRawResult;
    expect(validateCompletion({...result,trials:[time(0),time(0),time(2)]})).toEqual({status:'invalidAssessment'});
    const altered=[center(0),{...center(1),stimulusId:'day3-right-01' as const},center(2)];
    expect(validateCompletion({assessmentType:'finalCenter',selectedAbility:'center',trials:altered})).toEqual({status:'invalidAssessment'});
  });
});
