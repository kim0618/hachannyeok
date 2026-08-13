import { describe, expect, it } from 'vitest';
import { deriveOverallScore } from './overall';

describe('deriveOverallScore', () => {
  it('다섯 점수에 동일 가중 평균과 roundScore를 적용한다', () => {
    expect(deriveOverallScore({ time: 91, center: 87, balance: 96, control: 58, focus: 80 })).toEqual({ ok: true, value: 82 });
  });
  it('동일 입력은 결정적으로 같은 결과를 반환하고 non-finite는 실패한다', () => {
    const scores = { time: 80, center: 80, balance: 80, control: 80, focus: 80 };
    expect(deriveOverallScore(scores)).toEqual(deriveOverallScore(scores));
    expect(deriveOverallScore({ ...scores, focus: Number.NaN })).toEqual({ ok: false, reason: 'calculationFailure' });
  });
});
