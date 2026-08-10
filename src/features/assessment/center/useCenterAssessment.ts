import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion, type CompletionStatus } from '../../../domain/assessment/completion';
import type { CenterTrial, ShapeId } from '../../../domain/assessment/trials';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import type { MeasurementClock } from '../time/useTimeTrial';
import { CENTER_SHAPES, CENTER_TARGET, normalizePointerPosition, type RectLike } from './centerMeasurement';

export type CenterPhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
interface Options { clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string }
const performanceClock: MeasurementClock = { now: () => performance.now() };
const createDefaultTrialId = (): string => crypto.randomUUID();
export const getCenterCompletion = (trials: CenterTrial[]): CompletionStatus => validateCompletion({ assessmentType: 'day1_center', trials });

export function useCenterAssessment({ clock = performanceClock, dateNow = () => new Date(), createTrialId = createDefaultTrialId }: Options = {}) {
  const [trials, setTrials] = useState<CenterTrial[]>([]);
  const [phase, setPhase] = useState<CenterPhase>('ready');
  const [activeShape, setActiveShape] = useState<ShapeId | null>(null);
  const activeRef = useRef<{ trialId: string; shapeId: ShapeId; startedAtMs: number } | null>(null);
  const assessmentDateRef = useRef<LocalDateKey | null>(null);

  const settle = useCallback((trial: CenterTrial, dateInvalidated = false) => {
    activeRef.current = null;
    setActiveShape(null);
    setTrials((current) => {
      const next = [...current, trial];
      const completion = getCenterCompletion(next);
      setPhase(dateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result');
      return next;
    });
  }, []);

  const startTrial = useCallback(() => {
    if (activeRef.current !== null) return;
    const currentDate = toLocalDateKey(dateNow());
    if (assessmentDateRef.current === null) assessmentDateRef.current = currentDate;
    if (assessmentDateRef.current !== currentDate) { setPhase('dateInvalidated'); return; }
    const shapeId = CENTER_SHAPES[trials.length % CENTER_SHAPES.length];
    activeRef.current = { trialId: createTrialId(), shapeId, startedAtMs: clock.now() };
    setActiveShape(shapeId);
    setPhase('running');
  }, [clock, createTrialId, dateNow, trials.length]);

  const selectPosition = useCallback((pointer: { clientX: number; clientY: number }, rect: RectLike) => {
    const active = activeRef.current;
    if (active === null) return;
    activeRef.current = null;
    const completedAtMs = clock.now();
    if (toLocalDateKey(dateNow()) !== assessmentDateRef.current) {
      settle({ kind: 'center', condition: 'plain', target: CENTER_TARGET, shapeId: active.shapeId, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'dateChanged' }, true);
      return;
    }
    const normalized = normalizePointerPosition(pointer, rect);
    settle(normalized.ok
      ? { kind: 'center', condition: 'plain', target: CENTER_TARGET, observed: normalized.point, shapeId: active.shapeId, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: true, invalidReason: null }
      : { kind: 'center', condition: 'plain', target: CENTER_TARGET, shapeId: active.shapeId, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: normalized.reason });
  }, [clock, dateNow, settle]);

  const invalidateBackgrounded = useCallback(() => {
    const active = activeRef.current;
    if (active === null) return;
    activeRef.current = null;
    const dateInvalidated = toLocalDateKey(dateNow()) !== assessmentDateRef.current;
    settle({ kind: 'center', condition: 'plain', target: CENTER_TARGET, shapeId: active.shapeId, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs: clock.now(), valid: false, invalidReason: dateInvalidated ? 'dateChanged' : 'backgrounded' }, dateInvalidated);
  }, [clock, dateNow, settle]);

  useEffect(() => {
    const listener = () => { if (document.visibilityState === 'hidden') invalidateBackgrounded(); };
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, [invalidateBackgrounded]);

  const resetAssessment = useCallback(() => { activeRef.current = null; assessmentDateRef.current = null; setActiveShape(null); setTrials([]); setPhase('ready'); }, []);
  return { phase, trials, lastTrial: trials.at(-1), activeShape, validTrials: trials.filter((trial) => trial.valid), completion: getCenterCompletion(trials), startTrial, selectPosition, resetAssessment };
}
