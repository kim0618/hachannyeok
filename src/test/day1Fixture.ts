import type { Day1RawResult } from '../domain/assessment/results';
import type { BaselineRecord } from '../domain/storage/types';

const base = { startedAtMs: 0, completedAtMs: 1000, valid: true as const, invalidReason: null };

export const day1RawFixture: Day1RawResult[] = [
  { assessmentType: 'day1_time', trials: [3000, 3100, 2900].map((observedDurationMs, index) => ({ ...base, trialId: `time-${index}`, kind: 'time' as const, condition: 'baseline' as const, targetDurationMs: 3000, observedDurationMs })) },
  { assessmentType: 'day1_center', trials: (['rectangle', 'wideRectangle', 'square'] as const).map((shapeId, index) => ({ ...base, trialId: `center-${index}`, kind: 'center' as const, condition: 'plain' as const, shapeId, target: { x: .5, y: .5 }, observed: { x: .51, y: .5 } })) },
  { assessmentType: 'day1_balance_two_way', trials: (['vertical', 'horizontal'] as const).map((orientation, index) => ({ ...base, trialId: `balance-${index}`, kind: 'balanceTwoWay' as const, orientation, targetRatio: .5 as const, observedRatio: index ? .52 : .49 })) },
  { assessmentType: 'day1_control_constant', trials: [[.32, .40], [.40, .58], [.48, .68]].map(([speedNormalized, targetPosition], index) => ({ ...base, trialId: `control-${index}`, kind: 'control' as const, condition: 'constant' as const, speedNormalized: speedNormalized!, targetPosition: targetPosition!, observedPosition: targetPosition! + .02 })) },
  { assessmentType: 'day1_focus_search', trials: [
    ['focus-baseline-1', 'focus-baseline-1-item-02', 'focus-baseline-1-item-02', true, 1000],
    ['focus-baseline-2', 'focus-baseline-2-item-08', 'focus-baseline-2-item-08', true, 1200],
    ['focus-baseline-3', 'focus-baseline-3-item-11', 'focus-baseline-3-item-01', false, 900],
  ].map(([stimulusId, correctTargetId, selectedTargetId, correct, reactionTimeMs], index) => ({ ...base, trialId: `focus-${index}`, kind: 'focus' as const, condition: 'visualSearch' as const, stimulusId: String(stimulusId), correctTargetId: String(correctTargetId), selectedTargetId: String(selectedTargetId), correct: Boolean(correct), reactionTimeMs: Number(reactionTimeMs) })) },
];

export const baselineFixture: BaselineRecord = {
  recordId: 'session-fixture:baseline', sessionId: 'session-fixture',
  startedAt: '2026-08-12T01:00:00.000Z', completedAt: '2026-08-12T01:02:00.000Z',
  startedLocalDateKey: '2026-08-12', completedLocalDateKey: '2026-08-12', assessmentRawResults: day1RawFixture,
};
