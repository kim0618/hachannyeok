export type TimeShiftDirection = 'earlier' | 'later' | 'neutral';

export function deriveTimeShiftDirection(signedShiftMs: number): TimeShiftDirection | null {
  if (!Number.isFinite(signedShiftMs)) return null;
  if (signedShiftMs < 0) return 'earlier';
  if (signedShiftMs > 0) return 'later';
  return 'neutral';
}
