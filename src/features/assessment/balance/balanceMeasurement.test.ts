import { describe, expect, it } from 'vitest';
import { BALANCE_INITIAL_POSITIONS, balanceError, closerOrientation, normalizeDividerPosition } from './balanceMeasurement';

const rect = { left: 100, top: 200, width: 200, height: 100 };
describe('balance measurement helpers', () => {
  it('세로 x와 가로 y를 normalized ratio로 변환한다', () => {
    expect(normalizeDividerPosition({ orientation: 'vertical', clientX: 150, clientY: 0, rect })).toEqual({ ok: true, ratio: 0.25 });
    expect(normalizeDividerPosition({ orientation: 'horizontal', clientX: 0, clientY: 225, rect })).toEqual({ ok: true, ratio: 0.25 });
  });
  it('시각적 위치는 경계 0과 1 안으로 제한한다', () => {
    expect(normalizeDividerPosition({ orientation: 'vertical', clientX: 0, clientY: 0, rect })).toEqual({ ok: true, ratio: 0 });
    expect(normalizeDividerPosition({ orientation: 'horizontal', clientX: 0, clientY: 400, rect })).toEqual({ ok: true, ratio: 1 });
  });
  it.each([
    ['width 0', { ...rect, width: 0 }, 150, 225],
    ['height 0', { ...rect, height: 0 }, 150, 225],
    ['width Infinity', { ...rect, width: Infinity }, 150, 225],
    ['width NaN', { ...rect, width: Number.NaN }, 150, 225],
    ['clientX Infinity', rect, Infinity, 225],
  ])('%s geometry는 명시적으로 실패한다', (_name, invalidRect, clientX, clientY) => {
    expect(normalizeDividerPosition({ orientation: 'vertical', clientX, clientY, rect: invalidRect })).toEqual({ ok: false, reason: 'invalidGeometry' });
  });
  it('초기 위치는 고정된 비중앙 값이다', () => expect(BALANCE_INITIAL_POSITIONS).toEqual({ vertical: 0.32, horizontal: 0.68 }));
  it('오차와 동률 vertical 우선 summary를 계산한다', () => {
    expect(balanceError(0.542)).toBeCloseTo(0.042);
    expect(closerOrientation([
      { kind: 'balanceTwoWay', orientation: 'horizontal', targetRatio: 0.5, observedRatio: 0.6, trialId: 'h', startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null },
      { kind: 'balanceTwoWay', orientation: 'vertical', targetRatio: 0.5, observedRatio: 0.4, trialId: 'v', startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null },
    ])).toBe('vertical');
  });
  it('retry를 포함한 orientation별 전체 valid evidence 평균을 비교한다', () => {
    expect(closerOrientation([
      { kind: 'balanceTwoWay', orientation: 'vertical', targetRatio: 0.5, observedRatio: 0.49, trialId: 'v1', startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null },
      { kind: 'balanceTwoWay', orientation: 'horizontal', targetRatio: 0.5, trialId: 'hi', startedAtMs: 0, completedAtMs: 1, valid: false, invalidReason: 'backgrounded' },
      { kind: 'balanceTwoWay', orientation: 'vertical', targetRatio: 0.5, observedRatio: 0.9, trialId: 'v2', startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null },
      { kind: 'balanceTwoWay', orientation: 'horizontal', targetRatio: 0.5, observedRatio: 0.6, trialId: 'h1', startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null },
    ])).toBe('horizontal');
  });
  it('한 orientation만 있으면 해당 orientation, evidence가 없으면 null이다', () => {
    expect(closerOrientation([{ kind: 'balanceTwoWay', orientation: 'horizontal', targetRatio: 0.5, observedRatio: 0.5, trialId: 'h', startedAtMs: 0, completedAtMs: 1, valid: true, invalidReason: null }])).toBe('horizontal');
    expect(closerOrientation([])).toBeNull();
  });
});
