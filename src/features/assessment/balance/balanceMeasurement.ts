import type { BalanceTwoWayTrial } from '../../../domain/assessment/trials';

export type BalanceOrientation = BalanceTwoWayTrial['orientation'];
export interface RectLike { left: number; top: number; width: number; height: number }
export type DividerPositionResult = { ok: true; ratio: number } | { ok: false; reason: 'invalidGeometry' };

export const BALANCE_TARGET_RATIO = 0.5 as const;
export const BALANCE_ORIENTATIONS: readonly BalanceOrientation[] = ['vertical', 'horizontal'];
export const BALANCE_INITIAL_POSITIONS: Readonly<Record<BalanceOrientation, number>> = {
  vertical: 0.32,
  horizontal: 0.68,
};

export function normalizeDividerPosition(input: {
  orientation: BalanceOrientation;
  clientX: number;
  clientY: number;
  rect: RectLike;
}): DividerPositionResult {
  const { orientation, clientX, clientY, rect } = input;
  if (![rect.left, rect.top, rect.width, rect.height, clientX, clientY].every(Number.isFinite)
    || rect.width <= 0 || rect.height <= 0) {
    return { ok: false, reason: 'invalidGeometry' };
  }
  const ratio = orientation === 'vertical'
    ? (clientX - rect.left) / rect.width
    : (clientY - rect.top) / rect.height;
  return { ok: true, ratio: Math.min(1, Math.max(0, ratio)) };
}

export const balanceError = (observedRatio: number): number => Math.abs(observedRatio - BALANCE_TARGET_RATIO);

export function closerOrientation(trials: BalanceTwoWayTrial[]): BalanceOrientation | null {
  const meanError = (orientation: BalanceOrientation): number | null => {
    const errors = trials
      .filter((trial): trial is Extract<BalanceTwoWayTrial, { valid: true }> => trial.valid && trial.orientation === orientation)
      .map((trial) => balanceError(trial.observedRatio));
    return errors.length === 0 ? null : errors.reduce((sum, error) => sum + error, 0) / errors.length;
  };
  const vertical = meanError('vertical');
  const horizontal = meanError('horizontal');
  if (vertical === null || horizontal === null) return vertical === null ? horizontal === null ? null : 'horizontal' : 'vertical';
  return vertical <= horizontal ? 'vertical' : 'horizontal';
}
