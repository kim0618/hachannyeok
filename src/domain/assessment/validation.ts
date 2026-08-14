import type { AnyTrial, CenterCondition, DecorationSide } from './trials';
import type { InvalidReason, Point } from './types';

const INVALID_REASONS: readonly InvalidReason[] = ['backgrounded', 'dateChanged', 'interrupted', 'duplicateInput', 'timingUnavailable', 'outOfBounds', 'insufficientObservation'];
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
export const isMilliseconds = (value: unknown): value is number => isFiniteNumber(value) && value >= 0;
export const isNormalized = (value: unknown): value is number => isFiniteNumber(value) && value >= 0 && value <= 1;
export const isPoint = (value: unknown): value is Point => isRecord(value) && isNormalized(value.x) && isNormalized(value.y);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNullableString = (value: unknown): value is string | null => value === null || isString(value);
const isPointArray = (value: unknown): value is Point[] => Array.isArray(value) && value.every(isPoint);
const oneOf = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === 'string' && values.includes(value as T);

function hasValidBase(value: Record<string, unknown>): boolean {
  return isString(value.trialId) && isMilliseconds(value.startedAtMs) && isMilliseconds(value.completedAtMs)
    && (value.completedAtMs as number) >= (value.startedAtMs as number) && value.invalidReason === null;
}

function hasInvalidBase(value: Record<string, unknown>): boolean {
  return isString(value.trialId) && isMilliseconds(value.startedAtMs)
    && (value.completedAtMs === null || (isMilliseconds(value.completedAtMs) && value.completedAtMs >= value.startedAtMs))
    && oneOf(value.invalidReason, INVALID_REASONS);
}

const conditionSideMatches = (condition: CenterCondition, side: DecorationSide): boolean =>
  (condition === 'plain' && side === 'none') || (condition === 'decoratedLeft' && side === 'left') || (condition === 'decoratedRight' && side === 'right');
const conditionStimulusMatches = (condition: CenterCondition, stimulusId: unknown): boolean =>
  (condition === 'plain' && stimulusId === 'day3-plain-01') || (condition === 'decoratedLeft' && stimulusId === 'day3-left-01') || (condition === 'decoratedRight' && stimulusId === 'day3-right-01');
const isCenterTarget = (value: unknown): boolean => isPoint(value) && value.x === 0.5 && value.y === 0.5;

export function isAnyTrial(input: unknown): input is AnyTrial {
  if (!isRecord(input) || typeof input.valid !== 'boolean') return false;
  if (input.valid ? !hasValidBase(input) : !hasInvalidBase(input)) return false;
  const observationAbsent = (key: string): boolean => !(key in input) || input[key] === null;
  switch (input.kind) {
    case 'time':
      return input.condition === 'baseline' && input.targetDurationMs === 3000 && (input.valid ? isMilliseconds(input.observedDurationMs) : observationAbsent('observedDurationMs'));
    case 'center':
      return input.condition === 'plain' && isCenterTarget(input.target) && oneOf(input.shapeId, ['rectangle', 'wideRectangle', 'square']) && (input.valid ? isPoint(input.observed) : observationAbsent('observed'));
    case 'balanceTwoWay':
      return oneOf(input.orientation, ['vertical', 'horizontal']) && input.targetRatio === 0.5 && (input.valid ? isNormalized(input.observedRatio) : observationAbsent('observedRatio'));
    case 'control':
      return input.condition === 'constant' && isNormalized(input.targetPosition) && isNormalized(input.speedNormalized) && (input.valid ? isNormalized(input.observedPosition) : observationAbsent('observedPosition'));
    case 'focus': {
      if (input.condition !== 'visualSearch' || !isString(input.stimulusId) || !isString(input.correctTargetId)) return false;
      if (!input.valid) return (!('selectedTargetId' in input) || isNullableString(input.selectedTargetId))
        && (!('reactionTimeMs' in input) || input.reactionTimeMs === null || isMilliseconds(input.reactionTimeMs))
        && (!('correct' in input) || typeof input.correct === 'boolean');
      if (!isNullableString(input.selectedTargetId) || !(input.reactionTimeMs === null || isMilliseconds(input.reactionTimeMs)) || typeof input.correct !== 'boolean') return false;
      const correct = input.selectedTargetId === input.correctTargetId;
      return input.correct === correct && (input.selectedTargetId === null ? input.reactionTimeMs === null : isMilliseconds(input.reactionTimeMs));
    }
    case 'timeCondition':
      return oneOf(input.condition, ['plain', 'distracted']) && input.targetDurationMs === 3000 && (input.valid ? isMilliseconds(input.observedDurationMs) : observationAbsent('observedDurationMs'));
    case 'centerCondition':
      return oneOf(input.condition, ['plain', 'decoratedLeft', 'decoratedRight']) && oneOf(input.decorationSide, ['none', 'left', 'right']) && conditionSideMatches(input.condition, input.decorationSide) && conditionStimulusMatches(input.condition, input.stimulusId) && isCenterTarget(input.target) && (input.valid ? isPoint(input.observed) : observationAbsent('observed'));
    case 'balanceThreeWay':
      return input.valid ? Array.isArray(input.cutPositions) && input.cutPositions.length === 2 && isNormalized(input.cutPositions[0]) && isNormalized(input.cutPositions[1]) && input.cutPositions[0] > 0 && input.cutPositions[0] < input.cutPositions[1] && input.cutPositions[1] < 1 : observationAbsent('cutPositions');
    case 'controlCondition': {
      if (!oneOf(input.condition, ['predictable', 'surprise']) || !isNormalized(input.targetPosition) || !isNormalized(input.initialSpeedNormalized) || !isNormalized(input.finalSpeedNormalized)) return false;
      const changeValid = input.condition === 'predictable' ? input.initialSpeedNormalized === input.finalSpeedNormalized && input.speedChangeAtNormalizedTime === null : input.initialSpeedNormalized !== input.finalSpeedNormalized && isNormalized(input.speedChangeAtNormalizedTime) && input.speedChangeAtNormalizedTime > 0 && input.speedChangeAtNormalizedTime < 1;
      return changeValid && (input.valid ? isNormalized(input.observedPosition) : observationAbsent('observedPosition'));
    }
    case 'spatialMemory':
      if (!isPointArray(input.shownPositions)) return false;
      if (input.valid) return input.shownPositions.length === 3 && isPointArray(input.selectedPositions) && input.selectedPositions.length === 3 && isMilliseconds(input.exposureDurationMs) && isMilliseconds(input.responseTimeMs);
      return (!('selectedPositions' in input) || isPointArray(input.selectedPositions)) && (!('exposureDurationMs' in input) || isMilliseconds(input.exposureDurationMs)) && (!('responseTimeMs' in input) || isMilliseconds(input.responseTimeMs));
    default:
      return false;
  }
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: 'invalidRawTrial' };
export const validateTrial = (value: unknown): ValidationResult<AnyTrial> => isAnyTrial(value) ? { ok: true, value } : { ok: false, error: 'invalidRawTrial' };
