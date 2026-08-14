export interface Day4BalanceConfig { cut1: number; cut2: number }

export const DAY4_BALANCE_CONFIGS: readonly Day4BalanceConfig[] = [
  { cut1: 0.28, cut2: 0.72 },
  { cut1: 0.38, cut2: 0.62 },
];

export const day4ConfigForAttempt = (attemptIndex: number): Day4BalanceConfig =>
  DAY4_BALANCE_CONFIGS[attemptIndex % DAY4_BALANCE_CONFIGS.length]!;

export const day4Segments = ([cut1, cut2]: readonly [number, number]) =>
  [cut1, cut2 - cut1, 1 - cut2] as const;
