export const CONTROL_START_POSITION = 0.08 as const;
export const CONTROL_END_POSITION = 0.92 as const;

export interface ControlBaselineConfig {
  readonly condition: 'constant';
  readonly direction: 'leftToRight';
  readonly startPosition: typeof CONTROL_START_POSITION;
  readonly endPosition: typeof CONTROL_END_POSITION;
  readonly speedNormalized: number;
  readonly targetPosition: number;
}

export const CONTROL_BASELINE_CONFIGS = [
  { condition: 'constant', direction: 'leftToRight', startPosition: CONTROL_START_POSITION, endPosition: CONTROL_END_POSITION, speedNormalized: 0.32, targetPosition: 0.40 },
  { condition: 'constant', direction: 'leftToRight', startPosition: CONTROL_START_POSITION, endPosition: CONTROL_END_POSITION, speedNormalized: 0.40, targetPosition: 0.58 },
  { condition: 'constant', direction: 'leftToRight', startPosition: CONTROL_START_POSITION, endPosition: CONTROL_END_POSITION, speedNormalized: 0.48, targetPosition: 0.68 },
] as const satisfies readonly ControlBaselineConfig[];

export function controlConfigForAttempt(attemptIndex: number): ControlBaselineConfig {
  return CONTROL_BASELINE_CONFIGS[attemptIndex % CONTROL_BASELINE_CONFIGS.length];
}

export function positionAtElapsed(config: ControlBaselineConfig, elapsedMs: number): number {
  return config.startPosition + (elapsedMs / 1000) * config.speedNormalized;
}

export function hasReachedControlEnd(config: ControlBaselineConfig, elapsedMs: number): boolean {
  const endElapsedMs = ((config.endPosition - config.startPosition) / config.speedNormalized) * 1000;
  const floatingPointToleranceMs = Number.EPSILON * Math.max(1, Math.abs(endElapsedMs));
  return elapsedMs >= endElapsedMs - floatingPointToleranceMs;
}

export const controlPositionError = (observedPosition: number, targetPosition: number): number =>
  Math.abs(observedPosition - targetPosition);
