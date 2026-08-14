import { describe, expect, it } from 'vitest';
import { FINAL_TIME_CONDITIONS } from '../assessment/finalCalibrationConfig';
import type { FinalRecord } from './types';
import { throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { prepareFinalSave } from './persistFinal';
import { deriveAnalysis } from '../scoring/deriveAnalysis';

const record=(id='final'):FinalRecord=>({recordId:id,sessionId:'final-session',selectedAbility:'time',assessmentType:'finalTime',startedAt:'2026-08-18T01:00:00Z',completedAt:'2026-08-18T01:01:00Z',localDateKey:'2026-08-18',rawResult:{assessmentType:'finalTime',selectedAbility:'time',trials:FINAL_TIME_CONDITIONS.map((condition,index)=>({trialId:`f-${index}`,startedAtMs:index,completedAtMs:index+1,valid:true,invalidReason:null,kind:'timeCondition',condition,targetDurationMs:3000,observedDurationMs:3000}))}});

describe('prepareFinalSave',()=>{
  it('FinalRecord를 저장하고 같은 payload retry는 idempotent success다',()=>{const first=prepareFinalSave(throughDay6Fixture,record(),'2026-08-18T01:01:00Z');expect(first.ok).toBe(true);if(!first.ok)return;expect(first.data.dailyRecords).toEqual(throughDay6Fixture.dailyRecords);const retry=prepareFinalSave(first.data,record(),'2026-08-18T01:02:00Z');expect(retry).toEqual({ok:true,data:first.data,idempotent:true})});
  it('다른 final은 기존 final을 보존하며 충돌한다',()=>{const first=prepareFinalSave(throughDay6Fixture,record(),'2026-08-18T01:01:00Z');expect(first.ok).toBe(true);if(!first.ok)return;const conflict=prepareFinalSave(first.data,record('other'),'2026-08-18T01:02:00Z');expect(conflict).toEqual({ok:false,error:'finalAlreadyCompleted'});expect(first.data.finalRecord?.recordId).toBe('final')});
  it('DAY6와 같은 날짜에는 final을 저장하지 않는다',()=>expect(prepareFinalSave(throughDay6Fixture,{...record(),localDateKey:'2026-08-17'},'2026-08-17T02:00:00Z')).toEqual({ok:false,error:'finalDateInvalid'}));
  it('DAY7 선택 능력 외 네 능력 점수는 그대로 유지한다',()=>{const before=deriveAnalysis(throughDay6Fixture);const saved=prepareFinalSave(throughDay6Fixture,record(),'2026-08-18T01:01:00Z');expect(before.ok&&saved.ok).toBe(true);if(!before.ok||!saved.ok)return;const after=deriveAnalysis(saved.data);expect(after.ok).toBe(true);if(!after.ok)return;for(const ability of ['center','balance','control','focus'] as const)expect(after.value.scores[ability]).toBe(before.value.scores[ability])});
});
