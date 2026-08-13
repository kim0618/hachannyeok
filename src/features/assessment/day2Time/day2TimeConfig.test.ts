import { describe, expect, it } from 'vitest';
import { conditionForAttempt, DAY2_TIME_CONDITIONS, DAY2_TIME_TARGET_DURATION_MS } from './day2TimeConfig';

describe('DAY 2 time config', () => {
  it('plain/distracted 순서와 3000ms target을 고정한다', () => {
    expect(DAY2_TIME_CONDITIONS).toEqual(['plain', 'distracted', 'plain', 'distracted']);
    expect(DAY2_TIME_TARGET_DURATION_MS).toBe(3000);
  });
  it('retry도 같은 순서를 결정적으로 순환한다', () => {
    expect(Array.from({ length: 8 }, (_, index) => conditionForAttempt(index))).toEqual(['plain', 'distracted', 'plain', 'distracted', 'plain', 'distracted', 'plain', 'distracted']);
  });
});
