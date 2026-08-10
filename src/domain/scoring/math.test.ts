import { describe, expect, it } from 'vitest';
import { clamp01, euclideanDistance, mean, median, populationStdDev, roundScore } from './math';

describe('공통 점수 수학 계약', () => {
  it('빈 평균 입력을 명시적으로 거부한다', () => expect(mean([])).toEqual({ ok: false, error: 'emptyInput' }));
  it('한 값만 있는 표준편차를 unavailable로 처리한다', () => expect(populationStdDev([1])).toEqual({ ok: false, error: 'insufficientValues' }));
  it('분모 N인 population standard deviation을 계산한다', () => expect(populationStdDev([1, 2, 3])).toEqual({ ok: true, value: Math.sqrt(2 / 3) }));
  it('derived 값만 0..1 및 0..100으로 제한한다', () => { expect(clamp01(-1)).toBe(0); expect(clamp01(2)).toBe(1); expect(roundScore(99.6)).toBe(100); });
  it('non-finite derived 값이 점수로 전파되지 않게 거부한다', () => { expect(() => clamp01(Number.NaN)).toThrow(RangeError); expect(() => roundScore(Infinity)).toThrow(RangeError); });
  it('median 홀수/짝수와 빈 경계를 계산한다', () => { expect(median([3, 1, 2])).toEqual({ ok: true, value: 2 }); expect(median([4, 1, 3, 2])).toEqual({ ok: true, value: 2.5 }); expect(median([]).ok).toBe(false); });
  it('normalized 좌표 Euclidean 거리를 계산한다', () => expect(euclideanDistance({ x: 0, y: 0 }, { x: 0.3, y: 0.4 })).toBe(0.5));
  it('극단 finite 값의 평균과 중앙값을 overflow 없이 계산한다', () => {
    expect(mean([Number.MAX_VALUE, Number.MAX_VALUE])).toEqual({ ok: true, value: Number.MAX_VALUE });
    expect(median([Number.MAX_VALUE, Number.MAX_VALUE])).toEqual({ ok: true, value: Number.MAX_VALUE });
  });
  it('극단 finite 값의 population standard deviation이 non-finite를 노출하지 않는다', () => {
    const result = populationStdDev([Number.MAX_VALUE, Number.MAX_VALUE / 2]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(Number.isFinite(result.value)).toBe(true);
  });
});
