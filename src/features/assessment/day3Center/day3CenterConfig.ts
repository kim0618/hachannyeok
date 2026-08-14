import type { CenterCondition, CenterStimulusId, DecorationSide } from '../../../domain/assessment/trials';

export interface DecorationCircle { x: number; y: number; r: number }
export interface Day3CenterStimulus { condition: CenterCondition; decorationSide: DecorationSide; stimulusId: CenterStimulusId; circles: readonly DecorationCircle[] }

const LEFT: readonly DecorationCircle[] = [
  { x: .14, y: .24, r: .055 }, { x: .22, y: .39, r: .04 }, { x: .11, y: .57, r: .04 }, { x: .26, y: .70, r: .026 }, { x: .17, y: .82, r: .026 },
];
export const DAY3_CENTER_STIMULI: readonly Day3CenterStimulus[] = [
  { condition: 'plain', decorationSide: 'none', stimulusId: 'day3-plain-01', circles: [] },
  { condition: 'decoratedLeft', decorationSide: 'left', stimulusId: 'day3-left-01', circles: LEFT },
  { condition: 'decoratedRight', decorationSide: 'right', stimulusId: 'day3-right-01', circles: LEFT.map(({ x, y, r }) => ({ x: 1 - x, y, r })) },
];
export const stimulusForAttempt = (attemptIndex: number): Day3CenterStimulus => DAY3_CENTER_STIMULI[attemptIndex % DAY3_CENTER_STIMULI.length]!;
