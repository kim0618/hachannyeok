import { describe, expect, it } from 'vitest';
import { isAnyTrial, isNormalized } from './validation';

const base = { trialId: 't1', startedAtMs: 10, completedAtMs: 20 };
describe('raw trial runtime validation', () => {
  it('NaN, Infinity와 normalized 범위 밖을 clamp하지 않고 거부한다', () => { expect(isNormalized(Number.NaN)).toBe(false); expect(isNormalized(Infinity)).toBe(false); expect(isNormalized(1.01)).toBe(false); });
  it('DAY 1 time targetDuration 3000 literal을 강제한다', () => expect(isAnyTrial({ ...base, valid: true, invalidReason: null, kind: 'time', condition: 'baseline', targetDurationMs: 2999, observedDurationMs: 3000 })).toBe(false));
  it('DAY 1 center target 0.5, 0.5 literal을 valid와 invalid arm 모두에서 강제한다', () => {
    const center = { ...base, kind: 'center', condition: 'plain', shapeId: 'rectangle', observed: { x: 0.25, y: 0.75 }, valid: true, invalidReason: null };
    expect(isAnyTrial({ ...center, target: { x: 0.5, y: 0.5 } })).toBe(true);
    expect(isAnyTrial({ ...center, target: { x: 0, y: 0 } })).toBe(false);
    expect(isAnyTrial({ ...center, target: { x: 0.5, y: 0 } })).toBe(false);
    expect(isAnyTrial({ ...center, target: { x: 0.50001, y: 0.5 } })).toBe(false);
    expect(isAnyTrial({ ...center, target: { x: 0.5, y: 0.499 } })).toBe(false);
    expect(isAnyTrial({ ...base, kind: 'center', condition: 'plain', shapeId: 'square', target: { x: 0.5, y: 0.5 }, valid: false, invalidReason: 'backgrounded' })).toBe(true);
    expect(isAnyTrial({ ...base, kind: 'center', condition: 'plain', shapeId: 'square', target: { x: 0, y: 0 }, valid: false, invalidReason: 'backgrounded' })).toBe(false);
  });
  it('invalid arm은 존재하지 않는 observation 없이 유효하다', () => expect(isAnyTrial({ trialId: 't', startedAtMs: 1, completedAtMs: null, valid: false, invalidReason: 'interrupted', kind: 'time', condition: 'baseline', targetDurationMs: 3000 })).toBe(true));
  it('invalid focus의 optional correct는 boolean일 때만 허용한다', () => {
    const invalidFocus = { trialId: 'f', startedAtMs: 1, completedAtMs: null, valid: false, invalidReason: 'interrupted', kind: 'focus', condition: 'visualSearch', stimulusId: 's', correctTargetId: 'c' };
    expect(isAnyTrial(invalidFocus)).toBe(true);
    expect(isAnyTrial({ ...invalidFocus, correct: false })).toBe(true);
    expect(isAnyTrial({ ...invalidFocus, correct: true })).toBe(true);
    expect(isAnyTrial({ ...invalidFocus, correct: 'yes' })).toBe(false);
  });
  it('valid/invalid invariant를 위반한 payload를 거부한다', () => expect(isAnyTrial({ ...base, valid: true, invalidReason: 'interrupted', kind: 'time', condition: 'baseline', targetDurationMs: 3000, observedDurationMs: 3000 })).toBe(false));
  it('3등분 cut order를 강제한다', () => expect(isAnyTrial({ ...base, valid: true, invalidReason: null, kind: 'balanceThreeWay', cutPositions: [0.7, 0.3] })).toBe(false));
  it('공간 기억 valid arm은 정확히 세 위치를 요구한다', () => expect(isAnyTrial({ ...base, valid: true, invalidReason: null, kind: 'spatialMemory', shownPositions: [{ x: 0, y: 0 }], selectedPositions: [{ x: 0, y: 0 }], exposureDurationMs: 1, responseTimeMs: 1 })).toBe(false));
});
