import { BALANCE_ERROR_WORST, CONDITION_SENSITIVITY_DISPLAY_THRESHOLD, TENDENCY_DISPLAY_THRESHOLD } from '../../domain/scoring/calibration';
import { clamp01 } from '../../domain/scoring/math';

export type TerminalDirection = 'large' | 'small' | 'neutral';

export const terminalDirectionMagnitude = (terminalBias: number): number =>
  clamp01(Math.abs(terminalBias) / BALANCE_ERROR_WORST);

export const deriveTerminalDirection = (terminalBias: number): TerminalDirection => {
  if (terminalDirectionMagnitude(terminalBias) < TENDENCY_DISPLAY_THRESHOLD) return 'neutral';
  return terminalBias > 0 ? 'large' : terminalBias < 0 ? 'small' : 'neutral';
};

export const hasMeaningfulThreeWayDegradation = (twoWayMean: number, threeWayMean: number): boolean =>
  clamp01(Math.max(threeWayMean - twoWayMean, 0) / BALANCE_ERROR_WORST) >= CONDITION_SENSITIVITY_DISPLAY_THRESHOLD;

export const hasCancellationAcrossTrials = (segments: readonly (readonly number[])[]): boolean =>
  [0, 1, 2].some((index) => {
    const deviations = segments.map((values) => values[index]! - 1 / 3);
    return deviations.some((value) => value < 0) && deviations.some((value) => value > 0);
  });
