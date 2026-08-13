import { PrimaryButton } from '../../../components/PrimaryButton';
import type { DailyRawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { describeTimeError, formatSeconds } from '../time/formatTimeResult';
import { Day2Particles } from './Day2Particles';
import { useDay2TimeAssessment, type Day2MeasurementClock } from './useDay2TimeAssessment';

interface Props {
  sessionDateKey: LocalDateKey;
  onComplete: (result: Extract<DailyRawResult, { assessmentType: 'day2_time_distraction' }>) => void;
  onDateInvalidated: () => void;
  clock?: Day2MeasurementClock;
  dateNow?: () => Date;
  createTrialId?: () => string;
}

export function Day2TimeAssessmentScreen({ sessionDateKey, onComplete, onDateInvalidated, clock, dateNow, createTrialId }: Props) {
  const assessment = useDay2TimeAssessment({ sessionDateKey, clock, dateNow, createTrialId });
  const { phase, trials, lastTrial, currentCondition } = assessment;

  if (phase === 'dateInvalidated') return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">추가 분석 다시 시작</p><h1>날짜가 변경되어 측정을 다시 시작해야 합니다.</h1><p>DAY 1 기본 분석은 그대로 유지됩니다.</p></section><div className="bottom-action"><PrimaryButton onClick={onDateInvalidated}>추가 분석 다시 시작</PrimaryButton></div></div>;
  if (phase === 'incomplete') return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">측정 중단</p><h1>추가 분석을 완료하지 못했습니다.</h1><p>DAY 1 기록은 유지하고 이번 추가 분석만 다시 시작합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={onDateInvalidated}>처음부터 다시</PrimaryButton></div></div>;
  if (phase === 'complete') return <div className="screen time-screen summary-screen"><section className="summary-content"><p className="eyebrow">추가 측정 완료</p><h1>방해 조건 측정을 마쳤습니다.</h1><p>기본 분석과 비교해 새로운 시간 감각 근거를 확인합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={() => onComplete({ assessmentType: 'day2_time_distraction', trials })}>결과 확인</PrimaryButton></div></div>;
  if (phase === 'running') return <div className={`screen time-screen running-screen day2-running ${currentCondition === 'distracted' ? 'is-distracted' : ''}`}>
    <header className="progress-header"><span>추가 분석 · 시간 감각</span><span>{trials.length < 4 ? `${trials.length + 1} / 4` : `추가 측정 ${trials.length - 3}`}</span></header>
    {currentCondition === 'distracted' && <Day2Particles />}
    <section className="running-content"><p className="eyebrow">3초라고 느껴질 때</p><h1>지금부터 셉니다</h1></section>
    <div className="bottom-action"><PrimaryButton className="now-button" onClick={assessment.completeTrial}>지금!</PrimaryButton></div>
  </div>;
  if (phase === 'result' && lastTrial) return <div className="screen time-screen result-screen"><header className="progress-header"><span>추가 분석 · 시간 감각</span><span>{Math.min(trials.length, 4)} / 4</span></header><section className="trial-result" aria-live="polite">{lastTrial.valid ? <><p className="eyebrow">측정 기록</p><h1>{formatSeconds(lastTrial.observedDurationMs)}</h1><p>{describeTimeError(lastTrial.observedDurationMs)}</p></> : <><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">화면을 벗어나서 이번 측정은 다시 해야 합니다.</p></>}</section><div className="bottom-action"><PrimaryButton onClick={assessment.retry}>{assessment.completion.status === 'retryAllowed' || !lastTrial.valid ? '다시 측정' : '다음 측정'}</PrimaryButton></div></div>;
  return <div className="screen time-screen ready-screen"><header className="progress-header"><span>추가 분석 · 시간 감각</span><span>1 / 4</span></header><section className="ready-content"><p className="eyebrow">3초 감각</p><h1>3초라고 느껴지는 순간<br />눌러주세요.</h1><p>화면에 움직임이 있어도 별도로 누르거나 따라갈 필요는 없습니다.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>측정 시작</PrimaryButton></div></div>;
}
