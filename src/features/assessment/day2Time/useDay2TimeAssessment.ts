import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion } from '../../../domain/assessment/completion';
import type { TimeConditionTrial } from '../../../domain/assessment/trials';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import { conditionForAttempt, DAY2_TIME_TARGET_DURATION_MS } from './day2TimeConfig';

export interface Day2MeasurementClock { now(): number }
export type Day2TimePhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';

const performanceClock: Day2MeasurementClock = { now: () => performance.now() };
const defaultTrialId = () => crypto.randomUUID();

interface Options {
  clock?: Day2MeasurementClock;
  dateNow?: () => Date;
  createTrialId?: () => string;
  sessionDateKey: LocalDateKey;
}

export function useDay2TimeAssessment({ clock = performanceClock, dateNow = () => new Date(), createTrialId = defaultTrialId, sessionDateKey }: Options) {
  const [trials, setTrials] = useState<TimeConditionTrial[]>([]);
  const [phase, setPhase] = useState<Day2TimePhase>('ready');
  const activeRef = useRef<{ trialId: string; startedAtMs: number; condition: 'plain' | 'distracted' } | null>(null);

  const settle = useCallback((trial: TimeConditionTrial, dateInvalidated = false) => {
    activeRef.current = null;
    setTrials((current) => {
      const next = [...current, trial];
      const completion = validateCompletion({ assessmentType: 'day2_time_distraction', trials: next });
      setPhase(dateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result');
      return next;
    });
  }, []);

  const startTrial = useCallback(() => {
    if (activeRef.current) return;
    if (toLocalDateKey(dateNow()) !== sessionDateKey) { setPhase('dateInvalidated'); return; }
    activeRef.current = { trialId: createTrialId(), startedAtMs: clock.now(), condition: conditionForAttempt(trials.length) };
    setPhase('running');
  }, [clock, createTrialId, dateNow, sessionDateKey, trials.length]);

  const completeTrial = useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    activeRef.current = null;
    const completedAtMs = clock.now();
    if (toLocalDateKey(dateNow()) !== sessionDateKey) {
      settle({ kind: 'timeCondition', condition: active.condition, targetDurationMs: DAY2_TIME_TARGET_DURATION_MS, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'dateChanged' }, true);
      return;
    }
    settle({ kind: 'timeCondition', condition: active.condition, targetDurationMs: DAY2_TIME_TARGET_DURATION_MS, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, observedDurationMs: completedAtMs - active.startedAtMs, valid: true, invalidReason: null });
  }, [clock, dateNow, sessionDateKey, settle]);

  const invalidateBackgrounded = useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    activeRef.current = null;
    const dateChanged = toLocalDateKey(dateNow()) !== sessionDateKey;
    settle({ kind: 'timeCondition', condition: active.condition, targetDurationMs: DAY2_TIME_TARGET_DURATION_MS, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs: clock.now(), valid: false, invalidReason: dateChanged ? 'dateChanged' : 'backgrounded' }, dateChanged);
  }, [clock, dateNow, sessionDateKey, settle]);

  useEffect(() => {
    const listener = () => { if (document.visibilityState === 'hidden') invalidateBackgrounded(); };
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, [invalidateBackgrounded]);

  return {
    phase, trials, lastTrial: trials.at(-1),
    validTrials: trials.filter((trial) => trial.valid),
    completion: validateCompletion({ assessmentType: 'day2_time_distraction', trials }),
    currentCondition: conditionForAttempt(trials.length),
    startTrial, completeTrial, retry: startTrial,
  };
}
