import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion } from '../../../domain/assessment/completion';
import { DAY6_BLANK_DURATION_MS, DAY6_EXPOSURE_DURATION_MS, day6ConfigForAttempt } from '../../../domain/assessment/day6SpatialMemoryConfig';
import type { SpatialMemoryTrial } from '../../../domain/assessment/trials';
import type { Point } from '../../../domain/assessment/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import { normalizePointerPosition, type RectLike } from '../center/centerMeasurement';

export interface Day6TimerScheduler { set: (callback: () => void, delay: number) => number; clear: (id: number) => void }
const timers: Day6TimerScheduler = { set: (callback, delay) => window.setTimeout(callback, delay), clear: (id) => window.clearTimeout(id) };
const defaultDateNow = () => new Date();
const defaultClock = { now: () => performance.now() };
const defaultTrialId = () => crypto.randomUUID();
export type Day6Phase = 'ready' | 'exposure' | 'blank' | 'recall' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
interface Options { sessionDateKey: LocalDateKey; dateNow?: () => Date; clock?: { now: () => number }; scheduler?: Day6TimerScheduler; createTrialId?: () => string }
interface ActiveTrial { trialId: string; startedAtMs: number; shownPositions: Point[]; recallStartedAtMs: number | null; selected: Point[] }

export function useDay6SpatialMemoryAssessment({ sessionDateKey, dateNow = defaultDateNow, clock = defaultClock, scheduler = timers, createTrialId = defaultTrialId }: Options) {
  const [phase, setPhaseState] = useState<Day6Phase>('ready');
  const [trials, setTrials] = useState<SpatialMemoryTrial[]>([]);
  const [shownPositions, setShownPositions] = useState<Point[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Point[]>([]);
  const phaseRef = useRef<Day6Phase>('ready');
  const active = useRef<ActiveTrial | null>(null);
  const timer = useRef<number | null>(null);
  const generation = useRef(0);
  const setPhase = (next: Day6Phase) => { phaseRef.current = next; setPhaseState(next); };
  const clearTimer = useCallback(() => { generation.current += 1; if (timer.current !== null) scheduler.clear(timer.current); timer.current = null; }, [scheduler]);
  const settle = useCallback((trial: SpatialMemoryTrial, dateInvalid = false) => { clearTimer(); active.current = null; setTrials((current) => [...current, trial]); setPhase(dateInvalid ? 'dateInvalidated' : 'result'); }, [clearTimer]);
  const invalidate = useCallback((reason: 'backgrounded' | 'outOfBounds') => {
    const current = active.current; if (!current) return;
    const changed = toLocalDateKey(dateNow()) !== sessionDateKey, completedAtMs = clock.now();
    const responseTime = current.recallStartedAtMs === null ? {} : { responseTimeMs: completedAtMs - current.recallStartedAtMs };
    settle({ kind: 'spatialMemory', shownPositions: current.shownPositions, selectedPositions: current.selected, exposureDurationMs: DAY6_EXPOSURE_DURATION_MS, ...responseTime, trialId: current.trialId, startedAtMs: current.startedAtMs, completedAtMs, valid: false, invalidReason: changed ? 'dateChanged' : reason }, changed);
  }, [clock, dateNow, sessionDateKey, settle]);
  const schedule = useCallback((callback: () => void, delay: number, expectedGeneration: number) => { timer.current = scheduler.set(() => { if (expectedGeneration !== generation.current || !active.current) return; callback(); }, delay); }, [scheduler]);
  const startTrial = useCallback(() => {
    if (active.current) return;
    if (toLocalDateKey(dateNow()) !== sessionDateKey) { setPhase('dateInvalidated'); return; }
    clearTimer();
    const shown = day6ConfigForAttempt(trials.length).map((point) => ({ ...point }));
    active.current = { trialId: createTrialId(), startedAtMs: clock.now(), shownPositions: shown, recallStartedAtMs: null, selected: [] };
    setShownPositions(shown); setSelectedPositions([]); setPhase('exposure');
    const expectedGeneration = ++generation.current;
    schedule(() => { if (toLocalDateKey(dateNow()) !== sessionDateKey) { invalidate('backgrounded'); return; } setPhase('blank'); schedule(() => { if (toLocalDateKey(dateNow()) !== sessionDateKey) { invalidate('backgrounded'); return; } if (!active.current) return; active.current.recallStartedAtMs = clock.now(); setPhase('recall'); }, DAY6_BLANK_DURATION_MS, expectedGeneration); }, DAY6_EXPOSURE_DURATION_MS, expectedGeneration);
  }, [clearTimer, clock, createTrialId, dateNow, invalidate, schedule, sessionDateKey, trials.length]);
  const selectPosition = useCallback((pointer: { clientX: number; clientY: number }, rect: RectLike) => {
    if (phaseRef.current !== 'recall' || !active.current) return;
    const normalized = normalizePointerPosition(pointer, rect); if (!normalized.ok) { invalidate('outOfBounds'); return; }
    if (active.current.selected.length >= 3) return;
    active.current.selected = [...active.current.selected, normalized.point]; setSelectedPositions(active.current.selected);
    if (active.current.selected.length === 3) { const current = active.current, completedAtMs = clock.now(), changed = toLocalDateKey(dateNow()) !== sessionDateKey; settle({ kind: 'spatialMemory', shownPositions: current.shownPositions, selectedPositions: current.selected, exposureDurationMs: DAY6_EXPOSURE_DURATION_MS, responseTimeMs: completedAtMs - (current.recallStartedAtMs ?? completedAtMs), trialId: current.trialId, startedAtMs: current.startedAtMs, completedAtMs, valid: !changed, invalidReason: changed ? 'dateChanged' : null } as SpatialMemoryTrial, changed); }
  }, [clock, dateNow, invalidate, sessionDateKey, settle]);
  const advanceFromResult = useCallback(() => { if (phaseRef.current !== 'result') return; const status = validateCompletion({ assessmentType: 'day6_spatial_memory', trials }).status; if (status === 'completed') { setPhase('complete'); return; } if (status === 'assessmentIncomplete' || status === 'invalidAssessment') { setPhase('incomplete'); return; } startTrial(); }, [startTrial, trials]);
  useEffect(() => { const listener = () => { if (document.visibilityState === 'hidden' && ['exposure', 'blank', 'recall'].includes(phaseRef.current)) invalidate('backgrounded'); }; document.addEventListener('visibilitychange', listener); return () => { document.removeEventListener('visibilitychange', listener); clearTimer(); active.current = null; }; }, [clearTimer, invalidate]);
  return { phase, trials, lastTrial: trials.at(-1), completion: validateCompletion({ assessmentType: 'day6_spatial_memory', trials }), shownPositions, selectedPositions, startTrial, selectPosition, advanceFromResult };
}
