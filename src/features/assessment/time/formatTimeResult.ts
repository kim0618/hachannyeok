import { TIME_TARGET_DURATION_MS } from './useTimeTrial';

export const formatSeconds = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(2)}초`;
export const formatPreciseSeconds = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(3)}초`;
export const formatSignedSeconds = (milliseconds: number): string => milliseconds > 0 ? `+${formatPreciseSeconds(milliseconds)}` : formatPreciseSeconds(milliseconds);

export function describeTimeDirection(observedDurationMs: number): string {
  if (observedDurationMs === TIME_TARGET_DURATION_MS) return '정확했어요';
  return observedDurationMs > TIME_TARGET_DURATION_MS ? '조금 길었어요' : '조금 빨랐어요';
}

export function describeTimeError(observedDurationMs: number): string {
  const difference = observedDurationMs - TIME_TARGET_DURATION_MS;
  if (Math.abs(difference) < 5) return '거의 정확합니다.';
  return `목표보다 ${formatSeconds(Math.abs(difference))} ${difference < 0 ? '빨랐습니다.' : '늦었습니다.'}`;
}
