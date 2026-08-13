export const DAY2_TIME_TARGET_DURATION_MS = 3000 as const;
export const DAY2_TIME_CONDITIONS = ['plain', 'distracted', 'plain', 'distracted'] as const;

export type Day2TimeCondition = (typeof DAY2_TIME_CONDITIONS)[number];

export function conditionForAttempt(attemptIndex: number): Day2TimeCondition {
  return DAY2_TIME_CONDITIONS[attemptIndex % DAY2_TIME_CONDITIONS.length]!;
}
