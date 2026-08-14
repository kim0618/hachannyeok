import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TIME_TARGET_DURATION_MS, useTimeTrial, type MeasurementClock } from './useTimeTrial';
import { describeTimeError, formatSeconds } from './formatTimeResult';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import { TimeInstrument } from '../AssessmentInstruments';

interface TimeAssessmentScreenProps {
  onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_time' }>) => void;
  clock?: MeasurementClock;
  dateNow?: () => Date;
  createTrialId?: () => string;
  baselineSessionDateKey?: LocalDateKey;
  onDateInvalidated?: () => void;
}

export function TimeAssessmentScreen({ onComplete, clock, dateNow = () => new Date(), createTrialId, baselineSessionDateKey, onDateInvalidated }: TimeAssessmentScreenProps) {
  const assessment = useTimeTrial({ clock, dateNow, createTrialId });
  const { phase, trials, lastTrial, validTrials } = assessment;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey(dateNow()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);

  if (phase === 'running') {
    return (
      <div className="screen time-screen running-screen">
        <header className="progress-header"><span>시간 감각</span><span>{Math.min(trials.length + 1, 3)} / 3</span></header>
        <section className="running-content" aria-live="polite">
          <TimeInstrument mode="running" />
          <p className="eyebrow">3초라고 느껴질 때</p>
          <h1>지금부터 셉니다</h1>
        </section>
        <div className="bottom-action"><PrimaryButton className="now-button" onClick={assessment.completeTrial}>지금!</PrimaryButton></div>
      </div>
    );
  }

  if (phase === 'complete') {
    const meanObserved = validTrials.reduce((sum, trial) => sum + trial.observedDurationMs, 0) / validTrials.length;
    const meanAbsoluteError = validTrials.reduce((sum, trial) => sum + Math.abs(trial.observedDurationMs - TIME_TARGET_DURATION_MS), 0) / validTrials.length;
    const closest = validTrials.reduce((best, trial) => Math.abs(trial.observedDurationMs - TIME_TARGET_DURATION_MS) < Math.abs(best.observedDurationMs - TIME_TARGET_DURATION_MS) ? trial : best);
    return (
      <div className="screen time-screen summary-screen">
        <header className="progress-header"><span>첫 번째 측정</span><span>1 / 5</span></header>
        <section className="summary-content" aria-labelledby="time-complete-title">
          <p className="eyebrow">측정 완료</p>
          <h1 id="time-complete-title">시간 감각 측정 완료</h1>
          <div className="result-summary">
            <div><span>평균 기록</span><strong>{formatSeconds(meanObserved)}</strong></div>
            <div><span>평균 오차</span><strong>{formatSeconds(meanAbsoluteError)}</strong></div>
            <div><span>가장 가까운 기록</span><strong>{formatSeconds(closest.observedDurationMs)}</strong></div>
          </div>
        </section>
        <div className="bottom-action"><PrimaryButton onClick={() => onComplete({ assessmentType: 'day1_time', trials })}>다음 측정</PrimaryButton></div>
      </div>
    );
  }

  if (phase === 'incomplete') {
    return (
      <div className="screen time-screen summary-screen">
        <section className="summary-content" role="alert">
          <p className="eyebrow">측정 중단</p>
          <h1>측정을 완료하지 못했습니다.</h1>
          <p>시간 감각 측정을 다시 시작해 주세요.</p>
        </section>
        <div className="bottom-action"><PrimaryButton onClick={assessment.resetAssessment}>처음부터 다시</PrimaryButton></div>
      </div>
    );
  }

  if (phase === 'dateInvalidated') {
    return (
      <div className="screen time-screen summary-screen">
        <section className="summary-content" role="alert">
          <p className="eyebrow">측정 다시 시작</p>
          <h1>날짜가 바뀌어서 측정을 다시 시작해야 합니다.</h1>
          <p>이전 날짜의 측정 기록은 이어서 사용하지 않습니다.</p>
        </section>
        <div className="bottom-action"><PrimaryButton onClick={assessment.resetAssessment}>다시 시작</PrimaryButton></div>
      </div>
    );
  }

  if (phase === 'result' && lastTrial) {
    const completionNeedsRetry = assessment.completion.status === 'retryAllowed';
    return (
      <div className="screen time-screen result-screen">
        <header className="progress-header"><span>시간 감각</span><span>{Math.min(trials.length, 3)} / 3</span></header>
        <section className="trial-result" aria-live="polite">
          {lastTrial.valid ? (
            <>
              <TimeInstrument mode="result" actualMs={lastTrial.observedDurationMs} />
              <p className="eyebrow">측정 기록</p>
              <h1>{formatSeconds(lastTrial.observedDurationMs)}</h1>
              <p>{describeTimeError(lastTrial.observedDurationMs)}</p>
            </>
          ) : (
            <>
              <p className="eyebrow">다시 측정해 주세요</p>
              <h1>이번 측정은 제외됩니다.</h1>
              <p role="alert">{lastTrial.invalidReason === 'backgrounded' ? '화면을 벗어나서 이번 측정은 다시 해야 합니다.' : '날짜가 변경되어 이번 측정은 다시 해야 합니다.'}</p>
            </>
          )}
        </section>
        <div className="bottom-action"><PrimaryButton onClick={assessment.retry}>{completionNeedsRetry || !lastTrial.valid ? '다시 측정' : '다음 측정'}</PrimaryButton></div>
      </div>
    );
  }

  return (
    <div className="screen time-screen ready-screen time-ready-reference-shell">
      <div className="time-ready-reference-poster">
        <img src="/assets/day1-time-ready-reference.png" alt="" aria-hidden="true" draggable="false" />
        <div className="time-ready-interaction-layer">
          <button className="time-ready-reference-start" type="button" aria-label="측정 시작" onClick={assessment.startTrial} />
        </div>
      </div>

      <div className="sr-only time-ready-accessible-summary">
        <p>검사 1 / 5</p>
        <p>연습 아님</p>
        <h1>시간 감각</h1>
        <p>숫자가 사라진 뒤 정확히 3초에 눌러주세요.</p>
        <p>총 3회 측정 후 평균값을 분석합니다.</p>
      </div>
    </div>
  );
}
