import type { BalanceThreeWayTrial, BalanceTwoWayTrial, CenterConditionTrial, CenterTrial, ControlConditionTrial, ControlTrial, FocusTrial, SpatialMemoryTrial, TimeConditionTrial, TimeTrial } from './trials';

export const ASSESSMENT_TYPES = [
  'day1_time', 'day1_center', 'day1_balance_two_way', 'day1_control_constant', 'day1_focus_search',
  'day2_time_distraction', 'day3_decorated_center', 'day4_balance_three_way', 'day5_control_surprise', 'day6_spatial_memory',
  'finalTime', 'finalCenter', 'finalBalance', 'finalControl', 'finalFocus',
] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];
export const isAssessmentType = (value: unknown): value is AssessmentType =>
  typeof value === 'string' && ASSESSMENT_TYPES.includes(value as AssessmentType);

export const DAY1_ASSESSMENT_IDS = ['day1_time', 'day1_center', 'day1_balance_two_way', 'day1_control_constant', 'day1_focus_search'] as const;
export type Day1AssessmentId = (typeof DAY1_ASSESSMENT_IDS)[number];
export type DailyAssessmentType = 'day2_time_distraction' | 'day3_decorated_center' | 'day4_balance_three_way' | 'day5_control_surprise' | 'day6_spatial_memory';
export type FinalAssessmentType = 'finalTime' | 'finalCenter' | 'finalBalance' | 'finalControl' | 'finalFocus';
export const FINAL_ASSESSMENT_ABILITY_MAP = {
  finalTime: 'time',
  finalCenter: 'center',
  finalBalance: 'balance',
  finalControl: 'control',
  finalFocus: 'focus',
} as const satisfies Record<FinalAssessmentType, string>;
export const isFinalAssessmentType = (value: AssessmentType): value is FinalAssessmentType => value in FINAL_ASSESSMENT_ABILITY_MAP;
export type Day1RawResult =
  | { assessmentType: 'day1_time'; trials: TimeTrial[] }
  | { assessmentType: 'day1_center'; trials: CenterTrial[] }
  | { assessmentType: 'day1_balance_two_way'; trials: BalanceTwoWayTrial[] }
  | { assessmentType: 'day1_control_constant'; trials: ControlTrial[] }
  | { assessmentType: 'day1_focus_search'; trials: FocusTrial[] };
export type DailyRawResult =
  | { assessmentType: 'day2_time_distraction'; trials: TimeConditionTrial[] }
  | { assessmentType: 'day3_decorated_center'; trials: CenterConditionTrial[] }
  | { assessmentType: 'day4_balance_three_way'; trials: BalanceThreeWayTrial[] }
  | { assessmentType: 'day5_control_surprise'; trials: ControlConditionTrial[] }
  | { assessmentType: 'day6_spatial_memory'; trials: SpatialMemoryTrial[] };
export type FinalTimeAssessmentResult = { assessmentType: 'finalTime'; selectedAbility: 'time'; trials: TimeConditionTrial[] };
export type FinalCenterAssessmentResult = { assessmentType: 'finalCenter'; selectedAbility: 'center'; trials: CenterConditionTrial[] };
export type FinalBalanceAssessmentResult = { assessmentType: 'finalBalance'; selectedAbility: 'balance'; trials: (BalanceTwoWayTrial | BalanceThreeWayTrial)[] };
export type FinalControlAssessmentResult = { assessmentType: 'finalControl'; selectedAbility: 'control'; trials: ControlConditionTrial[] };
export type FinalFocusAssessmentResult = { assessmentType: 'finalFocus'; selectedAbility: 'focus'; trials: (FocusTrial | SpatialMemoryTrial)[] };
export type FinalRawResult = FinalTimeAssessmentResult | FinalCenterAssessmentResult | FinalBalanceAssessmentResult | FinalControlAssessmentResult | FinalFocusAssessmentResult;
export type AssessmentRawResult = Day1RawResult | DailyRawResult | FinalRawResult;
