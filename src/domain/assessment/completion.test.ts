import { describe, expect, it } from 'vitest';
import type { TimeConditionTrial } from './trials';
import { validateCompletion } from './completion';

const timeTrial = (id: string, condition: 'plain' | 'distracted', valid = true): TimeConditionTrial => valid
  ? { trialId: id, startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null, kind: 'timeCondition', condition, targetDurationMs: 3000, observedDurationMs: 3000 }
  : { trialId: id, startedAtMs: 0, completedAtMs: null, valid: false, invalidReason: 'interrupted', kind: 'timeCondition', condition, targetDurationMs: 3000 };

describe('assessment completion rules', () => {
  it('minimum valid를 충족해도 target attempt 전에는 완료하지 않는다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'distracted'), timeTrial('3', 'plain')] }).status).toBe('notEnoughAttempts'));
  it('DAY 2 target과 condition minimum을 충족하면 완료한다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'distracted'), timeTrial('3', 'plain'), timeTrial('4', 'distracted', false)] }).status).toBe('completed'));
  it('target 뒤 minimum이 부족하면 한 번씩 retry를 허용한다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'plain'), timeTrial('3', 'distracted', false), timeTrial('4', 'distracted', false)] }).status).toBe('retryAllowed'));
  it('target + 3에서도 조건이 부족하면 assessmentIncomplete다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'plain'), ...Array.from({ length: 5 }, (_, index) => timeTrial(String(index), 'distracted', false))] }).status).toBe('assessmentIncomplete'));
  it('고정 target condition 구성을 다른 retry 조합으로 대체하지 않는다', () => expect(validateCompletion({ assessmentType: 'day2_time_distraction', trials: [timeTrial('1', 'plain'), timeTrial('2', 'plain'), timeTrial('3', 'plain'), timeTrial('4', 'distracted'), timeTrial('5', 'distracted')] }).status).toBe('retryAllowed'));
  it('unknown assessmentType을 throw 없이 명시적으로 거부한다', () => {
    expect(validateCompletion({ assessmentType: 'day1_unknown', trials: [] })).toEqual({ status: 'invalidAssessment' });
    expect(validateCompletion({ assessmentType: 'finalUnknown', trials: [] })).toEqual({ status: 'invalidAssessment' });
  });
  it('final assessment의 ability literal을 강제한다', () => {
    const trials = [timeTrial('1', 'plain'), timeTrial('2', 'plain'), timeTrial('3', 'distracted')];
    expect(validateCompletion({ assessmentType: 'finalTime', selectedAbility: 'time', trials }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalTime', selectedAbility: 'focus', trials })).toEqual({ status: 'invalidAssessment' });
  });
  it('각 final arm의 올바른 ability와 고정 구성을 완료한다', () => {
    const validBase = { startedAtMs: 0, completedAtMs: 1, valid: true as const, invalidReason: null };
    const point = { x: 0.5, y: 0.5 };
    expect(validateCompletion({ assessmentType: 'finalCenter', selectedAbility: 'center', trials: [
      { ...validBase, trialId: 'c1', kind: 'centerCondition', condition: 'plain', decorationSide: 'none', target: point, observed: point },
      { ...validBase, trialId: 'c2', kind: 'centerCondition', condition: 'decoratedLeft', decorationSide: 'left', target: point, observed: point },
      { ...validBase, trialId: 'c3', kind: 'centerCondition', condition: 'decoratedRight', decorationSide: 'right', target: point, observed: point },
    ] }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalBalance', selectedAbility: 'balance', trials: [
      { ...validBase, trialId: 'b1', kind: 'balanceTwoWay', orientation: 'vertical', targetRatio: 0.5, observedRatio: 0.5 },
      { ...validBase, trialId: 'b2', kind: 'balanceThreeWay', cutPositions: [0.33, 0.66] },
    ] }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalControl', selectedAbility: 'control', trials: [
      { ...validBase, trialId: 'k1', kind: 'controlCondition', condition: 'predictable', targetPosition: 0.5, observedPosition: 0.5, initialSpeedNormalized: 0.5, finalSpeedNormalized: 0.5, speedChangeAtNormalizedTime: null },
      { ...validBase, trialId: 'k2', kind: 'controlCondition', condition: 'surprise', targetPosition: 0.5, observedPosition: 0.5, initialSpeedNormalized: 0.5, finalSpeedNormalized: 0.8, speedChangeAtNormalizedTime: 0.5 },
      { ...validBase, trialId: 'k3', kind: 'controlCondition', condition: 'surprise', targetPosition: 0.5, observedPosition: 0.5, initialSpeedNormalized: 0.5, finalSpeedNormalized: 0.8, speedChangeAtNormalizedTime: 0.5 },
    ] }).status).toBe('completed');
    expect(validateCompletion({ assessmentType: 'finalFocus', selectedAbility: 'focus', trials: [
      { ...validBase, trialId: 'f1', kind: 'focus', condition: 'visualSearch', stimulusId: 's', correctTargetId: 't', selectedTargetId: 't', reactionTimeMs: 1, correct: true },
      { ...validBase, trialId: 'f2', kind: 'spatialMemory', shownPositions: [point, point, point], selectedPositions: [point, point, point], exposureDurationMs: 1, responseTimeMs: 1 },
    ] }).status).toBe('completed');
  });
});
