import { describe, expect, it } from 'vitest';
import { DAY5_CONTROL_TRIAL_CONFIGS } from './day5ControlConfig';
import { DAY6_EXPOSURE_DURATION_MS,day6ConfigForAttempt } from './day6SpatialMemoryConfig';
import type { ControlConditionTrial, TimeConditionTrial } from './trials';
import { validateCompletion } from './completion';
import { FINAL_CONTROL_CONFIGS, FINAL_FOCUS_MEMORY_POSITIONS, FINAL_FOCUS_VISUAL_CONFIG } from './finalCalibrationConfig';
const day6Base={startedAtMs:0,completedAtMs:1,valid:true as const,invalidReason:null};

const timeTrial = (id: string, condition: 'plain' | 'distracted', valid = true): TimeConditionTrial => valid
  ? { trialId: id, startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null, kind: 'timeCondition', condition, targetDurationMs: 3000, observedDurationMs: 3000 }
  : { trialId: id, startedAtMs: 0, completedAtMs: null, valid: false, invalidReason: 'interrupted', kind: 'timeCondition', condition, targetDurationMs: 3000 };
const day5Trial = (index: number, valid = true): ControlConditionTrial => {
  const config = DAY5_CONTROL_TRIAL_CONFIGS[index % DAY5_CONTROL_TRIAL_CONFIGS.length]!;
  const base = { ...config, trialId: `d5-${index}`, startedAtMs: index, kind: 'controlCondition' as const };
  return valid
    ? { ...base, completedAtMs: index + 1, observedPosition: config.targetPosition, valid: true, invalidReason: null }
    : { ...base, completedAtMs: null, valid: false, invalidReason: 'interrupted' };
};

describe('assessment completion rules', () => {
  it('DAY6 exact A/B와 retry sequence만 완료한다',()=>{const make=(index:number)=>({...day6Base,trialId:`m${index}`,kind:'spatialMemory' as const,shownPositions:day6ConfigForAttempt(index).map(point=>({...point})),selectedPositions:day6ConfigForAttempt(index).map(point=>({...point})),exposureDurationMs:DAY6_EXPOSURE_DURATION_MS,responseTimeMs:1});const trials=[make(0),make(1)];expect(validateCompletion({assessmentType:'day6_spatial_memory',trials}).status).toBe('completed');expect(validateCompletion({assessmentType:'day6_spatial_memory',trials:[{...trials[0],shownPositions:trials[1]!.shownPositions},trials[1]]}).status).toBe('invalidAssessment');});
  it('minimum valid를 충족해도 target attempt 전에는 완료하지 않는다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'distracted'), timeTrial('3', 'plain')] }).status).toBe('notEnoughAttempts'));
  it('DAY 2 target과 condition minimum을 충족하면 완료한다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'distracted'), timeTrial('3', 'plain'), timeTrial('4', 'distracted', false)] }).status).toBe('completed'));
  it('target 뒤 minimum이 부족하면 한 번씩 retry를 허용한다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'plain'), timeTrial('3', 'distracted', false), timeTrial('4', 'distracted', false)] }).status).toBe('retryAllowed'));
  it('target + 3에서도 조건이 부족하면 assessmentIncomplete다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'plain'), ...Array.from({ length: 5 }, (_, index) => timeTrial(String(index), 'distracted', false))] }).status).toBe('assessmentIncomplete'));
  it('고정 target condition 구성을 다른 retry 조합으로 대체하지 않는다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'plain'), timeTrial('3', 'plain'), timeTrial('4', 'distracted'), timeTrial('5', 'distracted')] }).status).toBe('retryAllowed'));
  it('unknown assessmentType을 throw 없이 명시적으로 거부한다', () => {
    expect(validateCompletion({ assessmentType: 'day1_unknown', trials: [] })).toEqual({ status: 'invalidAssessment' });
    expect(validateCompletion({ assessmentType: 'finalUnknown', trials: [] })).toEqual({ status: 'invalidAssessment' });
  });
  it('DAY 5 exact config 1~4와 retry 5~7을 허용한다', () => {
    expect(validateCompletion({ assessmentType: 'day5_control_surprise', trials: Array.from({ length: 4 }, (_, index) => day5Trial(index)) }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'day5_control_surprise', trials: Array.from({ length: 7 }, (_, index) => day5Trial(index)) }).status).toBe('completed');
  });
  it('DAY 5의 target, speed, change, attempt order와 retry config 불일치를 거부한다', () => {
    const exact = Array.from({ length: 4 }, (_, index) => day5Trial(index));
    const rejects = [
      exact.map((trial, index) => index === 1 ? { ...trial, finalSpeedNormalized: 0.70 } : trial),
      exact.map((trial, index) => index === 1 ? { ...trial, speedChangeAtNormalizedTime: 0.40 } : trial),
      exact.map((trial, index) => index === 2 ? { ...trial, targetPosition: 0.58 } : trial),
      exact.map((trial, index) => index === 0 ? { ...trial, initialSpeedNormalized: 0.40, finalSpeedNormalized: 0.40 } : trial),
      [day5Trial(1), day5Trial(0), day5Trial(2), day5Trial(3)],
      [...exact, day5Trial(1)],
    ];
    rejects.forEach((trials) => expect(validateCompletion({ assessmentType: 'day5_control_surprise', trials })).toEqual({ status: 'invalidAssessment' }));
  });
  it('DAY 5 invalid trial도 attempt exact config를 강제한다', () => {
    const trials = [day5Trial(0, false), day5Trial(1), day5Trial(2), day5Trial(3)];
    expect(validateCompletion({ assessmentType: 'day5_control_surprise', trials }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'day5_control_surprise', trials: [{ ...trials[0]!, targetPosition: 0.68 }, ...trials.slice(1)] })).toEqual({ status: 'invalidAssessment' });
  });
  it('final assessment의 ability literal을 강제한다', () => {
    const trials = [timeTrial('1', 'plain'), timeTrial('2', 'distracted'), timeTrial('3', 'plain')];
    expect(validateCompletion({ assessmentType: 'finalTime', selectedAbility: 'time', trials }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalTime', selectedAbility: 'focus', trials })).toEqual({ status: 'invalidAssessment' });
  });
  it('각 final arm의 올바른 ability와 고정 구성을 완료한다', () => {
    const validBase = { startedAtMs: 0, completedAtMs: 1, valid: true as const, invalidReason: null };
    const point = { x: 0.5, y: 0.5 };
    expect(validateCompletion({ assessmentType: 'finalCenter', selectedAbility: 'center', trials: [
      { ...validBase, trialId: 'c1', kind: 'centerCondition', condition: 'plain', stimulusId: 'day3-plain-01', decorationSide: 'none', target: point, observed: point },
      { ...validBase, trialId: 'c2', kind: 'centerCondition', condition: 'decoratedLeft', stimulusId: 'day3-left-01', decorationSide: 'left', target: point, observed: point },
      { ...validBase, trialId: 'c3', kind: 'centerCondition', condition: 'decoratedRight', stimulusId: 'day3-right-01', decorationSide: 'right', target: point, observed: point },
    ] }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalBalance', selectedAbility: 'balance', trials: [
      { ...validBase, trialId: 'b1', kind: 'balanceTwoWay', orientation: 'vertical', targetRatio: 0.5, observedRatio: 0.5 },
      { ...validBase, trialId: 'b2', kind: 'balanceThreeWay', cutPositions: [0.33, 0.66] },
    ] }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalControl', selectedAbility: 'control', trials: FINAL_CONTROL_CONFIGS.map((config,index)=>({ ...validBase, ...config, trialId:`k${index}`,kind:'controlCondition' as const,observedPosition:config.targetPosition })) }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalFocus', selectedAbility: 'focus', trials: [
      { ...validBase, trialId: 'f1', kind: 'focus', condition: 'visualSearch', stimulusId: FINAL_FOCUS_VISUAL_CONFIG.stimulusId, correctTargetId: FINAL_FOCUS_VISUAL_CONFIG.correctTargetId, selectedTargetId: FINAL_FOCUS_VISUAL_CONFIG.correctTargetId, reactionTimeMs: 1, correct: true },
      { ...validBase, trialId: 'f2', kind: 'spatialMemory', shownPositions: FINAL_FOCUS_MEMORY_POSITIONS.map(p=>({...p})), selectedPositions: FINAL_FOCUS_MEMORY_POSITIONS.map(p=>({...p})), exposureDurationMs: 1200, responseTimeMs: 1 },
    ] }).status).toBe('completed');
  });
});
