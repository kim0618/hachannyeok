import { describe, expect, it } from 'vitest';
import { centerDistanceError, normalizePointerPosition } from './centerMeasurement';

const rect = { left: 100, top: 200, width: 200, height: 100 };

describe('Center 좌표 계산', () => {
  it('bounding rect 기준 중앙을 0.5, 0.5로 정규화한다', () => {
    expect(normalizePointerPosition({ clientX: 200, clientY: 250 }, rect)).toEqual({ ok: true, point: { x: 0.5, y: 0.5 } });
  });

  it('quarter 좌표를 viewport와 독립적으로 계산한다', () => {
    expect(normalizePointerPosition({ clientX: 150, clientY: 225 }, rect)).toEqual({ ok: true, point: { x: 0.25, y: 0.25 } });
  });

  it('범위 밖 좌표를 clamp하지 않고 거부한다', () => {
    expect(normalizePointerPosition({ clientX: 99, clientY: 250 }, rect)).toEqual({ ok: false, reason: 'outOfBounds' });
  });

  it('normalized Euclidean distance를 계산한다', () => {
    expect(centerDistanceError({ x: 0.53, y: 0.54 })).toBeCloseTo(0.05);
  });
});
