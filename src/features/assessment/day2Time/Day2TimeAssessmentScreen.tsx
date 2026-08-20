import { type CSSProperties } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { DailyRawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { formatPreciseSeconds, formatSignedSeconds } from '../time/formatTimeResult';
import { timeResultMarkerPosition } from '../time/timeResultMarker';
import { Day2Particles } from './Day2Particles';
import { Day2IntroScreen } from './Day2IntroScreen';
import { DAY2_TIME_CONDITIONS, DAY2_TIME_TARGET_DURATION_MS } from './day2TimeConfig';
import { useDay2TimeAssessment, type Day2MeasurementClock } from './useDay2TimeAssessment';

interface Props {
  sessionDateKey: LocalDateKey;
  onComplete: (result: Extract<DailyRawResult, { assessmentType: 'day2_time_distraction' }>) => void;
  onDateInvalidated: () => void;
  clock?: Day2MeasurementClock;
  dateNow?: () => Date;
  createTrialId?: () => string;
}

function Day2RunningProgress({ condition }: { condition: 'plain' | 'distracted' }) {
  const steps = [{ label: 'INTRO', state: 'complete' }, { label: 'PLAIN', state: condition === 'plain' ? 'active' : 'complete' }, { label: 'DISTRACTED', state: condition === 'distracted' ? 'active' : 'pending' }, { label: 'ANALYSIS', state: 'pending' }, { label: 'COMPLETE', state: 'pending' }] as const;
  return <ol className="day2-condition-progress" aria-label="DAY 2 진행 단계">{steps.map((step) => <li className={`is-${step.state}`} key={step.label} aria-current={step.state === 'active' ? 'step' : undefined}><span aria-hidden="true">{step.state === 'complete' ? '✓' : ''}</span><strong>{step.label}</strong></li>)}</ol>;
}

function PlainRunningDial() {
  return <div className="day2-running-instrument" aria-hidden="true"><span className="day2-running-dots dots-left" /><div className="day2-empty-dial"><i /></div><span className="day2-running-dots dots-right" /></div>;
}

function Day2ResultProgress({ condition }: { condition: 'plain' | 'distracted' }) {
  const steps = [{ label: 'INTRO', state: 'complete' }, { label: 'PLAIN', state: 'complete' }, { label: 'DISTRACTED', state: condition === 'distracted' ? 'complete' : 'pending' }, { label: 'ANALYSIS', state: 'pending' }, { label: 'COMPLETE', state: 'pending' }] as const;
  return <ol className="day2-condition-progress" aria-label="DAY 2 진행 단계">{steps.map((step) => <li className={`is-${step.state}`} key={step.label}><span aria-hidden="true">{step.state === 'complete' ? '✓' : ''}</span><strong>{step.label}</strong></li>)}</ol>;
}

function Day2ResultScale({ actualMs, targetMs }: { actualMs: number; targetMs: number }) {
  const actualPosition = timeResultMarkerPosition(actualMs);
  return <div className="day2-result-scale" aria-hidden="true" style={{ '--day2-actual-position': `${actualPosition}%` } as CSSProperties}><span className="scale-target-label">{formatPreciseSeconds(targetMs)} (목표)</span><span className="scale-actual-label">{formatPreciseSeconds(actualMs)}</span><i className="scale-target-marker" /><i className="scale-actual-marker" /><div className="scale-line" /><small>너무 빠름</small><small>정확!</small><small>너무 늦음</small></div>;
}

export function Day2TimeAssessmentScreen({ sessionDateKey, onComplete, onDateInvalidated, clock, dateNow, createTrialId }: Props) {
  const assessment = useDay2TimeAssessment({ sessionDateKey, clock, dateNow, createTrialId });
  const { phase, trials, lastTrial, currentCondition } = assessment;

  if (phase === 'dateInvalidated') return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">추가 분석 다시 시작</p><h1>날짜가 변경되어 측정을 다시 시작해야 합니다.</h1><p>DAY 1 기본 분석은 그대로 유지됩니다.</p></section><div className="bottom-action"><PrimaryButton onClick={onDateInvalidated}>추가 분석 다시 시작</PrimaryButton></div></div>;
  if (phase === 'incomplete') return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">측정 중단</p><h1>추가 분석을 완료하지 못했습니다.</h1><p>DAY 1 기록은 유지하고 이번 추가 분석만 다시 시작합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={onDateInvalidated}>처음부터 다시</PrimaryButton></div></div>;
  if (phase === 'complete') return <div className="screen time-screen summary-screen"><section className="summary-content"><p className="eyebrow">추가 측정 완료</p><h1>방해 조건 측정을 마쳤습니다.</h1><p>기본 분석과 비교해 새로운 시간 감각 근거를 확인합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={() => onComplete({ assessmentType: 'day2_time_distraction', trials })}>결과 확인</PrimaryButton></div></div>;
  if (phase === 'running') {
    const attempt = trials.length + 1;
    if (currentCondition === 'plain') return <div className="screen time-screen running-screen day2-plain-running">
      <header className="day2-ready-masthead"><span className="day2-ready-back" aria-hidden="true">‹</span><div><strong>DAY 2</strong><h1>시간 감각 · 조건 비교</h1></div><span className="day2-ready-help" aria-hidden="true">?</span></header>
      <Day2RunningProgress condition="plain" />
      <section className="day2-running-condition"><span className="day2-flask" aria-hidden="true" /><div><h2>기본 조건 · PLAIN</h2><p>방해 요소가 없는 환경에서 측정 중입니다.</p></div><aside aria-label={`현재 전체 측정 ${attempt} / ${DAY2_TIME_CONDITIONS.length}`}><strong>{attempt} <i>/</i> {DAY2_TIME_CONDITIONS.length}</strong><small>측정 진행</small></aside></section>
      <main className="day2-plain-running-content"><h2>3초라고 느껴질 때<br />버튼을 눌러주세요</h2><span className="day2-running-arrow" aria-hidden="true" /> <PlainRunningDial /><div className="day2-running-status"><strong><span aria-hidden="true">⌁</span> 측정 중</strong><p>정확한 순간을 포착해 주세요.</p></div></main>
      <aside className="day2-running-info"><span aria-hidden="true">i</span><div><strong>기본 조건 · PLAIN</strong><p>방해 요소가 없는 환경에서<br />당신의 시간 감각을 측정합니다.</p></div><div className="day2-running-environment"><i aria-hidden="true">◇</i><p>방해 요소 없음<br />집중 환경</p></div></aside>
      <div className="day2-running-action"><PrimaryButton className="now-button" onClick={assessment.completeTrial}>지금!</PrimaryButton><p>모든 데이터는 안전하게 저장되며 분석에만 사용됩니다.</p></div>
    </div>;
    return <div className="screen time-screen running-screen day2-plain-running day2-distracted-running">
      <Day2Particles />
      <header className="day2-ready-masthead"><span className="day2-ready-back" aria-hidden="true">‹</span><div><strong>DAY 2</strong><h1>시간 감각 · 조건 비교</h1></div><span className="day2-ready-help" aria-hidden="true">?</span></header>
      <Day2RunningProgress condition="distracted" />
      <section className="day2-running-condition"><span className="day2-flask" aria-hidden="true" /><div><h2>방해 조건 · DISTRACTED</h2><p>방해 요소가 있는 환경에서 측정 중입니다.</p></div><aside aria-label={`현재 전체 측정 ${attempt} / ${DAY2_TIME_CONDITIONS.length}`}><strong>{attempt} <i>/</i> {DAY2_TIME_CONDITIONS.length}</strong><small>측정 진행</small></aside></section>
      <main className="day2-plain-running-content"><h2>3초라고 느껴질 때<br />버튼을 눌러주세요</h2><span className="day2-running-arrow" aria-hidden="true" /><PlainRunningDial /><div className="day2-running-status"><strong><span aria-hidden="true">⌁</span> 측정 중</strong><p>정확한 순간을 포착해 주세요.</p></div></main>
      <aside className="day2-running-info"><span aria-hidden="true">i</span><div><strong>방해 조건 · DISTRACTED</strong><p>방해 요소가 있는 환경에서<br />당신의 시간 감각을 측정합니다.</p></div><div className="day2-running-environment"><i aria-hidden="true">◇</i><p>방해 요소 있음<br />주의 분산 환경</p></div></aside>
      <div className="day2-running-action"><PrimaryButton className="now-button" onClick={assessment.completeTrial}>지금!</PrimaryButton><p>모든 데이터는 안전하게 저장되며 분석에만 사용됩니다.</p></div>
    </div>;
  }
  if (phase === 'result' && lastTrial) {
    if (!lastTrial.valid) return <div className="screen time-screen result-screen"><header className="progress-header"><span>추가 분석 · 시간 감각</span><span>{Math.min(trials.length, 4)} / 4</span></header><section className="trial-result" aria-live="polite"><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">화면을 벗어나서 이번 측정은 다시 해야 합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.retry}>다시 측정</PrimaryButton></div></div>;
    const conditionLabel = lastTrial.condition === 'plain' ? '기본 조건 · PLAIN' : '방해 조건 · DISTRACTED';
    const conditionCopy = lastTrial.condition === 'plain' ? '방해 요소가 없는 환경에서 측정했습니다.' : '방해 요소가 있는 환경에서 측정했습니다.';
    const signedDeltaMs = lastTrial.observedDurationMs - lastTrial.targetDurationMs;
    const direction = signedDeltaMs > 0 ? '목표보다 늦었어요.' : signedDeltaMs < 0 ? '목표보다 빨랐어요.' : '목표 시간과 정확히 일치했어요.';
    const directionClass = signedDeltaMs > 0 ? 'is-late' : signedDeltaMs < 0 ? 'is-fast' : 'is-exact';
    const nextCondition = DAY2_TIME_CONDITIONS[trials.length];
    const nextCopy = nextCondition === 'distracted' ? '다음은 방해 조건 측정입니다.' : nextCondition === 'plain' ? '다음은 기본 조건 측정입니다.' : '모든 측정이 완료되었습니다.';
    return <div className={`screen time-screen result-screen day2-trial-result ${directionClass}`}>
      <header className="day2-ready-masthead"><span className="day2-ready-back" aria-hidden="true">‹</span><div><strong>DAY 2</strong><h1>시간 감각 · 조건 비교</h1></div><span className="day2-ready-help" aria-hidden="true">?</span></header>
      <Day2ResultProgress condition={lastTrial.condition} />
      <section className="day2-result-condition"><span className="day2-flask" aria-hidden="true" /><div><h2>{conditionLabel}</h2><p>{conditionCopy}</p></div><aside aria-label={`현재 전체 측정 ${trials.length} / ${DAY2_TIME_CONDITIONS.length}`}><strong>{trials.length} <i>/</i> {DAY2_TIME_CONDITIONS.length}</strong><small>현재 측정</small></aside></section>
      <main className="day2-result-content" aria-live="polite"><div className="day2-result-complete"><span aria-hidden="true">✓</span><h2>측정 완료</h2><p>수고하셨습니다!</p></div><section className="day2-result-metrics"><div className="actual"><small>실제 기록</small><strong>{formatPreciseSeconds(lastTrial.observedDurationMs)}</strong></div><div className="target"><small>목표 시간</small><strong>{formatPreciseSeconds(lastTrial.targetDurationMs)}</strong></div><div className="delta"><span aria-hidden="true">{signedDeltaMs > 0 ? '↑' : signedDeltaMs < 0 ? '↓' : '✓'}</span><div><strong>{formatSignedSeconds(signedDeltaMs)}</strong><p>{direction}</p></div></div><div className="day2-result-comparison"><h3>목표와의 비교</h3><Day2ResultScale actualMs={lastTrial.observedDurationMs} targetMs={lastTrial.targetDurationMs} /></div></section></main>
      <aside className="day2-result-info"><span aria-hidden="true">i</span><div><strong>{conditionLabel}</strong><p>{lastTrial.condition === 'plain' ? '방해 요소가 없는 집중 환경에서' : '방해 요소가 있는 환경에서'}<br />당신의 시간 감각을 측정합니다.</p></div><div><i aria-hidden="true">◇</i><p>{lastTrial.condition === 'plain' ? '방해 요소 없음' : '방해 요소 있음'}<br />{lastTrial.condition === 'plain' ? '집중 환경' : '비교 환경'}</p></div></aside>
      <div className="day2-result-action"><PrimaryButton onClick={assessment.retry}>다음 측정으로 이동</PrimaryButton><p>{nextCopy}</p></div>
    </div>;
  }
  return <Day2IntroScreen onStart={assessment.startTrial} targetDurationMs={DAY2_TIME_TARGET_DURATION_MS} trialCount={DAY2_TIME_CONDITIONS.length} />;
}
