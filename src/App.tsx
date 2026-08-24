import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AssessmentIntroScreen } from './screens/AssessmentIntroScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TimeAssessmentScreen } from './features/assessment/time/TimeAssessmentScreen';
import { CenterAssessmentScreen } from './features/assessment/center/CenterAssessmentScreen';
import { BalanceAssessmentScreen } from './features/assessment/balance/BalanceAssessmentScreen';
import { ControlAssessmentScreen } from './features/assessment/control/ControlAssessmentScreen';
import { FocusAssessmentScreen } from './features/assessment/focus/FocusAssessmentScreen';
import { BasicAnalysisScreen } from './features/analysis/BasicAnalysisScreen';
import { Day2AnalysisScreen } from './features/analysis/Day2AnalysisScreen';
import { Day2TimeAssessmentScreen } from './features/assessment/day2Time/Day2TimeAssessmentScreen';
import { Day3IntroScreen } from './features/assessment/day3Center/Day3IntroScreen';
import { Day3CenterAssessmentScreen } from './features/assessment/day3Center/Day3CenterAssessmentScreen';
import { Day3AnalysisScreen } from './features/analysis/Day3AnalysisScreen';
import { Day4IntroScreen } from './features/assessment/day4Balance/Day4IntroScreen';
import { Day4BalanceAssessmentScreen } from './features/assessment/day4Balance/Day4BalanceAssessmentScreen';
import { Day4AnalysisScreen } from './features/analysis/Day4AnalysisScreen';
import { Day5IntroScreen } from './features/assessment/day5Control/Day5IntroScreen';
import { Day5ControlAssessmentScreen } from './features/assessment/day5Control/Day5ControlAssessmentScreen';
import { Day5AnalysisScreen } from './features/analysis/Day5AnalysisScreen';
import { Day6IntroScreen } from './features/assessment/day6SpatialMemory/Day6IntroScreen';
import { Day6SpatialMemoryAssessmentScreen } from './features/assessment/day6SpatialMemory/Day6SpatialMemoryAssessmentScreen';
import type { Day6TimerScheduler } from './features/assessment/day6SpatialMemory/useDay6SpatialMemoryAssessment';
import { Day6AnalysisScreen } from './features/analysis/Day6AnalysisScreen';
import { FinalCalibrationScreen } from './features/assessment/final/FinalCalibrationScreen';
import { FinalCalibrationSeal } from './features/assessment/final/FinalCalibrationPresentation';
import { FINAL_ABILITY_LABELS } from './features/assessment/final/finalAbilityLabels';
import { FinalAnalysisScreen } from './features/analysis/FinalAnalysisScreen';
import type { Day1RawResult, DailyRawResult, FinalRawResult } from './domain/assessment/results';
import { validateCompletion } from './domain/assessment/completion';
import { deriveUserState } from './domain/progression/deriveUserState';
import { toLocalDateKey } from './domain/progression/localDate';
import type { LocalDateKey, UserState } from './domain/progression/types';
import { addBaselineResult, buildBaselineRecord, type BaselineDraft } from './domain/session/baselineDraft';
import { shouldDiscardBaselineCheckpoint } from './domain/session/types';
import type { StoragePort } from './domain/storage/StoragePort';
import { prepareBaselineSave } from './domain/storage/persistBaseline';
import { validatePersistedAppData } from './domain/storage/schema';
import type { BaselineRecord, FinalRecord, PersistedAppData } from './domain/storage/types';
import type { DailyRecord } from './domain/storage/types';
import { prepareDailySave } from './domain/storage/persistDaily';
import { prepareFinalSave } from './domain/storage/persistFinal';
import { deriveAnalysis } from './domain/scoring/deriveAnalysis';
import { day7Confidence, selectDay7Target } from './domain/scoring/finalSelector';
import { calculateStability } from './domain/scoring/stability';
import type { Ability } from './domain/scoring/types';
import type { DerivedAnalysis, DeriveAnalysisResult } from './domain/scoring/types';
import { appsInTossStorage } from './infrastructure/storage/AppsInTossStorageAdapter';
import { StorageMutationCoordinator } from './infrastructure/storage/StorageMutationCoordinator';
import type { SharePort } from './infrastructure/share/SharePort';
import { appsInTossShare } from './infrastructure/share/appsInTossShare';
import './styles.css';

export type AppScreen = 'home' | 'intro' | 'time-assessment' | 'center-assessment' | 'balance-assessment' | 'control-assessment' | 'focus-assessment' | 'basic-analysis' | 'baseline-date-invalidated' | 'day2-intro' | 'day2-assessment' | 'day2-result' | 'day3-intro' | 'day3-assessment' | 'day3-result' | 'day4-intro' | 'day4-assessment' | 'day4-result' | 'day5-intro' | 'day5-assessment' | 'day5-result' | 'day6-intro' | 'day6-assessment' | 'day6-result' | 'day7-intro' | 'day7-assessment' | 'final-report';
interface BaselineSessionIdentity { sessionId: string; startedAt: string; startedLocalDateKey: LocalDateKey }
interface DailySessionIdentity { sessionId: string; startedAt: string; localDateKey: LocalDateKey }
interface AppProps { initialScreen?: AppScreen; dateNow?: () => Date; createSessionId?: () => string; initialBaselineDraft?: BaselineDraft; initialSession?: BaselineSessionIdentity; initialPersistedData?: PersistedAppData; storagePort?: StoragePort; sharePort?: SharePort; bypassInitialLoad?: boolean; day5Clock?: { now: () => number }; day5AnimationScheduler?: { request: (callback: FrameRequestCallback) => number; cancel: (id: number) => void }; day6Clock?: {now:()=>number}; day6TimerScheduler?:Day6TimerScheduler }
type LoadState = 'loading' | 'loaded' | 'loadError' | 'corruptData' | 'checkpointDiscardFailed';
type SaveStatus = 'saving' | 'saved' | 'failed';
interface PendingCheckpoint { data: PersistedAppData; next: AppScreen }
const emptyData = (now: string): PersistedAppData => ({ schemaVersion: 1, dailyRecords: [], metadata: { firstStartedAt: now } });
const defaultDateNow = () => new Date();
const defaultCreateSessionId = () => crypto.randomUUID();

export function App({ initialScreen = 'home', dateNow = defaultDateNow, createSessionId = defaultCreateSessionId, initialBaselineDraft = {}, initialSession, initialPersistedData, storagePort = appsInTossStorage, sharePort = appsInTossShare, bypassInitialLoad = import.meta.env.MODE === 'test', day5Clock, day5AnimationScheduler,day6Clock,day6TimerScheduler }: AppProps = {}) {
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
  const [finalSession, setFinalSession] = useState<DailySessionIdentity | null>(null);
  const [selectedFinalAbility, setSelectedFinalAbility] = useState<Ability | null>(() => initialPersistedData?.finalRecord?.selectedAbility ?? null);
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
    setFinalSession(null);
    setSelectedFinalAbility(data.finalRecord?.selectedAbility ?? null);
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
    setScreen('day2-intro');
  };

  const restartDay2 = () => { const started = dateNow(); setDailySession({ sessionId: createSessionId(), startedAt: started.toISOString(), localDateKey: toLocalDateKey(started) }); setScreen('day2-intro'); };
  const beginDay3 = () => { const started = dateNow(); setDailySession({ sessionId: createSessionId(), startedAt: started.toISOString(), localDateKey: toLocalDateKey(started) }); setScreen('day3-assessment'); };
  const restartDay3 = () => { setDailySession(null); setScreen('day3-intro'); };
  const beginDay4 = () => { const started = dateNow(); setDailySession({ sessionId: createSessionId(), startedAt: started.toISOString(), localDateKey: toLocalDateKey(started) }); setScreen('day4-assessment'); };
  const restartDay4 = () => { setDailySession(null); setScreen('day4-intro'); };
  const beginDay5 = () => { const started=dateNow(); setDailySession({sessionId:createSessionId(),startedAt:started.toISOString(),localDateKey:toLocalDateKey(started)}); setScreen('day5-assessment'); };
  const restartDay5 = () => { setDailySession(null); setScreen('day5-intro'); };
  const beginDay6=()=>{const started=dateNow();setDailySession({sessionId:createSessionId(),startedAt:started.toISOString(),localDateKey:toLocalDateKey(started)});setScreen('day6-assessment');};
  const restartDay6=()=>{setDailySession(null);setScreen('day6-intro');};
  const beginDay7=()=>{if(!baseline||persisted.dailyRecords.length!==5)return;const started=dateNow();const dailyRaw=persisted.dailyRecords.map(record=>record.rawResult);const selected=selectDay7Target(day7Confidence(baseline.assessmentRawResults,dailyRaw,calculateStability(baseline.assessmentRawResults,dailyRaw)));setSelectedFinalAbility(selected);setFinalSession({sessionId:createSessionId(),startedAt:started.toISOString(),localDateKey:toLocalDateKey(started)});setScreen('day7-assessment');};
  const restartDay7=()=>{setFinalSession(null);setSelectedFinalAbility(null);setScreen('day7-intro');};

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
  const finishDay3 = (rawResult: Extract<DailyRawResult, { assessmentType: 'day3_decorated_center' }>) => {
    const completed = dateNow(); const localDateKey = toLocalDateKey(completed);
    if (!dailySession || dailySession.localDateKey !== localDateKey || validateCompletion(rawResult).status !== 'completed' || !analysis?.ok || persisted.dailyRecords.length !== 1 || persisted.dailyRecords[0]?.analysisDay !== 2) { restartDay3(); return; }
    const record: DailyRecord = { recordId: `${dailySession.sessionId}:day3`, sessionId: dailySession.sessionId, analysisDay: 3, assessmentType: 'day3_decorated_center', startedAt: dailySession.startedAt, completedAt: completed.toISOString(), localDateKey, rawResult };
    const prepared = prepareDailySave(persisted, record, completed.toISOString()); if (!prepared.ok) { restartDay3(); return; }
    const nextAnalysis = deriveAnalysis(prepared.data); if (!nextAnalysis.ok) { restartDay3(); return; }
    setDailyResult({ record, before: analysis.value, after: nextAnalysis.value }); setAnalysis(nextAnalysis); setPendingSave(prepared.data); setSaveStatus('saving'); setScreen('day3-result'); void writePending(prepared.data);
  };
  const finishDay4 = (rawResult: Extract<DailyRawResult, { assessmentType: 'day4_balance_three_way' }>) => {
    const completed = dateNow(); const localDateKey = toLocalDateKey(completed);
    if (!dailySession || dailySession.localDateKey !== localDateKey || validateCompletion(rawResult).status !== 'completed' || !analysis?.ok || persisted.dailyRecords.length !== 2 || persisted.dailyRecords[0]?.analysisDay !== 2 || persisted.dailyRecords[1]?.analysisDay !== 3) { restartDay4(); return; }
    const record: DailyRecord = { recordId: `${dailySession.sessionId}:day4`, sessionId: dailySession.sessionId, analysisDay: 4, assessmentType: 'day4_balance_three_way', startedAt: dailySession.startedAt, completedAt: completed.toISOString(), localDateKey, rawResult };
    const prepared = prepareDailySave(persisted, record, completed.toISOString()); if (!prepared.ok) { restartDay4(); return; }
    const nextAnalysis = deriveAnalysis(prepared.data); if (!nextAnalysis.ok) { restartDay4(); return; }
    setDailyResult({ record, before: analysis.value, after: nextAnalysis.value }); setAnalysis(nextAnalysis); setPendingSave(prepared.data); setSaveStatus('saving'); setScreen('day4-result'); void writePending(prepared.data);
  };
  const finishDay5 = (rawResult: Extract<DailyRawResult,{assessmentType:'day5_control_surprise'}>) => { const completed=dateNow(),localDateKey=toLocalDateKey(completed); if(!dailySession||dailySession.localDateKey!==localDateKey||validateCompletion(rawResult).status!=='completed'||!analysis?.ok||persisted.dailyRecords.length!==3||persisted.dailyRecords.some((r,index)=>r.analysisDay!==index+2)){restartDay5();return;}const record:DailyRecord={recordId:`${dailySession.sessionId}:day5`,sessionId:dailySession.sessionId,analysisDay:5,assessmentType:'day5_control_surprise',startedAt:dailySession.startedAt,completedAt:completed.toISOString(),localDateKey,rawResult};const prepared=prepareDailySave(persisted,record,completed.toISOString());if(!prepared.ok){restartDay5();return;}const next=deriveAnalysis(prepared.data);if(!next.ok){restartDay5();return;}setDailyResult({record,before:analysis.value,after:next.value});setAnalysis(next);setPendingSave(prepared.data);setSaveStatus('saving');setScreen('day5-result');void writePending(prepared.data); };
  const finishDay6=(rawResult:Extract<DailyRawResult,{assessmentType:'day6_spatial_memory'}>)=>{const completed=dateNow(),localDateKey=toLocalDateKey(completed);if(!dailySession||dailySession.localDateKey!==localDateKey||validateCompletion(rawResult).status!=='completed'||!analysis?.ok||persisted.dailyRecords.length!==4||persisted.dailyRecords.some((record,index)=>record.analysisDay!==index+2)){restartDay6();return;}const record:DailyRecord={recordId:`${dailySession.sessionId}:day6`,sessionId:dailySession.sessionId,analysisDay:6,assessmentType:'day6_spatial_memory',startedAt:dailySession.startedAt,completedAt:completed.toISOString(),localDateKey,rawResult};const prepared=prepareDailySave(persisted,record,completed.toISOString());if(!prepared.ok){restartDay6();return;}const next=deriveAnalysis(prepared.data);if(!next.ok){restartDay6();return;}setDailyResult({record,before:analysis.value,after:next.value});setAnalysis(next);setPendingSave(prepared.data);setSaveStatus('saving');setScreen('day6-result');void writePending(prepared.data);};
  const finishDay7=(rawResult:FinalRawResult)=>{const completed=dateNow(),localDateKey=toLocalDateKey(completed);if(!finalSession||!selectedFinalAbility||finalSession.localDateKey!==localDateKey||rawResult.selectedAbility!==selectedFinalAbility||validateCompletion(rawResult).status!=='completed'||persisted.dailyRecords.length!==5){restartDay7();return;}const record:FinalRecord={recordId:`${finalSession.sessionId}:final`,sessionId:finalSession.sessionId,selectedAbility:selectedFinalAbility,assessmentType:rawResult.assessmentType,startedAt:finalSession.startedAt,completedAt:completed.toISOString(),localDateKey,rawResult};const prepared=prepareFinalSave(persisted,record,completed.toISOString());if(!prepared.ok){if(prepared.error==='finalAlreadyCompleted'&&persisted.finalRecord){setAnalysis(deriveAnalysis(persisted));setScreen('final-report');}else restartDay7();return;}const next=deriveAnalysis(prepared.data);if(!next.ok){restartDay7();return;}setAnalysis(next);setPendingSave(prepared.data);setSaveStatus('saving');setScreen('final-report');void writePending(prepared.data);};

  const clearAll = async () => {
    saveInFlightRef.current = false;
    checkpointInFlightRef.current = false;
    const revision = ++mutationRevisionRef.current;
    const result = await coordinator.enqueue(() => storagePort.clear());
    if (!mountedRef.current || revision !== mutationRevisionRef.current) return false;
    if (!result.ok) return false;
    const next = emptyData(dateNow().toISOString());
    setPersisted(next); setBaseline(undefined); setAnalysis(undefined); setBaselineDraft({}); setSession(null); setDailySession(null); setFinalSession(null); setSelectedFinalAbility(null); setDailyResult(undefined); setPendingSave(undefined); setPendingCheckpoint(undefined); setCheckpointStatus(undefined); setConflictingBaseline(undefined); setRecordConflictActive(false); setSaveStatus('saved'); setScreen('home'); setLoadState('loaded');
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
    {screen === 'home' && userState !== 'A' && <ReturningHome state={userState} dailyCount={persisted.dailyRecords.length} onDaily={persisted.dailyRecords.length === 0 ? beginDay2 : () => setScreen(persisted.dailyRecords.length === 1 ? 'day3-intro' : persisted.dailyRecords.length === 2 ? 'day4-intro' : persisted.dailyRecords.length === 3 ? 'day5-intro' : persisted.dailyRecords.length===4?'day6-intro':'day7-intro')} onAnalysis={() => setScreen(userState==='F'?'final-report':'basic-analysis')} onClear={clearAll} />}
    {screen === 'intro' && <AssessmentIntroScreen onBack={() => setScreen('home')} onStart={beginBaseline} />}
    {screen === 'time-assessment' && <TimeAssessmentScreen dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'center-assessment')} />}
    {screen === 'center-assessment' && <CenterAssessmentScreen variationSessionId={session?.sessionId} dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'balance-assessment')} />}
    {screen === 'balance-assessment' && <BalanceAssessmentScreen variationSessionId={session?.sessionId} dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'control-assessment')} />}
    {screen === 'control-assessment' && <ControlAssessmentScreen variationSessionId={session?.sessionId} dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={(result) => preserveAndMove(result, 'focus-assessment')} />}
    {screen === 'focus-assessment' && <FocusAssessmentScreen variationSessionId={session?.sessionId} dateNow={dateNow} baselineSessionDateKey={session?.startedLocalDateKey} onDateInvalidated={invalidateBaselineForDateChange} onComplete={finishBaseline} />}
    {screen === 'basic-analysis' && <BasicAnalysisScreen baseline={baseline} analysis={analysis} dailyCount={persisted.dailyRecords.length} saveStatus={saveStatus} onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined} onRestart={restart} onHome={pendingSave ? undefined : () => setScreen('home')} sharePort={sharePort} />}
    {screen === 'baseline-date-invalidated' && <BaselineDateInvalidatedScreen onRestart={restart} />}
    {screen === 'day2-intro' && dailySession && <Day2TimeAssessmentScreen sessionDateKey={dailySession.localDateKey} dateNow={dateNow} onDateInvalidated={restartDay2} onComplete={finishDay2} />}
    {screen === 'day2-assessment' && dailySession && <Day2TimeAssessmentScreen sessionDateKey={dailySession.localDateKey} dateNow={dateNow} onDateInvalidated={restartDay2} onComplete={finishDay2} />}
    {screen === 'day2-result' && dailyResult && <Day2AnalysisScreen {...dailyResult} saveStatus={saveStatus} onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined} onHome={pendingSave ? undefined : () => setScreen('home')} onAnalysis={pendingSave ? undefined : () => setScreen('basic-analysis')} />}
    {screen === 'day3-intro' && <Day3IntroScreen onStart={beginDay3} />}
    {screen === 'day3-assessment' && dailySession && <Day3CenterAssessmentScreen variationSessionId={dailySession.sessionId} sessionDateKey={dailySession.localDateKey} dateNow={dateNow} onDateInvalidated={restartDay3} onComplete={finishDay3} />}
    {screen === 'day3-result' && dailyResult && baseline && <Day3AnalysisScreen baseline={baseline} {...dailyResult} saveStatus={saveStatus} onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined} onHome={pendingSave ? undefined : () => setScreen('home')} onAnalysis={pendingSave ? undefined : () => setScreen('basic-analysis')} />}
    {screen === 'day4-intro' && <Day4IntroScreen onStart={beginDay4} />}
    {screen === 'day4-assessment' && dailySession && <Day4BalanceAssessmentScreen variationSessionId={dailySession.sessionId} sessionDateKey={dailySession.localDateKey} dateNow={dateNow} onDateInvalidated={restartDay4} onComplete={finishDay4} />}
    {screen === 'day4-result' && dailyResult && baseline && <Day4AnalysisScreen baseline={baseline} {...dailyResult} saveStatus={saveStatus} onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined} onHome={pendingSave ? undefined : () => setScreen('home')} onAnalysis={pendingSave ? undefined : () => setScreen('basic-analysis')} />}
    {screen === 'day5-intro' && <Day5IntroScreen onStart={beginDay5} />}
    {screen === 'day5-assessment' && dailySession && <Day5ControlAssessmentScreen variationSessionId={dailySession.sessionId} sessionDateKey={dailySession.localDateKey} dateNow={dateNow} clock={day5Clock} animationScheduler={day5AnimationScheduler} onDateInvalidated={restartDay5} onComplete={finishDay5} />}
    {screen === 'day5-result' && dailyResult && <Day5AnalysisScreen {...dailyResult} saveStatus={saveStatus} onRetrySave={pendingSave?()=>{void writePending(pendingSave);}:undefined} onHome={pendingSave?undefined:()=>setScreen('home')} onAnalysis={pendingSave?undefined:()=>setScreen('basic-analysis')} />}
    {screen==='day6-intro'&&<Day6IntroScreen onStart={beginDay6}/>}
    {screen==='day6-assessment'&&dailySession&&<Day6SpatialMemoryAssessmentScreen variationSessionId={dailySession.sessionId} sessionDateKey={dailySession.localDateKey} dateNow={dateNow} clock={day6Clock} scheduler={day6TimerScheduler} onDateInvalidated={restartDay6} onComplete={finishDay6}/>}
    {screen==='day6-result'&&dailyResult&&<Day6AnalysisScreen {...dailyResult} saveStatus={saveStatus} onRetrySave={pendingSave?()=>{void writePending(pendingSave);}:undefined} onHome={pendingSave?undefined:()=>setScreen('home')} onAnalysis={pendingSave?undefined:()=>setScreen('basic-analysis')}/>}
    {screen === 'day7-intro' && <Day7IntroScreen selectedAbility={selectedFinalAbility} onStart={beginDay7} />}
    {screen === 'day7-assessment' && finalSession && selectedFinalAbility && <FinalCalibrationScreen
      ability={selectedFinalAbility} variationSessionId={finalSession.sessionId} sessionDateKey={finalSession.localDateKey} dateNow={dateNow}
      onComplete={finishDay7} onRestart={restartDay7}
    />}
    {screen === 'final-report' && <FinalAnalysisScreen
      baseline={baseline} dailyRecords={(pendingSave ?? persisted).dailyRecords}
      finalRecord={(pendingSave ?? persisted).finalRecord} analysis={analysis} saveStatus={saveStatus}
      onRetrySave={pendingSave ? () => { void writePending(pendingSave); } : undefined}
      onHome={pendingSave ? undefined : () => setScreen('home')}
      sharePort={sharePort}
    />}
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
  const [confirm, setConfirm] = useState(false); const [clearFailed, setClearFailed] = useState(false); const dailyReady = state === 'C'; const finalReady=state==='E';const finalDone=state==='F';const dailyDone = state === 'D' && dailyCount > 0;
  const completedDay = finalDone ? 7 : Math.min(6, dailyCount + 1);
  const nextDay = Math.min(7, completedDay + 1);
  const nextStatus = finalDone ? '7일 분석을 모두 완주했어요.' : dailyReady || finalReady ? `DAY ${nextDay} 분석을 지금 확인할 수 있어요.` : `DAY ${nextDay} 분석은 다음 날짜에 열려요.`;
  return <div className="screen home-screen"><main><p className="eyebrow">쓸능검</p><div className="home-retention-card" aria-label="7일 분석 진행"><div className="home-retention-progress"><span>7일 분석 진행</span><strong>DAY {completedDay} / 7</strong></div><p>{nextStatus}</p></div><h1>{finalDone?'최종 분석 완료':finalReady?'최종 분석 준비 완료':dailyReady ? '오늘의 추가 분석이 준비됐습니다.' : dailyDone ? '오늘의 추가 분석 완료' : '기본 분석이 완료됐습니다.'}</h1><p>{finalDone?'최종 쓸능검 사용설명서를 다시 볼 수 있어요.':finalReady?'DAY 1~6 누적 측정 근거를 바탕으로 가장 확인이 필요한 능력을 약 15~20초 동안 마지막으로 점검해요.':dailyReady ? '오늘은 한 가지 조건을 더 확인할 수 있어요.' : dailyDone ? '다음 추가 분석은 다른 날 이어서 할 수 있어요.' : '오늘 완료한 기본 분석서를 다시 볼 수 있어요.'}</p><button className="primary-button" type="button" onClick={dailyReady||finalReady ? onDaily : onAnalysis}>{finalDone?'최종 사용설명서 보기':finalReady?'최종 분석 시작':dailyReady ? '오늘의 추가 분석' : dailyDone ? '업데이트된 분석서 보기' : '기본 분석서 보기'}</button>{(dailyReady||finalReady) && <button className="secondary-button" type="button" onClick={onAnalysis}>내 분석서 보기</button>}<p className="storage-copy">분석 결과는 현재 기기에 저장됩니다.</p>{clearFailed && <p role="alert">기록을 초기화하지 못했습니다.</p>}{confirm ? <div><p>기록을 모두 지울까요? 앱 데이터가 삭제되면 복구할 수 없습니다.</p><button className="secondary-button" onClick={() => void onClear().then((ok) => setClearFailed(!ok))}>기록 모두 지우기</button><button className="secondary-button" onClick={() => setConfirm(false)}>취소</button></div> : <button className="secondary-button" onClick={() => setConfirm(true)}>전체 데이터 초기화</button>}</main></div>;
}
function RecordConflictScreen({ onViewExisting, onClear }: { onViewExisting: () => void; onClear: () => Promise<boolean> }) {
  const [confirm, setConfirm] = useState(false); const [failed, setFailed] = useState(false);
  return <div className="screen analysis-error"><section role="alert"><h1>저장된 기록과 현재 측정 기록이 충돌했습니다.</h1><p>기존 기록을 자동으로 덮어쓰지 않았습니다.</p>{failed && <p>기록을 초기화하지 못했습니다.</p>}</section><div className="bottom-action"><button className="primary-button" onClick={onViewExisting}>기존 기록 보기</button>{confirm ? <><p>기록을 모두 지울까요? 삭제 후 복구할 수 없습니다.</p><button className="secondary-button" onClick={() => void onClear().then((ok) => setFailed(!ok))}>기록 초기화</button><button className="secondary-button" onClick={() => setConfirm(false)}>취소</button></> : <button className="secondary-button" onClick={() => setConfirm(true)}>기록 초기화</button>}</div></div>;
}
function BaselineDateInvalidatedScreen({ onRestart }: { onRestart: () => void }) { return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">측정 다시 시작</p><h1>날짜가 변경되어 측정을 다시 시작해야 합니다.</h1><p>한 번의 기본 검사는 같은 날짜의 기록으로만 분석합니다.</p></section><div className="bottom-action"><button className="primary-button" type="button" onClick={onRestart}>처음부터 다시 측정</button></div></div>; }
function Day7IntroScreen({ selectedAbility, onStart }: { selectedAbility: Ability | null; onStart: () => void }) { const selectedLabel=selectedAbility?FINAL_ABILITY_LABELS[selectedAbility]:null;return <div className="screen ready-screen final-calibration-screen final-calibration-intro"><section><div className="final-calibration-intro-hero"><FinalCalibrationSeal/><div><p className="final-day-index">DAY 7 / 7</p><p className="final-kicker">FINAL CALIBRATION</p><h1>마지막 최종 보정을 진행합니다.</h1></div></div><p className="final-intro-copy">지난 6일의 기록을 바탕으로 가장 추가 확인이 필요한 능력 하나를 마지막으로 다시 측정합니다.</p>{selectedLabel&&<p className="final-selected-preview"><span>최종 보정 대상</span><strong>{selectedLabel}</strong></p>}<div className="final-calibration-facts" aria-label="최종 보정 과정"><div><span>누적 기록</span><strong>DAY 1–6</strong></div><div><span>최종 확인</span><strong>1개 능력</strong></div><div><span>다음 단계</span><strong>최종 분석</strong></div></div></section><div className="bottom-action"><button className="primary-button" onClick={onStart}>마지막 보정 확인하기</button></div></div>; }
