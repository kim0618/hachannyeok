import type { ControlConditionTrial } from './trials';

export const DAY5_CONTROL_TRIAL_CONFIGS = [
  { condition: 'predictable', targetPosition: 0.58, initialSpeedNormalized: 0.32, finalSpeedNormalized: 0.32, speedChangeAtNormalizedTime: null },
  { condition: 'surprise', targetPosition: 0.58, initialSpeedNormalized: 0.32, finalSpeedNormalized: 0.50, speedChangeAtNormalizedTime: 0.45 },
  { condition: 'predictable', targetPosition: 0.68, initialSpeedNormalized: 0.40, finalSpeedNormalized: 0.40, speedChangeAtNormalizedTime: null },
  { condition: 'surprise', targetPosition: 0.68, initialSpeedNormalized: 0.40, finalSpeedNormalized: 0.24, speedChangeAtNormalizedTime: 0.50 },
] as const;

export type Day5ControlTrialConfig = (typeof DAY5_CONTROL_TRIAL_CONFIGS)[number];

export const day5ControlTrialConfigForAttempt = (attemptIndex: number): Day5ControlTrialConfig =>
  DAY5_CONTROL_TRIAL_CONFIGS[attemptIndex % DAY5_CONTROL_TRIAL_CONFIGS.length]!;

export function isDay5ControlTrialForAttempt(trial: ControlConditionTrial, attemptIndex: number): boolean {
  const expected = day5ControlTrialConfigForAttempt(attemptIndex);
  return trial.condition === expected.condition
    && trial.targetPosition === expected.targetPosition
    && trial.initialSpeedNormalized === expected.initialSpeedNormalized
    && trial.finalSpeedNormalized === expected.finalSpeedNormalized
    && trial.speedChangeAtNormalizedTime === expected.speedChangeAtNormalizedTime;
}
