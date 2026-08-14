import { describe, expect, it } from 'vitest';
import { DAY3_CENTER_STIMULI, stimulusForAttempt } from './day3CenterConfig';
describe('DAY 3 center stimulus config', () => {
  it('attempt 1~6을 plain/left/right로 결정적으로 반복한다', () => {
    expect(Array.from({ length: 6 }, (_, index) => stimulusForAttempt(index)).map(({ condition, stimulusId }) => [condition, stimulusId])).toEqual([
      ['plain', 'day3-plain-01'], ['decoratedLeft', 'day3-left-01'], ['decoratedRight', 'day3-right-01'], ['plain', 'day3-plain-01'], ['decoratedLeft', 'day3-left-01'], ['decoratedRight', 'day3-right-01'],
    ]);
  });
  it('좌우 장식은 5개 exact mirror이며 중앙 제외 구간에 들어오지 않는다', () => {
    const left = DAY3_CENTER_STIMULI[1]!.circles; const right = DAY3_CENTER_STIMULI[2]!.circles;
    expect(left).toHaveLength(5); expect(right).toHaveLength(5); expect(right).toEqual(left.map(({ x, y, r }) => ({ x: 1 - x, y, r })));
    expect([...left, ...right].every(({ x }) => x < .35 || x > .65)).toBe(true); expect(DAY3_CENTER_STIMULI[0]!.circles).toHaveLength(0);
  });
});
