import type { FinalRawResult } from './results';
import type { AnyTrial } from './trials';
import { DAY6_EXPOSURE_DURATION_MS, DAY6_SPATIAL_MEMORY_CONFIGS } from './day6SpatialMemoryConfig';
import { DAY3_CENTER_STIMULI } from '../../features/assessment/day3Center/day3CenterConfig';
import { DAY4_BALANCE_CONFIGS } from '../../features/assessment/day4Balance/day4BalanceConfig';
import { FOCUS_BASELINE_CONFIGS } from '../../features/assessment/focus/focusConfig';
import { BALANCE_INITIAL_POSITIONS } from '../../features/assessment/balance/balanceMeasurement';
import { DAY5_CONTROL_CONFIGS } from '../../features/assessment/day5Control/day5ControlMovement';

export const FINAL_TIME_CONDITIONS = ['plain', 'distracted', 'plain'] as const;
export const FINAL_CENTER_STIMULI = DAY3_CENTER_STIMULI;
export const FINAL_BALANCE_KINDS = ['balanceTwoWay', 'balanceThreeWay'] as const;
export const FINAL_BALANCE_VERTICAL_INITIAL_RATIO = BALANCE_INITIAL_POSITIONS.vertical;
export const FINAL_BALANCE_THREE_WAY_CONFIG = DAY4_BALANCE_CONFIGS[0]!;
export const FINAL_CONTROL_CONFIGS = [DAY5_CONTROL_CONFIGS[0]!, DAY5_CONTROL_CONFIGS[1]!, DAY5_CONTROL_CONFIGS[3]!] as const;
export const FINAL_FOCUS_KINDS = ['focus', 'spatialMemory'] as const;
export const FINAL_FOCUS_VISUAL_CONFIG = FOCUS_BASELINE_CONFIGS[1]!;
export const FINAL_FOCUS_MEMORY_POSITIONS = DAY6_SPATIAL_MEMORY_CONFIGS[1]!;

const pointEqual = (a: { x: number; y: number }, b: { x: number; y: number }) => a.x === b.x && a.y === b.y;
const pointsEqual = (actual: readonly { x: number; y: number }[], expected: readonly { x: number; y: number }[]) => actual.length === expected.length && actual.every((point, index) => pointEqual(point, expected[index]!));

export function isFinalTrialForAttempt(result: FinalRawResult, trial: AnyTrial, attemptIndex: number): boolean {
  switch (result.assessmentType) {
    case 'finalTime': return trial.kind === 'timeCondition' && trial.condition === FINAL_TIME_CONDITIONS[attemptIndex % 3] && trial.targetDurationMs === 3000;
    case 'finalCenter': {
      const expected = FINAL_CENTER_STIMULI[attemptIndex % 3]!;
      return trial.kind === 'centerCondition' && trial.condition === expected.condition && trial.decorationSide === expected.decorationSide && trial.stimulusId === expected.stimulusId && pointEqual(trial.target, { x: .5, y: .5 });
    }
    case 'finalBalance': {
      const kind = FINAL_BALANCE_KINDS[attemptIndex % 2];
      if (kind === 'balanceTwoWay') return trial.kind === 'balanceTwoWay' && trial.orientation === 'vertical' && trial.targetRatio === .5;
      return trial.kind === 'balanceThreeWay';
    }
    case 'finalControl': {
      const expected = FINAL_CONTROL_CONFIGS[attemptIndex % 3]!;
      return trial.kind === 'controlCondition' && trial.condition === expected.condition && trial.targetPosition === expected.targetPosition && trial.initialSpeedNormalized === expected.initialSpeedNormalized && trial.finalSpeedNormalized === expected.finalSpeedNormalized && trial.speedChangeAtNormalizedTime === expected.speedChangeAtNormalizedTime;
    }
    case 'finalFocus': {
      const kind = FINAL_FOCUS_KINDS[attemptIndex % 2];
      if (kind === 'focus') return trial.kind === 'focus' && trial.condition === 'visualSearch' && trial.stimulusId === FINAL_FOCUS_VISUAL_CONFIG.stimulusId && trial.correctTargetId === FINAL_FOCUS_VISUAL_CONFIG.correctTargetId;
      return trial.kind === 'spatialMemory' && pointsEqual(trial.shownPositions, FINAL_FOCUS_MEMORY_POSITIONS) && (!trial.valid || trial.exposureDurationMs === DAY6_EXPOSURE_DURATION_MS);
    }
  }
}

const FINAL_ASSESSMENT_BY_ABILITY: Record<FinalRawResult['selectedAbility'], FinalRawResult['assessmentType']> = {
  time: 'finalTime', center: 'finalCenter', balance: 'finalBalance', control: 'finalControl', focus: 'finalFocus',
};

export const finalAssessmentTypeForAbility = (ability: FinalRawResult['selectedAbility']): FinalRawResult['assessmentType'] => FINAL_ASSESSMENT_BY_ABILITY[ability];
