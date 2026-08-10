import { TIME_TARGET_DURATION_MS } from './useTimeTrial';

export const formatSeconds = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(2)}초`;

export function describeTimeError(observedDurationMs: number): string {
  const difference = observedDurationMs - TIME_TARGET_DURATION_MS;
  if (Math.abs(difference) < 5) return '거의 정확합니다.';
  return `목표보다 ${formatSeconds(Math.abs(difference))} ${difference < 0 ? '빨랐습니다.' : '늦었습니다.'}`;
}
