import { useEffect, type CSSProperties } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TIME_TARGET_DURATION_MS, useTimeTrial, type MeasurementClock } from './useTimeTrial';
import { describeTimeDirection, describeTimeError, formatPreciseSeconds, formatSeconds, formatSignedSeconds } from './formatTimeResult';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import { timeResultMarkerPosition } from './timeResultMarker';

interface TimeAssessmentScreenProps {
  onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_time' }>) => void;
  clock?: MeasurementClock;
  dateNow?: () => Date;
  createTrialId?: () => string;
  baselineSessionDateKey?: LocalDateKey;
  onDateInvalidated?: () => void;
}

const dialTicks = Array.from({ length: 60 }, (_, index) => index);

function RunningTimeInstrument() {
  return (
    <div className="time-running-instrument" aria-hidden="true">
      <span className="time-running-crown" />
      <span className="time-running-stem" />
      <svg viewBox="0 0 360 360" focusable="false">
        <circle className="dial-outer" cx="180" cy="180" r="151" />
        <circle className="dial-rim" cx="180" cy="180" r="140" />
        <circle className="dial-calibration" cx="180" cy="180" r="118" />
        <circle className="dial-guide" cx="180" cy="180" r="76" />
        <circle className="dial-hub-ring" cx="180" cy="180" r="25" />
        <line className="dial-axis" x1="28" y1="180" x2="332" y2="180" />
        <line className="dial-axis" x1="180" y1="28" x2="180" y2="332" />
        <g className="dial-ticks">
          {dialTicks.map((tick) => (
            <line key={tick} className={tick % 15 === 0 ? 'major' : tick % 5 === 0 ? 'medium' : ''} x1="180" y1="47" x2="180" y2={tick % 15 === 0 ? 64 : tick % 5 === 0 ? 59 : 55} transform={`rotate(${tick * 6} 180 180)`} />
          ))}
        </g>
        <circle className="dial-point" cx="180" cy="180" r="4" />
        <circle className="dial-cardinal" cx="180" cy="62" r="2" />
        <circle className="dial-cardinal" cx="298" cy="180" r="2" />
        <circle className="dial-cardinal" cx="180" cy="298" r="2" />
        <circle className="dial-cardinal" cx="62" cy="180" r="2" />
      </svg>
      <div className="time-running-calibration time-running-calibration-left"><i /><i /><i /></div>
      <div className="time-running-calibration time-running-calibration-right"><i /><i /><i /></div>
    </div>
  );
}

function TimeResultInstrument({ actualMs }: { actualMs: number }) {
  const markerPosition = timeResultMarkerPosition(actualMs);
  return (
    <div className="time-result-instrument" aria-hidden="true" style={{ '--actual-marker-position': `${markerPosition}%` } as CSSProperties}>
      <span className="time-result-crown" />
      <svg viewBox="0 0 360 300" focusable="false">
        <circle className="result-dial-outer" cx="180" cy="150" r="127" />
        <circle className="result-dial-rim" cx="180" cy="150" r="116" />
        <circle className="result-dial-calibration" cx="180" cy="150" r="94" />
        <circle className="result-dial-guide" cx="180" cy="150" r="57" />
        <circle className="result-dial-hub" cx="180" cy="150" r="24" />
        <line className="result-dial-axis" x1="35" y1="150" x2="325" y2="150" />
        <line className="result-dial-axis" x1="180" y1="20" x2="180" y2="280" />
        <g className="result-dial-ticks">
          {dialTicks.map((tick) => <line key={tick} className={tick % 15 === 0 ? 'major' : tick % 5 === 0 ? 'medium' : ''} x1="180" y1="34" x2="180" y2={tick % 15 === 0 ? 49 : tick % 5 === 0 ? 45 : 41} transform={`rotate(${tick * 6} 180 150)`} />)}
        </g>
      </svg>
      <span className="time-result-marker time-result-target-marker" />
      <span className="time-result-marker time-result-actual-marker" />
      <span className="time-result-bracket bracket-left" /><span className="time-result-bracket bracket-right" />
    </div>
  );
}

export function TimeAssessmentScreen({ onComplete, clock, dateNow = () => new Date(), createTrialId, baselineSessionDateKey, onDateInvalidated }: TimeAssessmentScreenProps) {
  const assessment = useTimeTrial({ clock, dateNow, createTrialId });
  const { phase, trials, lastTrial, validTrials } = assessment;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey(dateNow()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);

  if (phase === 'running') {
    return (
      <div className="screen time-screen running-screen time-running-poster">
        <header className="progress-header"><span>시간 감각</span><span>{Math.min(trials.length + 1, 3)} / 3</span></header>
        <section className="running-content time-running-content" aria-live="polite">
          <RunningTimeInstrument />
          <p className="eyebrow">3초라고 느껴질 때</p>
          <h1>지금!</h1>
          <p className="time-running-instruction">정확히 3초가 지났다고 느껴지는 순간<br />버튼을 눌러주세요.</p>
        </section>
        <div className="bottom-action time-running-action"><PrimaryButton className="now-button" onClick={assessment.completeTrial}>지금!</PrimaryButton></div>
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
    const signedErrorMs = lastTrial.valid ? lastTrial.observedDurationMs - lastTrial.targetDurationMs : 0;
    return (
      <div className="screen time-screen result-screen time-result-poster">
        <header className="progress-header"><span>시간 감각</span><span>{Math.min(trials.length, 3)} / 3</span></header>
        <section className="trial-result time-trial-result" aria-live="polite">
          {lastTrial.valid ? (
            <>
              <p className="time-result-status"><span aria-hidden="true">✓</span> 측정 완료</p>
              <p className="time-result-label">이번 기록</p>
              <h1><span>{(lastTrial.observedDurationMs / 1000).toFixed(3)}</span><small>초</small></h1>
              <div className="time-result-delta">
                <span>목표 {formatPreciseSeconds(lastTrial.targetDurationMs)} 대비</span>
                <strong>{formatSignedSeconds(signedErrorMs)}</strong>
                <small>{describeTimeDirection(lastTrial.observedDurationMs)}</small>
              </div>
              <TimeResultInstrument actualMs={lastTrial.observedDurationMs} />
              <div className="time-result-legend" aria-label="목표와 실제 기록 비교">
                <span className="target">목표 ({formatPreciseSeconds(lastTrial.targetDurationMs)})</span>
                <span className="actual">실제 ({formatPreciseSeconds(lastTrial.observedDurationMs)})</span>
              </div>
              <aside className="time-result-note">
                <span className="note-target" aria-hidden="true" />
                <div><strong>{describeTimeDirection(lastTrial.observedDurationMs)}</strong><p>{describeTimeError(lastTrial.observedDurationMs)}</p></div>
              </aside>
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
