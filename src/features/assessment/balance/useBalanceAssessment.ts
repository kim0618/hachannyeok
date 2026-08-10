import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion, type CompletionStatus } from '../../../domain/assessment/completion';
import type { BalanceTwoWayTrial } from '../../../domain/assessment/trials';
import { validateTrial } from '../../../domain/assessment/validation';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import type { MeasurementClock } from '../time/useTimeTrial';
import { BALANCE_INITIAL_POSITIONS, BALANCE_ORIENTATIONS, BALANCE_TARGET_RATIO, type BalanceOrientation } from './balanceMeasurement';

export type BalancePhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
interface Options { clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string }
const performanceClock: MeasurementClock = { now: () => performance.now() };
const createDefaultTrialId = (): string => crypto.randomUUID();
export const getBalanceCompletion = (trials: BalanceTwoWayTrial[]): CompletionStatus => validateCompletion({ assessmentType: 'day1_balance_two_way', trials });

export function useBalanceAssessment({ clock = performanceClock, dateNow = () => new Date(), createTrialId = createDefaultTrialId }: Options = {}) {
  const [trials, setTrials] = useState<BalanceTwoWayTrial[]>([]);
  const [phase, setPhase] = useState<BalancePhase>('ready');
  const [orientation, setOrientation] = useState<BalanceOrientation>('vertical');
  const [dividerRatio, setDividerRatio] = useState(BALANCE_INITIAL_POSITIONS.vertical);
  const activeRef = useRef<{ trialId: string; orientation: BalanceOrientation; startedAtMs: number } | null>(null);
  const confirmingRef = useRef(false);
  const assessmentDateRef = useRef<LocalDateKey | null>(null);

  const settle = useCallback((trial: BalanceTwoWayTrial, dateInvalidated = false) => {
    activeRef.current = null;
    confirmingRef.current = false;
    setTrials((current) => {
      const next = [...current, trial];
      const completion = getBalanceCompletion(next);
      setPhase(dateInvalidated ? 'dateInvalidated' : completion.status === 'completed' ? 'complete' : completion.status === 'assessmentIncomplete' ? 'incomplete' : 'result');
      return next;
    });
  }, []);

  const startTrial = useCallback(() => {
    if (activeRef.current !== null) return;
    const currentDate = toLocalDateKey(dateNow());
    if (assessmentDateRef.current === null) assessmentDateRef.current = currentDate;
    if (assessmentDateRef.current !== currentDate) { setPhase('dateInvalidated'); return; }
    const nextOrientation = BALANCE_ORIENTATIONS[trials.length % BALANCE_ORIENTATIONS.length];
    activeRef.current = { trialId: createTrialId(), orientation: nextOrientation, startedAtMs: clock.now() };
    confirmingRef.current = false;
    setOrientation(nextOrientation);
    setDividerRatio(BALANCE_INITIAL_POSITIONS[nextOrientation]);
    setPhase('running');
  }, [clock, createTrialId, dateNow, trials.length]);

  const moveDivider = useCallback((ratio: number) => {
    if (activeRef.current === null || !Number.isFinite(ratio)) return;
    setDividerRatio(Math.min(1, Math.max(0, ratio)));
  }, []);

  const confirmTrial = useCallback(() => {
    const active = activeRef.current;
    if (active === null || confirmingRef.current) return;
    confirmingRef.current = true;
    activeRef.current = null;
    const completedAtMs = clock.now();
    if (toLocalDateKey(dateNow()) !== assessmentDateRef.current) {
      settle({ kind: 'balanceTwoWay', orientation: active.orientation, targetRatio: BALANCE_TARGET_RATIO, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'dateChanged' }, true);
      return;
    }
    const trial: BalanceTwoWayTrial = { kind: 'balanceTwoWay', orientation: active.orientation, targetRatio: BALANCE_TARGET_RATIO, observedRatio: dividerRatio, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: true, invalidReason: null };
    const validation = validateTrial(trial);
    settle(validation.ok ? trial : { kind: 'balanceTwoWay', orientation: active.orientation, targetRatio: BALANCE_TARGET_RATIO, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'outOfBounds' });
  }, [clock, dateNow, dividerRatio, settle]);

  const invalidateBackgrounded = useCallback(() => {
    const active = activeRef.current;
    if (active === null || confirmingRef.current) return;
    confirmingRef.current = true;
    activeRef.current = null;
    const dateInvalidated = toLocalDateKey(dateNow()) !== assessmentDateRef.current;
    settle({ kind: 'balanceTwoWay', orientation: active.orientation, targetRatio: BALANCE_TARGET_RATIO, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs: clock.now(), valid: false, invalidReason: dateInvalidated ? 'dateChanged' : 'backgrounded' }, dateInvalidated);
  }, [clock, dateNow, settle]);

  useEffect(() => {
    const listener = () => { if (document.visibilityState === 'hidden') invalidateBackgrounded(); };
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, [invalidateBackgrounded]);

  const resetAssessment = useCallback(() => { activeRef.current = null; confirmingRef.current = false; assessmentDateRef.current = null; setTrials([]); setOrientation('vertical'); setDividerRatio(BALANCE_INITIAL_POSITIONS.vertical); setPhase('ready'); }, []);
  return { phase, trials, lastTrial: trials.at(-1), validTrials: trials.filter((trial): trial is Extract<BalanceTwoWayTrial, { valid: true }> => trial.valid), completion: getBalanceCompletion(trials), orientation, dividerRatio, startTrial, moveDivider, confirmTrial, resetAssessment };
}
