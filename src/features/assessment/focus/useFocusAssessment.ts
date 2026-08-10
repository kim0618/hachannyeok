import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion, type CompletionStatus } from '../../../domain/assessment/completion';
import type { FocusTrial } from '../../../domain/assessment/trials';
import { validateTrial } from '../../../domain/assessment/validation';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import type { MeasurementClock } from '../time/useTimeTrial';
import { focusConfigForAttempt, type FocusBaselineConfig } from './focusConfig';

export interface FocusFrameScheduler { request(callback: FrameRequestCallback): number; cancel(id: number): void }
interface Options { clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; frameScheduler?: FocusFrameScheduler }
export type FocusPhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
interface PendingTrial { trialId: string; config: FocusBaselineConfig; generation: number }
interface ActiveTrial extends PendingTrial { startedAtMs: number }

const performanceClock: MeasurementClock = { now: () => performance.now() };
const browserFrameScheduler: FocusFrameScheduler = { request: (callback) => requestAnimationFrame(callback), cancel: (id) => cancelAnimationFrame(id) };
const defaultDateNow = () => new Date();
const createDefaultTrialId = () => crypto.randomUUID();
export const getFocusCompletion = (trials: FocusTrial[]): CompletionStatus => validateCompletion({ assessmentType: 'day1_focus_search', trials });

export function useFocusAssessment({ clock = performanceClock, dateNow = defaultDateNow, createTrialId = createDefaultTrialId, frameScheduler = browserFrameScheduler }: Options = {}) {
  const [trials, setTrials] = useState<FocusTrial[]>([]);
  const [phase, setPhase] = useState<FocusPhase>('ready');
  const [interactive, setInteractive] = useState(false);
  const [activeConfig, setActiveConfig] = useState(() => focusConfigForAttempt(0));
  const pendingRef = useRef<PendingTrial | null>(null);
  const activeRef = useRef<ActiveTrial | null>(null);
  const assessmentDateRef = useRef<LocalDateKey | null>(null);
  const frameIdsRef = useRef<number[]>([]);
  const generationRef = useRef(0);

  const cancelActivation = useCallback(() => {
    frameIdsRef.current.forEach((id) => frameScheduler.cancel(id));
    frameIdsRef.current = [];
  }, [frameScheduler]);

  const settle = useCallback((trial: FocusTrial, dateInvalidated = false) => {
    pendingRef.current = null;
    activeRef.current = null;
    setInteractive(false);
    cancelActivation();
    setTrials((current) => {
      const next = [...current, trial];
      const completion = getFocusCompletion(next);
      setPhase(dateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result');
      return next;
    });
  }, [cancelActivation]);

  const invalidateCurrent = useCallback((reason: 'backgrounded' | 'dateChanged') => {
    const active = activeRef.current;
    const current = active ?? pendingRef.current;
    if (current === null) return;
    pendingRef.current = null;
    activeRef.current = null;
    const completedAtMs = clock.now();
    const dateChanged = reason === 'dateChanged' || toLocalDateKey(dateNow()) !== assessmentDateRef.current;
    settle({ kind: 'focus', condition: 'visualSearch', stimulusId: current.config.stimulusId, correctTargetId: current.config.correctTargetId, trialId: current.trialId, startedAtMs: active?.startedAtMs ?? completedAtMs, completedAtMs, valid: false, invalidReason: dateChanged ? 'dateChanged' : reason }, dateChanged);
  }, [clock, dateNow, settle]);

  const startTrial = useCallback(() => {
    if (pendingRef.current !== null || activeRef.current !== null) return;
    const currentDate = toLocalDateKey(dateNow());
    if (assessmentDateRef.current === null) assessmentDateRef.current = currentDate;
    if (assessmentDateRef.current !== currentDate) { setPhase('dateInvalidated'); return; }
    const config = focusConfigForAttempt(trials.length);
    const generation = ++generationRef.current;
    const pending: PendingTrial = { trialId: createTrialId(), config, generation };
    pendingRef.current = pending;
    setActiveConfig(config);
    setInteractive(false);
    setPhase('running');
    cancelActivation();
    const first = frameScheduler.request(() => {
      if (pendingRef.current?.generation !== generation) return;
      const second = frameScheduler.request(() => {
        if (pendingRef.current?.generation !== generation) return;
        if (toLocalDateKey(dateNow()) !== assessmentDateRef.current) { invalidateCurrent('dateChanged'); return; }
        const startedAtMs = clock.now();
        activeRef.current = { ...pendingRef.current, startedAtMs };
        pendingRef.current = null;
        frameIdsRef.current = [];
        setInteractive(true);
      });
      frameIdsRef.current = [second];
    });
    frameIdsRef.current = [first];
  }, [cancelActivation, clock, createTrialId, dateNow, frameScheduler, invalidateCurrent, trials.length]);

  const selectItem = useCallback((selectedTargetId: string) => {
    const active = activeRef.current;
    if (active === null) return;
    activeRef.current = null;
    setInteractive(false);
    const completedAtMs = clock.now();
    if (toLocalDateKey(dateNow()) !== assessmentDateRef.current) {
      settle({ kind: 'focus', condition: 'visualSearch', stimulusId: active.config.stimulusId, correctTargetId: active.config.correctTargetId, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'dateChanged' }, true);
      return;
    }
    const correct = selectedTargetId === active.config.correctTargetId;
    const trial: FocusTrial = { kind: 'focus', condition: 'visualSearch', stimulusId: active.config.stimulusId, correctTargetId: active.config.correctTargetId, selectedTargetId, reactionTimeMs: completedAtMs - active.startedAtMs, correct, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: true, invalidReason: null };
    settle(validateTrial(trial).ok ? trial : { kind: 'focus', condition: 'visualSearch', stimulusId: active.config.stimulusId, correctTargetId: active.config.correctTargetId, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'timingUnavailable' });
  }, [clock, dateNow, settle]);

  useEffect(() => {
    const listener = () => { if (document.visibilityState === 'hidden') invalidateCurrent('backgrounded'); };
    document.addEventListener('visibilitychange', listener);
    return () => { document.removeEventListener('visibilitychange', listener); generationRef.current += 1; pendingRef.current = null; activeRef.current = null; cancelActivation(); };
  }, [cancelActivation, invalidateCurrent]);

  const resetAssessment = useCallback(() => {
    generationRef.current += 1; pendingRef.current = null; activeRef.current = null; cancelActivation(); assessmentDateRef.current = null;
    setTrials([]); setPhase('ready'); setInteractive(false); setActiveConfig(focusConfigForAttempt(0));
  }, [cancelActivation]);

  return { phase, trials, lastTrial: trials.at(-1), validTrials: trials.filter((trial): trial is Extract<FocusTrial, { valid: true }> => trial.valid), completion: getFocusCompletion(trials), interactive, activeConfig, startTrial, selectItem, resetAssessment };
}
