import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion, type CompletionStatus } from '../../../domain/assessment/completion';
import type { ControlTrial } from '../../../domain/assessment/trials';
import { validateTrial } from '../../../domain/assessment/validation';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import type { MeasurementClock } from '../time/useTimeTrial';
import { controlConfigForAttempt, hasReachedControlEnd, positionAtElapsed, type ControlBaselineConfig } from './controlMovement';

export interface AnimationScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(id: number): void;
}

interface Options { clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; animationScheduler?: AnimationScheduler }
export type ControlPhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
interface ActiveTrial { trialId: string; startedAtMs: number; config: ControlBaselineConfig }

const performanceClock: MeasurementClock = { now: () => performance.now() };
const browserAnimationScheduler: AnimationScheduler = { request: (callback) => requestAnimationFrame(callback), cancel: (id) => cancelAnimationFrame(id) };
const createDefaultTrialId = () => crypto.randomUUID();
const defaultDateNow = () => new Date();
export const getControlCompletion = (trials: ControlTrial[]): CompletionStatus => validateCompletion({ assessmentType: 'day1_control_constant', trials });

export function useControlAssessment({ clock = performanceClock, dateNow = defaultDateNow, createTrialId = createDefaultTrialId, animationScheduler = browserAnimationScheduler }: Options = {}) {
  const [trials, setTrials] = useState<ControlTrial[]>([]);
  const [phase, setPhase] = useState<ControlPhase>('ready');
  const [markerPosition, setMarkerPosition] = useState<number>(controlConfigForAttempt(0).startPosition);
  const [activeConfig, setActiveConfig] = useState<ControlBaselineConfig>(controlConfigForAttempt(0));
  const activeRef = useRef<ActiveTrial | null>(null);
  const assessmentDateRef = useRef<LocalDateKey | null>(null);
  const frameRef = useRef<number | null>(null);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) animationScheduler.cancel(frameRef.current);
    frameRef.current = null;
  }, [animationScheduler]);

  const settle = useCallback((trial: ControlTrial, dateInvalidated = false) => {
    activeRef.current = null;
    cancelFrame();
    setTrials((current) => {
      const next = [...current, trial];
      const completion = getControlCompletion(next);
      setPhase(dateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result');
      return next;
    });
  }, [cancelFrame]);

  const finalizeInvalid = useCallback((reason: 'backgrounded' | 'insufficientObservation') => {
    const active = activeRef.current;
    if (active === null) return;
    activeRef.current = null;
    const completedAtMs = clock.now();
    const dateInvalidated = toLocalDateKey(dateNow()) !== assessmentDateRef.current;
    settle({ kind: 'control', condition: 'constant', targetPosition: active.config.targetPosition, speedNormalized: active.config.speedNormalized, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: dateInvalidated ? 'dateChanged' : reason }, dateInvalidated);
  }, [clock, dateNow, settle]);

  const startTrial = useCallback(() => {
    if (activeRef.current !== null) return;
    const currentDate = toLocalDateKey(dateNow());
    if (assessmentDateRef.current === null) assessmentDateRef.current = currentDate;
    if (assessmentDateRef.current !== currentDate) { setPhase('dateInvalidated'); return; }
    const config = controlConfigForAttempt(trials.length);
    activeRef.current = { trialId: createTrialId(), startedAtMs: clock.now(), config };
    setActiveConfig(config);
    setMarkerPosition(config.startPosition);
    setPhase('running');
    cancelFrame();
    function tick() {
      const active = activeRef.current;
      if (active === null) return;
      const elapsedMs = clock.now() - active.startedAtMs;
      const position = positionAtElapsed(active.config, elapsedMs);
      if (hasReachedControlEnd(active.config, elapsedMs)) {
        setMarkerPosition(active.config.endPosition);
        finalizeInvalid('insufficientObservation');
        return;
      }
      setMarkerPosition(position);
      frameRef.current = animationScheduler.request(tick);
    }
    frameRef.current = animationScheduler.request(tick);
  }, [animationScheduler, cancelFrame, clock, createTrialId, dateNow, finalizeInvalid, trials.length]);

  const stopTrial = useCallback(() => {
    const active = activeRef.current;
    if (active === null) return;
    activeRef.current = null;
    const completedAtMs = clock.now();
    const dateInvalidated = toLocalDateKey(dateNow()) !== assessmentDateRef.current;
    if (dateInvalidated) {
      settle({ kind: 'control', condition: 'constant', targetPosition: active.config.targetPosition, speedNormalized: active.config.speedNormalized, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'dateChanged' }, true);
      return;
    }
    const elapsedMs = completedAtMs - active.startedAtMs;
    if (hasReachedControlEnd(active.config, elapsedMs)) {
      settle({ kind: 'control', condition: 'constant', targetPosition: active.config.targetPosition, speedNormalized: active.config.speedNormalized, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'insufficientObservation' });
      return;
    }
    const observedPosition = positionAtElapsed(active.config, elapsedMs);
    if (observedPosition < active.config.startPosition) {
      settle({ kind: 'control', condition: 'constant', targetPosition: active.config.targetPosition, speedNormalized: active.config.speedNormalized, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'insufficientObservation' });
      return;
    }
    const trial: ControlTrial = { kind: 'control', condition: 'constant', targetPosition: active.config.targetPosition, observedPosition, speedNormalized: active.config.speedNormalized, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: true, invalidReason: null };
    settle(validateTrial(trial).ok ? trial : { kind: 'control', condition: 'constant', targetPosition: active.config.targetPosition, speedNormalized: active.config.speedNormalized, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'outOfBounds' });
  }, [clock, dateNow, settle]);

  useEffect(() => {
    const listener = () => { if (document.visibilityState === 'hidden') finalizeInvalid('backgrounded'); };
    document.addEventListener('visibilitychange', listener);
    return () => { document.removeEventListener('visibilitychange', listener); cancelFrame(); activeRef.current = null; };
  }, [cancelFrame, finalizeInvalid]);

  const resetAssessment = useCallback(() => { activeRef.current = null; cancelFrame(); assessmentDateRef.current = null; setTrials([]); setPhase('ready'); const config = controlConfigForAttempt(0); setActiveConfig(config); setMarkerPosition(config.startPosition); }, [cancelFrame]);
  return { phase, trials, lastTrial: trials.at(-1), validTrials: trials.filter((trial): trial is Extract<ControlTrial, { valid: true }> => trial.valid), completion: getControlCompletion(trials), markerPosition, activeConfig, startTrial, stopTrial, resetAssessment };
}
