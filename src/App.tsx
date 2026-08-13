import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AssessmentIntroScreen } from './screens/AssessmentIntroScreen';
import { AssessmentReadyScreen } from './screens/AssessmentReadyScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TimeAssessmentScreen } from './features/assessment/time/TimeAssessmentScreen';
import { CenterAssessmentScreen } from './features/assessment/center/CenterAssessmentScreen';
import { BalanceAssessmentScreen } from './features/assessment/balance/BalanceAssessmentScreen';
import { ControlAssessmentScreen } from './features/assessment/control/ControlAssessmentScreen';
import { FocusAssessmentScreen } from './features/assessment/focus/FocusAssessmentScreen';
import { BasicAnalysisScreen } from './features/analysis/BasicAnalysisScreen';
import { Day2AnalysisScreen } from './features/analysis/Day2AnalysisScreen';
import { Day2IntroScreen } from './features/assessment/day2Time/Day2IntroScreen';
import { Day2TimeAssessmentScreen } from './features/assessment/day2Time/Day2TimeAssessmentScreen';
import type { Day1RawResult, DailyRawResult } from './domain/assessment/results';
import { validateCompletion } from './domain/assessment/completion';
import { deriveUserState } from './domain/progression/deriveUserState';
import { toLocalDateKey } from './domain/progression/localDate';
import type { LocalDateKey, UserState } from './domain/progression/types';
import { addBaselineResult, buildBaselineRecord, type BaselineDraft } from './domain/session/baselineDraft';
import { shouldDiscardBaselineCheckpoint } from './domain/session/types';
import type { StoragePort } from './domain/storage/StoragePort';
import { prepareBaselineSave } from './domain/storage/persistBaseline';
import { validatePersistedAppData } from './domain/storage/schema';
import type { BaselineRecord, PersistedAppData } from './domain/storage/types';
import type { DailyRecord } from './domain/storage/types';
import { prepareDailySave } from './domain/storage/persistDaily';
import { deriveAnalysis } from './domain/scoring/deriveAnalysis';
import type { DerivedAnalysis, DeriveAnalysisResult } from './domain/scoring/types';
import { appsInTossStorage } from './infrastructure/storage/AppsInTossStorageAdapter';
import { StorageMutationCoordinator } from './infrastructure/storage/StorageMutationCoordinator';
import './styles.css';

export type AppScreen = 'home' | 'intro' | 'assessment-ready' | 'time-assessment' | 'center-assessment' | 'balance-assessment' | 'control-assessment' | 'focus-assessment' | 'basic-analysis' | 'baseline-date-invalidated' | 'day2-intro' | 'day2-assessment' | 'day2-result' | 'day3-placeholder';
interface BaselineSessionIdentity { sessionId: string; startedAt: string; startedLocalDateKey: LocalDateKey }
interface DailySessionIdentity { sessionId: string; startedAt: string; localDateKey: LocalDateKey }
interface AppProps { initialScreen?: AppScreen; dateNow?: () => Date; createSessionId?: () => string; initialBaselineDraft?: BaselineDraft; initialSession?: BaselineSessionIdentity; initialPersistedData?: PersistedAppData; storagePort?: StoragePort; bypassInitialLoad?: boolean }
type LoadState = 'loading' | 'loaded' | 'loadError' | 'corruptData' | 'checkpointDiscardFailed';
type SaveStatus = 'saving' | 'saved' | 'failed';
interface PendingCheckpoint { data: PersistedAppData; next: AppScreen }
const emptyData = (now: string): PersistedAppData => ({ schemaVersion: 1, dailyRecords: [], metadata: { firstStartedAt: now } });
const defaultDateNow = () => new Date();
const defaultCreateSessionId = () => crypto.randomUUID();

export function App({ initialScreen = 'home', dateNow = defaultDateNow, createSessionId = defaultCreateSessionId, initialBaselineDraft = {}, initialSession, initialPersistedData, storagePort = appsInTossStorage, bypassInitialLoad = import.meta.env.MODE === 'test' }: AppProps = {}) {
  const [loadState, setLoadState] = useState<LoadState>(bypassInitialLoad ? 'loaded' : 'loading');
  const [screen, setScreen] = useState<AppScreen>(initialScreen);
  const [persisted, setPersisted] = useState<PersistedAppData>(() => initialPersistedData ?? emptyData(dateNow().toISOString()));
  const [baselineDraft, setBaselineDraft] = useState<BaselineDraft>(initialBaselineDraft);
  const [baseline, setBaseline] = useState<BaselineRecord | undefined>(initialPersistedData?.baseline);
  const [analysis, setAnalysis] = useState<DeriveAnalysisResult | undefined>(() => initialPersistedData?.baseline ? deriveAnalysis(initialPersistedData) : undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [pendingSave, setPendingSave] = useState<PersistedAppData>();
  const [session, setSession] = useState<BaselineSessionIdentity | null>(initialSession ?? null);
  const [pendingCheckpoint, setPendingCheckpoint] = useState<PendingCheckpoint>();
  const [checkpointStatus, setCheckpointStatus] = useState<'saving' | 'failed'>();
  const [conflictingBaseline, setConflictingBaseline] = useState<BaselineRecord>();
  const [recordConflictActive, setRecordConflictActive] = useState(false);
  const [dailySession, setDailySession] = useState<DailySessionIdentity | null>(null);
  const [dailyResult, setDailyResult] = useState<{ record: DailyRecord; before: DerivedAnalysis; after: DerivedAnalysis }>();
  const coordinator = useMemo(() => new StorageMutationCoordinator(), []);
  const mountedRef = useRef(true);
  const mutationRevisionRef = useRef(0);
  const saveInFlightRef = useRef(false);
  const checkpointInFlightRef = useRef(false);
  const persistenceEnabled = !(bypassInitialLoad && storagePort === appsInTossStorage);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; mutationRevisionRef.current += 1; };
  }, []);

  const applyLoadedData = useCallback(async (loaded: PersistedAppData | null) => {
    let data = loaded ?? emptyData(dateNow().toISOString());
    const checkpoint = data.activeBaselineSession;
    if (checkpoint && shouldDiscardBaselineCheckpoint(checkpoint, toLocalDateKey(dateNow()))) {
      const sanitized = validatePersistedAppData({ ...data, activeBaselineSession: null });
      if (!sanitized.ok) { if (mountedRef.current) setLoadState('corruptData'); return; }
      const revision = ++mutationRevisionRef.current;
      const result = await coordinator.enqueue(() => storagePort.save(sanitized.data));
      if (!mountedRef.current || revision !== mutationRevisionRef.current) return;
      if (!result.ok) { setLoadState('checkpointDiscardFailed'); return; }
      data = sanitized.data;
    }
    if (!mountedRef.current) return;
    setPersisted(data);
    setBaseline(data.baseline);
    setAnalysis(data.baseline ? deriveAnalysis(data) : undefined);
    setSession(null);
    setBaselineDraft({});
    setScreen('home');
    if (data.activeBaselineSession && !data.baseline) {
      const activeCheckpoint = data.activeBaselineSession;
      setSession({ sessionId: activeCheckpoint.sessionId, startedAt: activeCheckpoint.startedAt, startedLocalDateKey: activeCheckpoint.startedLocalDateKey });
      setBaselineDraft(activeCheckpoint.partialRawResults.reduce<BaselineDraft>(addBaselineResult, {}));
      const resumeScreens: AppScreen[] = ['time-assessment', 'center-assessment', 'balance-assessment', 'control-assessment', 'focus-assessment'];
      setScreen(resumeScreens[activeCheckpoint.partialRawResults.length] ?? 'time-assessment');
    }
    setLoadState('loaded');
  }, [coordinator, dateNow, storagePort]);

  const loadAndApply = useCallback(async () => {
    const result = await storagePort.load();
    if (!mountedRef.current) return;
    if (!result.ok) { setLoadState(result.error === 'readFailed' ? 'loadError' : 'corruptData'); return; }
    await applyLoadedData(result.data);
  }, [applyLoadedData, storagePort]);

  useEffect(() => {
    if (bypassInitialLoad) return;
    void Promise.resolve().then(loadAndApply);
  }, [bypassInitialLoad, loadAndApply]);

  const beginBaseline = () => {
    const started = dateNow();
    setSession({ sessionId: createSessionId(), startedAt: started.toISOString(), startedLocalDateKey: toLocalDateKey(started) });
    setBaselineDraft({}); setBaseline(undefined); setAnalysis(undefined); setScreen('time-assessment');
  };
  const restart = () => { setSession(null); setBaselineDraft({}); setBaseline(undefined); setAnalysis(undefined); setScreen('intro'); };
  const invalidateBaselineForDateChange = () => { setSession(null); setBaselineDraft({}); setBaseline(undefined); setAnalysis(undefined); setScreen('baseline-date-invalidated'); };
  const isCurrentBaselineDate = () => session === null || session.startedLocalDateKey === toLocalDateKey(dateNow());

  const writeCheckpoint = useCallback(async (pending: PendingCheckpoint) => {
    if (checkpointInFlightRef.current) return;
    checkpointInFlightRef.current = true;
    setCheckpointStatus('saving');
    const revision = ++mutationRevisionRef.current;
    const result = await coordinator.enqueue(() => storagePort.save(pending.data));
    checkpointInFlightRef.current = false;
    if (!mountedRef.current || revision !== mutationRevisionRef.current) return;
    if (!result.ok) { setCheckpointStatus('failed'); return; }
    setPersisted(pending.data);
    setPendingCheckpoint(undefined);
    setCheckpointStatus(undefined);
    setScreen(pending.next);
  }, [coordinator, storagePort]);

  const saveCheckpoint = (draft: BaselineDraft, next: AppScreen) => {
    if (!session) {
      if (!persistenceEnabled) { setScreen(next); return true; }
      return false;
    }
    const partialRawResults = Object.values(draft);
    const candidate: PersistedAppData = { ...persisted, activeBaselineSession: { ...session, completedAssessmentIds: partialRawResults.map((item) => item.assessmentType), partialRawResults } };
    const validated = validatePersistedAppData(candidate);
    if (!validated.ok) return false;
    const pending = { data: validated.data, next };
    setPendingCheckpoint(pending);
    if (persistenceEnabled) void writeCheckpoint(pending);
    else { setPersisted(pending.data); setScreen(next); setPendingCheckpoint(undefined); }
    return true;
  };
  const preserveAndMove = (result: Day1RawResult, next: AppScreen) => {
    if (!isCurrentBaselineDate()) { invalidateBaselineForDateChange(); return; }
    if (validateCompletion(result).status !== 'completed') { setScreen('basic-analysis'); return; }
    const nextDraft = addBaselineResult(baselineDraft, result);
    setBaselineDraft(nextDraft);
    if (!saveCheckpoint(nextDraft, next)) setScreen('basic-analysis');
  };

  const writePending = useCallback(async (data: PersistedAppData) => {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    setSaveStatus('saving');
    const revision = ++mutationRevisionRef.current;
    const result = await coordinator.enqueue(() => storagePort.save(data));
    saveInFlightRef.current = false;
    if (!mountedRef.current || revision !== mutationRevisionRef.current) return;
    if (result.ok) { setPersisted(data); setPendingSave(undefined); setSaveStatus('saved'); }
    else setSaveStatus('failed');
  }, [coordinator, storagePort]);

  const finishBaseline = (focus: Extract<Day1RawResult, { assessmentType: 'day1_focus_search' }>) => {
    const completed = dateNow();
    const completedLocalDateKey = toLocalDateKey(completed);
    if (session && session.startedLocalDateKey !== completedLocalDateKey) { invalidateBaselineForDateChange(); return; }
    if (!session || validateCompletion(focus).status !== 'completed') { setBaseline(undefined); setAnalysis(undefined); setScreen('basic-analysis'); return; }
    const completedDraft = addBaselineResult(baselineDraft, focus);
    setBaselineDraft(completedDraft);
    const built = buildBaselineRecord(completedDraft, { recordId: `${session.sessionId}:baseline`, sessionId: session.sessionId, startedAt: session.startedAt, completedAt: completed.toISOString(), startedLocalDateKey: session.startedLocalDateKey, completedLocalDateKey });
    if (!built.ok) { setBaseline(undefined); setAnalysis(undefined); setScreen('basic-analysis'); return; }
    const prepared = prepareBaselineSave(persisted, built.record, completed.toISOString());
    if (!prepared.ok) {
      if (prepared.error === 'recordConflict') {
        setBaseline(built.record);
        setAnalysis(deriveAnalysis({ ...persisted, baseline: built.record, activeBaselineSession: null }));
        setConflictingBaseline(built.record);
        setRecordConflictActive(true);
        setScreen('basic-analysis');
      } else { setBaseline(undefined); setAnalysis(undefined); setScreen('basic-analysis'); }
      return;
    }
    setBaseline(built.record); setAnalysis(deriveAnalysis(prepared.data)); setPendingSave(prepared.data); setScreen('basic-analysis');
    void writePending(prepared.data);
  };

  const beginDay2 = () => {
    const started = dateNow();
    setDailySession({ sessionId: createSessionId(), startedAt: started.toISOString(), localDateKey: toLocalDateKey(started) });
    setScreen('day2-assessment');
  };

  const restartDay2 = () => { setDailySession(null); setScreen('day2-intro'); };

  const finishDay2 = (rawResult: Extract<DailyRawResult, { assessmentType: 'day2_time_distraction' }>) => {
    const completed = dateNow();
    const localDateKey = toLocalDateKey(completed);
    if (!dailySession || dailySession.localDateKey !== localDateKey || validateCompletion(rawResult).status !== 'completed' || !analysis?.ok || persisted.dailyRecords.length !== 0) { restartDay2(); return; }
    const record: DailyRecord = { recordId: `${dailySession.sessionId}:day2`, sessionId: dailySession.sessionId, analysisDay: 2, assessmentType: 'day2_time_distraction', startedAt: dailySession.startedAt, completedAt: completed.toISOString(), localDateKey, rawResult };
    const prepared = prepareDailySave(persisted, record, completed.toISOString());
    if (!prepared.ok) { restartDay2(); return; }
    const nextAnalysis = deriveAnalysis(prepared.data);
    if (!nextAnalysis.ok) { restartDay2(); return; }
    setDailyResult({ record, before: analysis.value, after: nextAnalysis.value });
    setAnalysis(nextAnalysis); setPendingSave(prepared.data); setSaveStatus('saving'); setScreen('day2-result');
    void writePending(prepared.data);
  };

  const clearAll = async () => {
    saveInFlightRef.current = false;
    checkpointInFlightRef.current = false;
    const revision = ++mutationRevisionRef.current;
    const result = await coordinator.enqueue(() => storagePort.clear());
    if (!mountedRef.current || revision !== mutationRevisionRef.current) return false;
    if (!result.ok) return false;
    const next = emptyData(dateNow().toISOString());
    setPersisted(next); setBaseline(undefined); setAnalysis(undefined); setBaselineDraft({}); setSession(null); setDailySession(null); setDailyResult(undefined); setPendingSave(undefined); setPendingCheckpoint(undefined); setCheckpointStatus(undefined); setConflictingBaseline(undefined); setRecordConflictActive(false); setSaveStatus('saved'); setScreen('home'); setLoadState('loaded');
    return true;
  };

  if (loadState === 'loading') return <AppShell><StatusScreen title="저장 데이터 확인 중..." /></AppShell>;
  if (loadState === 'loadError') return <AppShell><LoadErrorScreen onRetry={() => { setLoadState('loading'); void loadAndApply(); }} /></AppShell>;
  if (loadState === 'checkpointDiscardFailed') return <AppShell><CheckpointDiscardErrorScreen onRetry={() => { setLoadState('loading'); void loadAndApply(); }} /></AppShell>;
  if (loadState === 'corruptData') return <AppShell><CorruptDataScreen onClear={clearAll} /></AppShell>;
  if (pendingCheckpoint) return <AppShell><CheckpointSaveScreen status={checkpointStatus ?? 'saving'} onRetry={() => { void writeCheckpoint(pendingCheckpoint); }} /></AppShell>;
  if (recordConflictActive && conflictingBaseline) return <AppShell><RecordConflictScreen onViewExisting={() => { if (persisted.baseline) { setBaseline(persisted.baseline); setAnalysis(deriveAnalysis(persisted)); setRecordConflictActive(false); setScreen('basic-analysis'); } }} onClear={clearAll} /></AppShell>;
  const userState = deriveUserState(persisted, toLocalDateKey(dateNow()));

  return <AppShell>
    {screen === 'home' && userState === 'A' && <HomeScreen onStart={() => setScreen('intro')} />}
    {screen === 'home' && userState !== 'A' && <ReturningHome state={userState} dailyCount={persisted.dailyRecords.length} onDaily={() => setScreen(persisted.dailyRecords.length === 0 ? 'day2-intro' : 'day3-placeholder')} onAnalysis={() => setScreen('basic-analysis')} onClear={clearAll} />}
    {screen === 'intro' && <AssessmentIntroScreen onBack={() => setScreen('home')} onStart={() => setScreen('assessment-ready')} />}
    {screen === 'assessment-ready' && <AssessmentReadyScreen onStart={beginBaseline} />}
    {screen === 'time-assessment' && <TimeAssessmentScreen dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'center-assessment')} />}
    {screen === 'center-assessment' && <CenterAssessmentScreen dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'balance-assessment')} />}
    {screen === 'balance-assessment' && <BalanceAssessmentScreen dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'control-assessment')} />}
    {screen === 'control-assessment' && <ControlAssessmentScreen dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'focus-assessment')} />}
    {screen === 'focus-assessment' && <FocusAssessmentScreen dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={finishBaseline} />}
    {screen === 'basic-analysis' && <BasicAnalysisScreen baseline={baseline} analysis={analysis} dailyCount={persisted.dailyRecords.length} saveStatus={saveStatus} onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined} onRestart={restart} onHome={pendingSave ? undefined : () => setScreen('home')} />}
    {screen === 'baseline-date-invalidated' && <BaselineDateInvalidatedScreen onRestart={restart} />}
    {screen === 'day2-intro' && <Day2IntroScreen onStart={beginDay2} />}
    {screen === 'day2-assessment' && dailySession && <Day2TimeAssessmentScreen sessionDateKey={dailySession.localDateKey} dateNow={dateNow} onDateInvalidated={restartDay2} onComplete={finishDay2} />}
    {screen === 'day2-result' && dailyResult && <Day2AnalysisScreen {...dailyResult} saveStatus={saveStatus} onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined} onHome={pendingSave ? undefined : () => setScreen('home')} onAnalysis={pendingSave ? undefined : () => setScreen('basic-analysis')} />}
    {screen === 'day3-placeholder' && <NextDailyPlaceholder onHome={() => setScreen('home')} />}
  </AppShell>;
}

function StatusScreen({ title }: { title: string }) { return <div className="screen analysis-error"><section role="status"><h1>{title}</h1></section></div>; }
function LoadErrorScreen({ onRetry }: { onRetry: () => void }) { return <div className="screen analysis-error"><section role="alert"><h1>저장된 기록을 확인하지 못했습니다.</h1><p>잠시 후 다시 시도해 주세요.</p></section><div className="bottom-action"><button className="primary-button" onClick={onRetry}>다시 불러오기</button></div></div>; }
function CheckpointDiscardErrorScreen({ onRetry }: { onRetry: () => void }) { return <div className="screen analysis-error"><section role="alert"><h1>이전 측정 기록을 정리하지 못했습니다.</h1><p>기록이 안전하게 정리될 때까지 다시 시작하지 않습니다.</p></section><div className="bottom-action"><button className="primary-button" onClick={onRetry}>다시 시도</button></div></div>; }
function CheckpointSaveScreen({ status, onRetry }: { status: 'saving' | 'failed'; onRetry: () => void }) { return <div className="screen analysis-error"><section role={status === 'failed' ? 'alert' : 'status'}><h1>{status === 'failed' ? '진행 기록을 저장하지 못했습니다.' : '진행 기록을 저장하고 있습니다.'}</h1><p>완료한 측정 결과를 그대로 유지하고 있습니다.</p></section>{status === 'failed' && <div className="bottom-action"><button className="primary-button" onClick={onRetry}>다시 저장</button></div>}</div>; }
function CorruptDataScreen({ onClear }: { onClear: () => Promise<boolean> }) {
  const [confirm, setConfirm] = useState(false); const [failed, setFailed] = useState(false);
  return <div className="screen analysis-error"><section role="alert"><h1>저장된 분석 기록을 불러오지 못했습니다.</h1><p>손상된 기록은 자동으로 삭제하지 않습니다.</p>{failed && <p>기록을 초기화하지 못했습니다.</p>}</section><div className="bottom-action">{confirm ? <><p>기록을 모두 지울까요? 삭제 후 복구할 수 없습니다.</p><button className="primary-button" onClick={() => void onClear().then((ok) => setFailed(!ok))}>기록 초기화</button><button className="secondary-button" onClick={() => setConfirm(false)}>취소</button></> : <button className="primary-button" onClick={() => setConfirm(true)}>기록 초기화</button>}</div></div>;
}
function ReturningHome({ state, dailyCount, onDaily, onAnalysis, onClear }: { state: UserState; dailyCount: number; onDaily: () => void; onAnalysis: () => void; onClear: () => Promise<boolean> }) {
  const [confirm, setConfirm] = useState(false); const [clearFailed, setClearFailed] = useState(false); const dailyReady = state === 'C'; const dailyDone = state === 'D' && dailyCount > 0;
  return <div className="screen home-screen"><main><p className="eyebrow">하찮력</p><h1>{dailyReady ? '오늘의 추가 분석이 준비됐습니다.' : dailyDone ? '오늘의 추가 분석 완료' : '기본 분석이 완료됐습니다.'}</h1><p>{dailyReady ? '오늘은 한 가지 조건을 더 확인할 수 있어요.' : dailyDone ? '다음 추가 분석은 다른 날 이어서 할 수 있어요.' : '오늘 완료한 기본 분석서를 다시 볼 수 있어요.'}</p><button className="primary-button" type="button" onClick={dailyReady ? onDaily : onAnalysis}>{dailyReady ? '오늘의 추가 분석' : dailyDone ? '업데이트된 분석서 보기' : '기본 분석서 보기'}</button>{dailyReady && <button className="secondary-button" type="button" onClick={onAnalysis}>내 분석서 보기</button>}<p className="storage-copy">분석 결과는 현재 기기에 저장됩니다.</p>{clearFailed && <p role="alert">기록을 초기화하지 못했습니다.</p>}{confirm ? <div><p>기록을 모두 지울까요? 앱 데이터가 삭제되면 복구할 수 없습니다.</p><button className="secondary-button" onClick={() => void onClear().then((ok) => setClearFailed(!ok))}>기록 모두 지우기</button><button className="secondary-button" onClick={() => setConfirm(false)}>취소</button></div> : <button className="secondary-button" onClick={() => setConfirm(true)}>전체 데이터 초기화</button>}</main></div>;
}
function RecordConflictScreen({ onViewExisting, onClear }: { onViewExisting: () => void; onClear: () => Promise<boolean> }) {
  const [confirm, setConfirm] = useState(false); const [failed, setFailed] = useState(false);
  return <div className="screen analysis-error"><section role="alert"><h1>저장된 기록과 현재 측정 기록이 충돌했습니다.</h1><p>기존 기록을 자동으로 덮어쓰지 않았습니다.</p>{failed && <p>기록을 초기화하지 못했습니다.</p>}</section><div className="bottom-action"><button className="primary-button" onClick={onViewExisting}>기존 기록 보기</button>{confirm ? <><p>기록을 모두 지울까요? 삭제 후 복구할 수 없습니다.</p><button className="secondary-button" onClick={() => void onClear().then((ok) => setFailed(!ok))}>기록 초기화</button><button className="secondary-button" onClick={() => setConfirm(false)}>취소</button></> : <button className="secondary-button" onClick={() => setConfirm(true)}>기록 초기화</button>}</div></div>;
}
function BaselineDateInvalidatedScreen({ onRestart }: { onRestart: () => void }) { return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">측정 다시 시작</p><h1>날짜가 변경되어 측정을 다시 시작해야 합니다.</h1><p>한 번의 기본 검사는 같은 날짜의 기록으로만 분석합니다.</p></section><div className="bottom-action"><button className="primary-button" type="button" onClick={onRestart}>처음부터 다시 측정</button></div></div>; }
function NextDailyPlaceholder({ onHome }: { onHome: () => void }) { return <div className="screen placeholder-screen"><section><p className="eyebrow">추가 분석 준비</p><h1>다음 추가 분석은<br />다음 단계에서 연결됩니다.</h1><p>DAY 2 기록과 기본 분석은 그대로 유지됩니다.</p><button className="secondary-button" onClick={onHome}>홈으로</button></section></div>; }
