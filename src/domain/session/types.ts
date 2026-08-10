import type { AssessmentRawResult, Day1AssessmentId, Day1RawResult } from '../assessment/results';
import type { LocalDateKey } from '../progression/types';

export type AssessmentSessionState = 'idle' | 'inProgress' | 'invalidated' | 'computedPendingSave' | 'saved';
export type SessionEvent = 'start' | 'invalidate' | 'compute' | 'saveSucceeded' | 'saveFailed';
export type SessionTransitionResult = { ok: true; state: AssessmentSessionState } | { ok: false; error: 'invalidTransition'; state: AssessmentSessionState };
const TRANSITIONS: Record<AssessmentSessionState, Partial<Record<SessionEvent, AssessmentSessionState>>> = {
  idle: { start: 'inProgress' },
  inProgress: { invalidate: 'invalidated', compute: 'computedPendingSave' },
  invalidated: {},
  computedPendingSave: { saveSucceeded: 'saved', saveFailed: 'computedPendingSave' },
  saved: {},
};
export function transitionSession(state: AssessmentSessionState, event: SessionEvent): SessionTransitionResult {
  const next = TRANSITIONS[state][event];
  return next ? { ok: true, state: next } : { ok: false, error: 'invalidTransition', state };
}

export interface ActiveBaselineSession {
  sessionId: string;
  startedAt: string;
  startedLocalDateKey: LocalDateKey;
  completedAssessmentIds: Day1AssessmentId[];
  partialRawResults: Day1RawResult[];
}
export const shouldDiscardBaselineCheckpoint = (session: ActiveBaselineSession, today: LocalDateKey): boolean => session.startedLocalDateKey !== today;
export interface PendingAssessmentSave { sessionId: string; recordId: string; result: AssessmentRawResult }

