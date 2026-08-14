export type CenterShiftDirection = 'left' | 'right' | 'up' | 'down' | 'neutral';

export function deriveCenterShiftDirection(dx: number, dy: number): CenterShiftDirection | null {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  const absX = Math.abs(dx); const absY = Math.abs(dy);
  if ((dx === 0 && dy === 0) || absX === absY) return 'neutral';
  if (absX > absY) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}
