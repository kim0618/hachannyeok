import { describe, expect, it } from 'vitest';
import { DAY6_BLANK_DURATION_MS, DAY6_EXPOSURE_DURATION_MS, DAY6_SPATIAL_MEMORY_CONFIGS, day6ConfigForAttempt, isDay6SpreadAttempt } from './day6SpatialMemoryConfig';

describe('DAY 6 config', () => {
  it('exact A/B와 timing을 고정한다', () => {
    expect(DAY6_SPATIAL_MEMORY_CONFIGS).toEqual([
      [{ x: .22, y: .28 }, { x: .72, y: .30 }, { x: .50, y: .72 }],
      [{ x: .34, y: .38 }, { x: .62, y: .42 }, { x: .48, y: .66 }],
    ]);
    expect(DAY6_EXPOSURE_DURATION_MS).toBe(1200);
    expect(DAY6_BLANK_DURATION_MS).toBe(300);
  });

  it('전체 attempt index A/B/A/B/A 순서다', () => {
    expect([0, 1, 2, 3, 4].map(day6ConfigForAttempt)).toEqual([
      DAY6_SPATIAL_MEMORY_CONFIGS[0], DAY6_SPATIAL_MEMORY_CONFIGS[1], DAY6_SPATIAL_MEMORY_CONFIGS[0], DAY6_SPATIAL_MEMORY_CONFIGS[1], DAY6_SPATIAL_MEMORY_CONFIGS[0],
    ]);
    expect([0, 1, 2, 3, 4].map(isDay6SpreadAttempt)).toEqual([true, false, true, false, true]);
  });
});
