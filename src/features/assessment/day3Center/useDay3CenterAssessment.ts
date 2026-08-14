import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion } from '../../../domain/assessment/completion';
import type { CenterConditionTrial } from '../../../domain/assessment/trials';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import { CENTER_TARGET, normalizePointerPosition, type RectLike } from '../center/centerMeasurement';
import type { Day2MeasurementClock } from '../day2Time/useDay2TimeAssessment';
import { stimulusForAttempt, type Day3CenterStimulus } from './day3CenterConfig';

export type Day3CenterPhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
const performanceClock: Day2MeasurementClock = { now: () => performance.now() };
const defaultTrialId = () => crypto.randomUUID();
interface Options { sessionDateKey: LocalDateKey; clock?: Day2MeasurementClock; dateNow?: () => Date; createTrialId?: () => string }

export function useDay3CenterAssessment({ sessionDateKey, clock = performanceClock, dateNow = () => new Date(), createTrialId = defaultTrialId }: Options) {
  const [trials, setTrials] = useState<CenterConditionTrial[]>([]);
  const [phase, setPhase] = useState<Day3CenterPhase>('ready');
  const [activeStimulus, setActiveStimulus] = useState<Day3CenterStimulus | null>(null);
  const activeRef = useRef<{ trialId: string; startedAtMs: number; stimulus: Day3CenterStimulus } | null>(null);
  const settle = useCallback((trial: CenterConditionTrial, dateInvalidated = false) => {
    activeRef.current = null; setActiveStimulus(null);
    setTrials((current) => { const next = [...current, trial]; const completion = validateCompletion({ assessmentType: 'day3_decorated_center', trials: next }); setPhase(dateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result'); return next; });
  }, []);
  const startTrial = useCallback(() => {
    if (activeRef.current) return;
    if (toLocalDateKey(dateNow()) !== sessionDateKey) { setPhase('dateInvalidated'); return; }
    const stimulus = stimulusForAttempt(trials.length);
    activeRef.current = { trialId: createTrialId(), startedAtMs: clock.now(), stimulus };
    setActiveStimulus(stimulus); setPhase('running');
  }, [clock, createTrialId, dateNow, sessionDateKey, trials.length]);
  const selectPosition = useCallback((pointer: { clientX: number; clientY: number }, rect: RectLike) => {
    const active = activeRef.current; if (!active) return; activeRef.current = null;
    const completedAtMs = clock.now(); const base = { kind: 'centerCondition' as const, condition: active.stimulus.condition, stimulusId: active.stimulus.stimulusId, decorationSide: active.stimulus.decorationSide, target: CENTER_TARGET, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs };
    if (toLocalDateKey(dateNow()) !== sessionDateKey) { settle({ ...base, valid: false, invalidReason: 'dateChanged' }, true); return; }
    const normalized = normalizePointerPosition(pointer, rect);
    settle(normalized.ok ? { ...base, observed: normalized.point, valid: true, invalidReason: null } : { ...base, valid: false, invalidReason: normalized.reason });
  }, [clock, dateNow, sessionDateKey, settle]);
  const invalidateBackgrounded = useCallback(() => {
    const active = activeRef.current; if (!active) return; activeRef.current = null;
    const dateChanged = toLocalDateKey(dateNow()) !== sessionDateKey;
    settle({ kind: 'centerCondition', condition: active.stimulus.condition, stimulusId: active.stimulus.stimulusId, decorationSide: active.stimulus.decorationSide, target: CENTER_TARGET, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs: clock.now(), valid: false, invalidReason: dateChanged ? 'dateChanged' : 'backgrounded' }, dateChanged);
  }, [clock, dateNow, sessionDateKey, settle]);
  useEffect(() => { const listener = () => { if (document.visibilityState === 'hidden') invalidateBackgrounded(); }; document.addEventListener('visibilitychange', listener); return () => document.removeEventListener('visibilitychange', listener); }, [invalidateBackgrounded]);
  const completion = validateCompletion({ assessmentType: 'day3_decorated_center', trials });
  return { phase, trials, lastTrial: trials.at(-1), activeStimulus, completion, startTrial, selectPosition };
}
