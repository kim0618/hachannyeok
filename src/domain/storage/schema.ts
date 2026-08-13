import { validateCompletion } from '../assessment/completion';
import { DAY1_ASSESSMENT_IDS, FINAL_ASSESSMENT_ABILITY_MAP, isAssessmentType, isFinalAssessmentType, type AssessmentRawResult, type Day1RawResult, type DailyRawResult, type FinalRawResult } from '../assessment/results';
import { isAnyTrial } from '../assessment/validation';
import { isLocalDateKey } from '../progression/localDate';
import { ABILITIES } from '../scoring/types';
import type { ActiveBaselineSession } from '../session/types';
import type { BaselineRecord, DailyRecord, FinalRecord, PersistedAppData } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isIso = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every((key) => keys.includes(key));
const completedAfterStarted = (record: Record<string, unknown>): boolean => isIso(record.startedAt) && isIso(record.completedAt) && Date.parse(record.completedAt) >= Date.parse(record.startedAt);
const validResult = (value: unknown): value is AssessmentRawResult => isRecord(value) && isAssessmentType(value.assessmentType) && Array.isArray(value.trials) && value.trials.every(isAnyTrial);
const isCompleteResult = (value: unknown): value is AssessmentRawResult => validResult(value) && validateCompletion(value).status === 'completed';

function isBaseline(value: unknown): value is BaselineRecord {
  if (!isRecord(value) || !isString(value.recordId) || !isString(value.sessionId) || !completedAfterStarted(value) || !isLocalDateKey(value.startedLocalDateKey) || !isLocalDateKey(value.completedLocalDateKey) || value.startedLocalDateKey !== value.completedLocalDateKey || !Array.isArray(value.assessmentRawResults)) return false;
  const results = value.assessmentRawResults;
  return results.length === 5 && results.every(isCompleteResult) && new Set(results.map((result) => result.assessmentType)).size === 5 && results.every((result): result is Day1RawResult => result.assessmentType.startsWith('day1_'));
}
function isDaily(value: unknown): value is DailyRecord {
  if (!isRecord(value) || !isString(value.recordId) || !isString(value.sessionId) || !completedAfterStarted(value) || !isLocalDateKey(value.localDateKey) || ![2, 3, 4, 5, 6].includes(value.analysisDay as number) || !isCompleteResult(value.rawResult)) return false;
  const expected = `day${String(value.analysisDay)}_`;
  return isString(value.assessmentType) && value.assessmentType === value.rawResult.assessmentType && value.assessmentType.startsWith(expected) && (value.rawResult as DailyRawResult).assessmentType.startsWith(expected);
}
export function isFinalRecord(value: unknown): value is FinalRecord {
  if (!isRecord(value) || !isString(value.recordId) || !isString(value.sessionId) || !completedAfterStarted(value) || !isLocalDateKey(value.localDateKey) || !ABILITIES.includes(value.selectedAbility as never) || !isAssessmentType(value.assessmentType) || !isFinalAssessmentType(value.assessmentType) || !isCompleteResult(value.rawResult)) return false;
  const rawResult = value.rawResult as FinalRawResult;
  const expectedAbility = FINAL_ASSESSMENT_ABILITY_MAP[value.assessmentType];
  return value.assessmentType === rawResult.assessmentType && value.selectedAbility === rawResult.selectedAbility && value.selectedAbility === expectedAbility;
}
export function isActiveBaselineSession(value: unknown): value is ActiveBaselineSession {
  if (!isRecord(value) || !isString(value.sessionId) || !isIso(value.startedAt) || !isLocalDateKey(value.startedLocalDateKey) || !Array.isArray(value.completedAssessmentIds) || !Array.isArray(value.partialRawResults)) return false;
  const results = value.partialRawResults;
  const canonicalPrefix = DAY1_ASSESSMENT_IDS.slice(0, results.length);
  return results.length < DAY1_ASSESSMENT_IDS.length
    && results.every(isCompleteResult)
    && results.every((result) => DAY1_ASSESSMENT_IDS.includes(result.assessmentType as Day1RawResult['assessmentType']))
    && value.completedAssessmentIds.length === results.length
    && value.completedAssessmentIds.every((id) => DAY1_ASSESSMENT_IDS.includes(id as Day1RawResult['assessmentType']))
    && new Set(value.completedAssessmentIds).size === value.completedAssessmentIds.length
    && new Set(results.map((result) => result.assessmentType)).size === results.length
    && value.completedAssessmentIds.every((id, index) => id === results[index]!.assessmentType)
    && value.completedAssessmentIds.every((id, index) => id === canonicalPrefix[index]);
}

export function isPersistedAppData(value: unknown): value is PersistedAppData {
  if (!isRecord(value) || !hasOnlyKeys(value, ['schemaVersion', 'baseline', 'dailyRecords', 'finalRecord', 'activeBaselineSession', 'metadata']) || value.schemaVersion !== 1 || !Array.isArray(value.dailyRecords) || !value.dailyRecords.every(isDaily) || !isRecord(value.metadata) || !hasOnlyKeys(value.metadata, ['firstStartedAt', 'lastSuccessfulWriteAt'])) return false;
  if ('baseline' in value && value.baseline !== undefined && !isBaseline(value.baseline)) return false;
  if ('finalRecord' in value && value.finalRecord !== undefined && !isFinalRecord(value.finalRecord)) return false;
  if ('activeBaselineSession' in value && value.activeBaselineSession !== undefined && value.activeBaselineSession !== null && !isActiveBaselineSession(value.activeBaselineSession)) return false;
  if (value.metadata.firstStartedAt !== undefined && !isIso(value.metadata.firstStartedAt)) return false;
  if (value.metadata.lastSuccessfulWriteAt !== undefined && !isIso(value.metadata.lastSuccessfulWriteAt)) return false;
  const baseline = value.baseline;
  const dailyRecords = value.dailyRecords;
  const finalRecord = value.finalRecord;
  if (dailyRecords.length > 0 && !isBaseline(baseline)) return false;
  const days = dailyRecords.map((record) => record.analysisDay);
  if (days.some((day, index) => day !== index + 2)) return false;
  const keys = dailyRecords.map((record) => record.localDateKey);
  if (keys.some((key, index) => index > 0 && key <= keys[index - 1]!)) return false;
  if (isBaseline(baseline) && keys[0] !== undefined && keys[0] <= baseline.completedLocalDateKey) return false;
  if (isFinalRecord(finalRecord) && (days.length !== 5 || finalRecord.localDateKey <= keys[4]!)) return false;
  const recordIds = [isBaseline(baseline) ? baseline.recordId : undefined, ...dailyRecords.map((record) => record.recordId), isFinalRecord(finalRecord) ? finalRecord.recordId : undefined].filter(isString);
  return new Set(recordIds).size === recordIds.length;
}

export type PersistedValidationResult = { ok: true; data: PersistedAppData } | { ok: false; error: 'corruptData' };
export const validatePersistedAppData = (value: unknown): PersistedValidationResult => isPersistedAppData(value) ? { ok: true, data: value } : { ok: false, error: 'corruptData' };
