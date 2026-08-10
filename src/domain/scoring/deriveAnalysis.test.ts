import { describe, expect, it } from 'vitest';
import type { PersistedAppData } from '../storage/types';
import { deriveAnalysis } from './deriveAnalysis';

const valid = { startedAtMs: 0, completedAtMs: 1, valid: true as const, invalidReason: null };

const extremeData: PersistedAppData = {
  schemaVersion: 1,
  baseline: {
    recordId: 'baseline-record', sessionId: 'baseline-session', startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:01:00.000Z', startedLocalDateKey: '2026-01-01', completedLocalDateKey: '2026-01-01',
    assessmentRawResults: [
      { assessmentType: 'day1_time', trials: [1, 2, 3].map((index) => ({ ...valid, trialId: `time-${index}`, kind: 'time' as const, condition: 'baseline' as const, targetDurationMs: 3000, observedDurationMs: Number.MAX_VALUE })) },
      { assessmentType: 'day1_center', trials: [1, 2, 3].map((index) => ({ ...valid, trialId: `center-${index}`, kind: 'center' as const, condition: 'plain' as const, shapeId: 'square' as const, target: { x: .5, y: .5 }, observed: { x: .5, y: .5 } })) },
      { assessmentType: 'day1_balance_two_way', trials: ['vertical', 'horizontal'].map((orientation, index) => ({ ...valid, trialId: `balance-${index}`, kind: 'balanceTwoWay' as const, orientation: orientation as 'vertical' | 'horizontal', targetRatio: .5 as const, observedRatio: .5 })) },
      { assessmentType: 'day1_control_constant', trials: [1, 2, 3].map((index) => ({ ...valid, trialId: `control-${index}`, kind: 'control' as const, condition: 'constant' as const, targetPosition: .5, observedPosition: .5, speedNormalized: .5 })) },
      { assessmentType: 'day1_focus_search', trials: [1, 2, 3].map((index) => ({ ...valid, trialId: `focus-${index}`, kind: 'focus' as const, condition: 'visualSearch' as const, stimulusId: `s-${index}`, correctTargetId: 'a', selectedTargetId: 'a', reactionTimeMs: Number.MAX_VALUE, correct: true })) },
    ],
  },
  dailyRecords: [],
  metadata: {},
};

describe('deriveAnalysis failure safety and determinism', () => {
  it('극단 finite persisted raw evidence를 throw 없이 계산한다', () => {
    expect(() => deriveAnalysis(extremeData)).not.toThrow();
    const result = deriveAnalysis(extremeData);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.scores.time).toBe(25);
      expect(result.value.scores.focus).toBe(80);
    }
  });

  it('동일 persisted input을 두 번 replay하면 deep equal이다', () => {
    expect(deriveAnalysis(extremeData)).toEqual(deriveAnalysis(extremeData));
  });
});
