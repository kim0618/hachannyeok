import { DAY5_CONTROL_TRIAL_CONFIGS, day5ControlTrialConfigForAttempt } from '../../../domain/assessment/day5ControlConfig';

export const DAY5_CONTROL_START = 0.08 as const;
export const DAY5_CONTROL_END = 0.92 as const;
export type Day5Condition = 'predictable' | 'surprise';
export interface Day5ControlConfig { condition: Day5Condition; targetPosition: number; initialSpeedNormalized: number; finalSpeedNormalized: number; speedChangeAtNormalizedTime: number | null; startPosition: typeof DAY5_CONTROL_START; endPosition: typeof DAY5_CONTROL_END }
export const DAY5_CONTROL_CONFIGS = DAY5_CONTROL_TRIAL_CONFIGS.map((config) => ({ ...config, startPosition: DAY5_CONTROL_START, endPosition: DAY5_CONTROL_END })) satisfies readonly Day5ControlConfig[];
export const day5ConfigForAttempt=(attemptIndex:number):Day5ControlConfig=>({ ...day5ControlTrialConfigForAttempt(attemptIndex), startPosition: DAY5_CONTROL_START, endPosition: DAY5_CONTROL_END });
export const day5ChangeTimeSeconds=(config:Day5ControlConfig):number|null=>config.speedChangeAtNormalizedTime===null?null:((config.endPosition-config.startPosition)/config.initialSpeedNormalized)*config.speedChangeAtNormalizedTime;
export function day5PositionAtElapsed(config:Day5ControlConfig,elapsedMs:number):number{const elapsed=elapsedMs/1000,change=day5ChangeTimeSeconds(config);if(change===null||elapsed<=change)return config.startPosition+config.initialSpeedNormalized*elapsed;const changePosition=config.startPosition+config.initialSpeedNormalized*change;return changePosition+config.finalSpeedNormalized*(elapsed-change);}
export function day5EndTimeSeconds(config:Day5ControlConfig):number{const change=day5ChangeTimeSeconds(config);if(change===null)return(config.endPosition-config.startPosition)/config.initialSpeedNormalized;const changePosition=config.startPosition+config.initialSpeedNormalized*change;return change+(config.endPosition-changePosition)/config.finalSpeedNormalized;}
export function hasReachedDay5End(config:Day5ControlConfig,elapsedMs:number):boolean{const end=day5EndTimeSeconds(config)*1000;const tolerance=Number.EPSILON*Math.max(1,Math.abs(end));return elapsedMs>=end-tolerance;}
