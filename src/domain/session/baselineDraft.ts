import { validateCompletion } from '../assessment/completion';
import { DAY1_ASSESSMENT_IDS, type Day1AssessmentId, type Day1RawResult } from '../assessment/results';
import type { BaselineRecord } from '../storage/types';

export type BaselineDraft = Partial<Record<Day1AssessmentId, Day1RawResult>>;

export type BaselineBuildResult =
  | { ok: true; record: BaselineRecord }
  | { ok: false; reason: 'missingResults' | 'incompleteResults' };

export function addBaselineResult(draft: BaselineDraft, result: Day1RawResult): BaselineDraft {
  return { ...draft, [result.assessmentType]: result };
}

export function buildBaselineRecord(
  draft: BaselineDraft,
  identity: Omit<BaselineRecord, 'assessmentRawResults'>,
): BaselineBuildResult {
  const results = DAY1_ASSESSMENT_IDS.map((assessmentType) => draft[assessmentType]);
  if (results.some((result) => result === undefined)) return { ok: false, reason: 'missingResults' };
  const assessmentRawResults = results as Day1RawResult[];
  if (assessmentRawResults.some((result) => validateCompletion(result).status !== 'completed')) {
    return { ok: false, reason: 'incompleteResults' };
  }
  return { ok: true, record: { ...identity, assessmentRawResults } };
}
