import type { Point } from '../../../domain/assessment/types';
import type { ShapeId } from '../../../domain/assessment/trials';

export const CENTER_TARGET: Point = { x: 0.5, y: 0.5 };
export const CENTER_SHAPES: readonly ShapeId[] = ['rectangle', 'wideRectangle', 'square'];
export interface RectLike { left: number; top: number; width: number; height: number }
export type NormalizedPositionResult = { ok: true; point: Point } | { ok: false; reason: 'outOfBounds' };

export function normalizePointerPosition(pointer: { clientX: number; clientY: number }, rect: RectLike): NormalizedPositionResult {
  if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) return { ok: false, reason: 'outOfBounds' };
  const x = (pointer.clientX - rect.left) / rect.width;
  const y = (pointer.clientY - rect.top) / rect.height;
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return { ok: false, reason: 'outOfBounds' };
  return { ok: true, point: { x, y } };
}

export const centerDistanceError = (point: Point): number => Math.hypot(point.x - 0.5, point.y - 0.5);
export const CENTER_SHAPE_LABELS: Record<ShapeId, string> = { rectangle: '기본 사각형', wideRectangle: '넓은 사각형', square: '정사각형' };
