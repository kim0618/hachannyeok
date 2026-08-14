import type { SpatialMemoryTrial } from './trials';
import type { Point } from './types';

export const DAY6_EXPOSURE_DURATION_MS = 1200;
export const DAY6_BLANK_DURATION_MS = 300;
export const DAY6_SPATIAL_MEMORY_CONFIGS = [
  [{ x: .22, y: .28 }, { x: .72, y: .30 }, { x: .50, y: .72 }],
  [{ x: .34, y: .38 }, { x: .62, y: .42 }, { x: .48, y: .66 }],
] as const satisfies readonly (readonly Point[])[];

export const day6ConfigForAttempt = (attemptIndex: number): readonly Point[] => DAY6_SPATIAL_MEMORY_CONFIGS[attemptIndex % 2]!;
export const isDay6SpreadAttempt = (attemptIndex: number): boolean => attemptIndex % 2 === 0;
const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
export const isDay6SpatialMemoryTrialForAttempt = (trial: SpatialMemoryTrial, attemptIndex: number): boolean => {
  const expected = day6ConfigForAttempt(attemptIndex);
  return trial.shownPositions.length === expected.length && trial.shownPositions.every((point, index) => samePoint(point, expected[index]!)) && (!trial.valid || trial.exposureDurationMs === DAY6_EXPOSURE_DURATION_MS);
};
