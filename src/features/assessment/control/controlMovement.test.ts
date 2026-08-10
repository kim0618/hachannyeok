import { describe, expect, it } from 'vitest';
import { CONTROL_BASELINE_CONFIGS, controlConfigForAttempt, hasReachedControlEnd, positionAtElapsed } from './controlMovement';

describe('control movement contract', () => {
  it.each([[0, 1000, 0.40], [1, 1250, 0.58], [2, 1250, 0.68]])('config %i positionAtElapsed', (index, elapsedMs, expected) => {
    expect(positionAtElapsed(CONTROL_BASELINE_CONFIGS[index], elapsedMs)).toBeCloseTo(expected, 12);
  });

  it('retry config는 attempt index로 결정적으로 순환한다', () => {
    expect([3, 4, 5].map((index) => controlConfigForAttempt(index))).toEqual(CONTROL_BASELINE_CONFIGS);
  });

  it('공통 direction과 track 경계를 고정한다', () => {
    for (const config of CONTROL_BASELINE_CONFIGS) expect(config).toMatchObject({ condition: 'constant', direction: 'leftToRight', startPosition: 0.08, endPosition: 0.92 });
  });

  it.each([
    [0, 2624.999, false], [0, 2625, true], [0, 2625.001, true],
    [1, 2099.999, false], [1, 2100, true], [1, 2100.001, true],
    [2, 1749.999, false], [2, 1750, true], [2, 1750.001, true],
  ])('config %i elapsed %fms end 판정', (index, elapsedMs, expected) => {
    expect(hasReachedControlEnd(CONTROL_BASELINE_CONFIGS[index], elapsedMs)).toBe(expected);
  });
});
