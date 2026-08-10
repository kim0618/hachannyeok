import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion, type CompletionStatus } from '../../../domain/assessment/completion';
import type { TimeTrial } from '../../../domain/assessment/trials';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';

export const TIME_TARGET_DURATION_MS = 3000 as const;

export interface MeasurementClock {
  now(): number;
}

interface UseTimeTrialOptions {
  clock?: MeasurementClock;
  dateNow?: () => Date;
  createTrialId?: () => string;
}

export type TimeTrialPhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';

const performanceClock: MeasurementClock = { now: () => performance.now() };
const createDefaultTrialId = (): string => crypto.randomUUID();

export function getTimeCompletion(trials: TimeTrial[]): CompletionStatus {
  return validateCompletion({ assessmentType: 'day1_time', trials });
}

export function useTimeTrial({
  clock = performanceClock,
  dateNow = () => new Date(),
  createTrialId = createDefaultTrialId,
}: UseTimeTrialOptions = {}) {
  const [trials, setTrials] = useState<TimeTrial[]>([]);
  const [phase, setPhase] = useState<TimeTrialPhase>('ready');
  const activeRef = useRef<{ trialId: string; startedAtMs: number; startedLocalDateKey: LocalDateKey } | null>(null);
  const assessmentStartedLocalDateKeyRef = useRef<LocalDateKey | null>(null);

  const settle = useCallback((trial: TimeTrial, assessmentDateInvalidated = false) => {
    activeRef.current = null;
    setTrials((current) => {
      const next = [...current, trial];
      const completion = getTimeCompletion(next);
      setPhase(assessmentDateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result');
      return next;
    });
  }, []);

  const startTrial = useCallback(() => {
    if (activeRef.current !== null) return;
    const currentLocalDateKey = toLocalDateKey(dateNow());
    if (assessmentStartedLocalDateKeyRef.current === null) {
      assessmentStartedLocalDateKeyRef.current = currentLocalDateKey;
    } else if (currentLocalDateKey !== assessmentStartedLocalDateKeyRef.current) {
      setPhase('dateInvalidated');
      return;
    }
    activeRef.current = {
      trialId: createTrialId(),
      startedAtMs: clock.now(),
      startedLocalDateKey: currentLocalDateKey,
    };
    setPhase('running');
  }, [clock, createTrialId, dateNow]);

  const completeTrial = useCallback(() => {
    const active = activeRef.current;
    if (active === null) return;
    // Clear synchronously so a second tap cannot create another completion.
    activeRef.current = null;
    const completedAtMs = clock.now();
    const currentLocalDateKey = toLocalDateKey(dateNow());
    if (currentLocalDateKey !== active.startedLocalDateKey || currentLocalDateKey !== assessmentStartedLocalDateKeyRef.current) {
      settle({
        kind: 'time', condition: 'baseline', targetDurationMs: TIME_TARGET_DURATION_MS,
        trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs,
        valid: false, invalidReason: 'dateChanged',
      }, true);
      return;
    }
    settle({
      kind: 'time', condition: 'baseline', targetDurationMs: TIME_TARGET_DURATION_MS,
      trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs,
      observedDurationMs: completedAtMs - active.startedAtMs,
      valid: true, invalidReason: null,
    });
  }, [clock, dateNow, settle]);

  const invalidateBackgrounded = useCallback(() => {
    const active = activeRef.current;
    if (active === null) return;
    activeRef.current = null;
    const assessmentDateInvalidated = toLocalDateKey(dateNow()) !== assessmentStartedLocalDateKeyRef.current;
    settle({
      kind: 'time', condition: 'baseline', targetDurationMs: TIME_TARGET_DURATION_MS,
      trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs: clock.now(),
      valid: false, invalidReason: assessmentDateInvalidated ? 'dateChanged' : 'backgrounded',
    }, assessmentDateInvalidated);
  }, [clock, dateNow, settle]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') invalidateBackgrounded();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [invalidateBackgrounded]);

  const resetAssessment = useCallback(() => {
    activeRef.current = null;
    assessmentStartedLocalDateKeyRef.current = null;
    setTrials([]);
    setPhase('ready');
  }, []);

  const getAssessmentStartedLocalDateKey = useCallback(() => assessmentStartedLocalDateKeyRef.current, []);

  return {
    phase,
    trials,
    lastTrial: trials.at(-1),
    validTrials: trials.filter((trial) => trial.valid),
    completion: getTimeCompletion(trials),
    getAssessmentStartedLocalDateKey,
    startTrial,
    completeTrial,
    retry: startTrial,
    resetAssessment,
  };
}
