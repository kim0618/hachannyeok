import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompletion } from '../../../domain/assessment/completion';
import type { BalanceThreeWayTrial } from '../../../domain/assessment/trials';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import type { Day2MeasurementClock } from '../day2Time/useDay2TimeAssessment';
import { day4ConfigForAttempt } from './day4BalanceConfig';
import { moveDay4Cut } from './day4BalanceMeasurement';

export type Day4BalancePhase = 'ready' | 'running' | 'result' | 'complete' | 'incomplete' | 'dateInvalidated';
const performanceClock: Day2MeasurementClock = { now: () => performance.now() };
const defaultTrialId = () => crypto.randomUUID();
interface Options { sessionDateKey: LocalDateKey; clock?: Day2MeasurementClock; dateNow?: () => Date; createTrialId?: () => string }

export function useDay4BalanceAssessment({ sessionDateKey, clock = performanceClock, dateNow = () => new Date(), createTrialId = defaultTrialId }: Options) {
  const [trials, setTrials] = useState<BalanceThreeWayTrial[]>([]);
  const [phase, setPhase] = useState<Day4BalancePhase>('ready');
  const [cuts, setCuts] = useState<[number, number]>([.28, .72]);
  const activeRef = useRef<{ trialId: string; startedAtMs: number } | null>(null);
  const confirmGuard = useRef(false);
  const settle = useCallback((trial: BalanceThreeWayTrial, dateInvalidated = false) => {
    activeRef.current = null;
    setTrials((current) => { const next = [...current, trial]; const status = validateCompletion({ assessmentType: 'day4_balance_three_way', trials: next }).status; setPhase(dateInvalidated ? 'dateInvalidated' : status === 'completed' ? 'complete' : status === 'assessmentIncomplete' ? 'incomplete' : 'result'); return next; });
  }, []);
  const startTrial = useCallback(() => {
    if (activeRef.current) return;
    if (toLocalDateKey(dateNow()) !== sessionDateKey) { setPhase('dateInvalidated'); return; }
    const config = day4ConfigForAttempt(trials.length);
    setCuts([config.cut1, config.cut2]); confirmGuard.current = false;
    activeRef.current = { trialId: createTrialId(), startedAtMs: clock.now() }; setPhase('running');
  }, [clock, createTrialId, dateNow, sessionDateKey, trials.length]);
  const moveCut = useCallback((divider: 0 | 1, ratio: number) => setCuts((current) => moveDay4Cut(current, divider, ratio) ?? current), []);
  const confirm = useCallback(() => {
    const active = activeRef.current; if (!active || confirmGuard.current) return;
    confirmGuard.current = true;
    const completedAtMs = clock.now();
    if (toLocalDateKey(dateNow()) !== sessionDateKey) { settle({ kind: 'balanceThreeWay', trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: false, invalidReason: 'dateChanged' }, true); return; }
    settle({ kind: 'balanceThreeWay', cutPositions: cuts, trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs, valid: true, invalidReason: null });
  }, [clock, cuts, dateNow, sessionDateKey, settle]);
  const invalidateBackgrounded = useCallback(() => {
    const active = activeRef.current; if (!active || confirmGuard.current) return;
    confirmGuard.current = true; const dateChanged = toLocalDateKey(dateNow()) !== sessionDateKey;
    settle({ kind: 'balanceThreeWay', trialId: active.trialId, startedAtMs: active.startedAtMs, completedAtMs: clock.now(), valid: false, invalidReason: dateChanged ? 'dateChanged' : 'backgrounded' }, dateChanged);
  }, [clock, dateNow, sessionDateKey, settle]);
  useEffect(() => { const listener = () => { if (document.visibilityState === 'hidden') invalidateBackgrounded(); }; document.addEventListener('visibilitychange', listener); return () => document.removeEventListener('visibilitychange', listener); }, [invalidateBackgrounded]);
  return { phase, trials, lastTrial: trials.at(-1), cuts, completion: validateCompletion({ assessmentType: 'day4_balance_three_way', trials }), startTrial, moveCut, confirm };
}
