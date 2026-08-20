import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { MeasurementClock } from '../time/useTimeTrial';
import { controlConfigForAttempt, controlPositionError } from './controlMovement';
import { useControlAssessment, type AnimationScheduler } from './useControlAssessment';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import { visualSkinClass } from '../visualSkin';
import type { ControlTrial } from '../../../domain/assessment/trials';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_control_constant' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; animationScheduler?: AnimationScheduler; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void; variationSessionId?: string }
const formatError = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatPosition = (value: number) => `${(value * 100).toFixed(1)}%`;

export function ControlResultInstrument({ trial, startPosition, skinClass }: { trial: Extract<ControlTrial, { valid: true }>; startPosition: number; skinClass: string }) {
  const target = trial.targetPosition * 100;
  const actual = trial.observedPosition * 100;
  const start = startPosition * 100;
  const distanceStart = Math.min(target, actual);
  const distance = Math.abs(target - actual);
  return <><div className="control-result-instrument">
    <div className="control-result-decoration" aria-hidden="true"><span className="control-preview-corners" /><span className="control-preview-ticks ticks-top" /><span className="control-preview-ticks ticks-bottom" /><span className="control-preview-side side-left" /><span className="control-preview-side side-right" /></div>
    <div className={`control-result-rail ${skinClass}`} aria-hidden="true">
      <span className="control-result-start" style={{ left: `${start}%` }}><i /><em>START</em></span>
      <span className="control-result-target" style={{ left: `${target}%` }}><i /><em>TARGET</em><b>{formatPosition(trial.targetPosition)}</b></span>
      <span className="control-result-actual" style={{ left: `${actual}%` }}><i /><em>ACTUAL</em><b>{formatPosition(trial.observedPosition)}</b></span>
      <span className="control-result-distance" style={{ left: `${distanceStart}%`, width: `${distance}%` }}><b>{formatError(controlPositionError(trial.observedPosition, trial.targetPosition))}</b></span>
    </div>
  </div><div className="control-result-legend"><span className="legend-actual">실제 정지 위치</span><span className="legend-target">목표 위치</span></div></>;
}

export function ControlAssessmentScreen(props: Props) {
  const assessment = useControlAssessment(props);
  const { phase, trials, lastTrial, validTrials } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);
  if (phase === 'running') {
    const progress = trials.length < 3 ? `${trials.length + 1} / 3` : `추가 측정 ${trials.length - 2}`;
    return <div className="screen control-screen control-running control-running-poster">
      <header className="progress-header"><span>손가락 통제</span><span>{progress}</span></header>
      <section className="control-running-content" aria-labelledby="control-running-title">
        <div className="control-running-heading"><span className="control-heading-calibration" aria-hidden="true" /><h1 id="control-running-title"><small>움직임을 보고</small>목표 지점에서 멈춰주세요</h1></div>
        <div className="control-running-instrument">
          <div className="control-running-decoration" aria-hidden="true"><span className="control-preview-corners" /><span className="control-preview-ticks ticks-top" /><span className="control-preview-ticks ticks-bottom" /><span className="control-preview-side side-left" /><span className="control-preview-side side-right" /></div>
          <div className={`control-track ${visualSkinClass(props.variationSessionId, 'day1_control_constant', trials.length)}`} aria-hidden="true">
            <span className="control-running-direction">→</span><span className="control-start" style={{ left: `${assessment.activeConfig.startPosition * 100}%` }}><i />START</span><span className="control-target" style={{ left: `${assessment.activeConfig.targetPosition * 100}%` }}><i />TARGET</span><span className="control-marker" style={{ left: `${assessment.markerPosition * 100}%` }} />
          </div>
        </div>
        <p className="sr-only">표시가 움직이고 있습니다. 목표 위치라고 느껴질 때 지금 멈추기 버튼을 누르세요.</p>
        <aside className="control-running-note"><span className="note-control" aria-hidden="true" /><div><strong>움직임을 멈추는 감각을 측정합니다</strong><p>표시의 움직임을 관찰하고 목표 지점에서 멈춰주세요.</p></div></aside>
      </section>
      <div className="bottom-action control-running-action"><PrimaryButton onClick={assessment.stopTrial}>지금 멈추기</PrimaryButton></div>
    </div>;
  }
  if (phase === 'result' && lastTrial) {
    const progress = trials.length <= 3 ? `${trials.length} / 3` : `추가 측정 ${trials.length - 3}`;
    if (lastTrial.valid) {
      const error = controlPositionError(lastTrial.observedPosition, lastTrial.targetPosition);
      const delta = lastTrial.observedPosition - lastTrial.targetPosition;
      const interpretation = delta > 0 ? `목표보다 약 ${formatError(error)} 지나쳤어요.` : delta < 0 ? `목표보다 약 ${formatError(error)} 덜 갔어요.` : '목표 위치에 정확히 멈췄어요.';
      const startPosition = controlConfigForAttempt(trials.length - 1).startPosition;
      return <div className="screen control-screen result-screen control-result-poster">
        <header className="progress-header"><span>손가락 통제</span><span>{progress}</span></header>
        <section className="control-result-content trial-result" aria-live="polite">
          <div className="control-result-metric"><p className="control-result-status">측정 완료</p><span>이번 정지 오차</span><h1>약 <strong>{formatError(error)}</strong></h1><div><b>목표 지점에서 벗어난 거리</b><strong>약 {formatError(error)}</strong></div></div>
          <ControlResultInstrument trial={lastTrial} startPosition={startPosition} skinClass={visualSkinClass(props.variationSessionId, 'day1_control_constant', trials.length - 1)} />
          <div className="control-result-values"><div><span>목표 위치</span><strong>{formatPosition(lastTrial.targetPosition)}</strong></div><div><span>실제 정지 위치</span><strong>{formatPosition(lastTrial.observedPosition)}</strong></div></div>
          <aside className="control-result-note"><span className="note-control" aria-hidden="true" /><p>{interpretation}</p></aside>
        </section>
        <div className="bottom-action control-result-action"><PrimaryButton onClick={assessment.startTrial}>다음 측정</PrimaryButton></div>
      </div>;
    }
    return <div className="screen control-screen result-screen"><header className="progress-header"><span>4 / 5 · 손가락 통제</span><span>{progress}</span></header><section className="trial-result" aria-live="polite"><p className="eyebrow">다시 측정해 주세요</p><h1>{lastTrial.invalidReason === 'insufficientObservation' ? '놓쳤습니다.' : '이번 측정은 제외됩니다.'}</h1><p role="alert">{lastTrial.invalidReason === 'insufficientObservation' ? '한 번 더 측정할게요.' : '화면을 벗어나서 이번 측정은 다시 해야 합니다.'}</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>다시 측정</PrimaryButton></div></div>;
  }
  if (phase === 'complete') {
    const meanError = validTrials.reduce((sum, trial) => sum + controlPositionError(trial.observedPosition, trial.targetPosition), 0) / validTrials.length;
    const closest = validTrials.reduce((best, trial) => controlPositionError(trial.observedPosition, trial.targetPosition) < controlPositionError(best.observedPosition, best.targetPosition) ? trial : best);
    return <div className="screen control-screen summary-screen"><header className="progress-header"><span>네 번째 측정</span><span>4 / 5</span></header><section className="summary-content" aria-labelledby="control-complete-title"><p className="eyebrow">측정 완료</p><h1 id="control-complete-title">손가락 통제 측정 완료</h1><div className="result-summary"><div><span>평균 위치 오차</span><strong>{formatError(meanError)}</strong></div><div><span>가장 정확했던 시도</span><strong>{trials.indexOf(closest) + 1}번째 측정</strong></div></div></section><div className="bottom-action"><PrimaryButton onClick={() => props.onComplete({ assessmentType: 'day1_control_constant', trials })}>다음 측정</PrimaryButton></div></div>;
  }
  if (phase === 'dateInvalidated' || phase === 'incomplete') {
    const dateChanged = phase === 'dateInvalidated';
    return <div className="screen control-screen summary-screen"><section className="summary-content" role="alert"><p className="eyebrow">측정 다시 시작</p><h1>{dateChanged ? '날짜가 바뀌어서 측정을 다시 시작해야 합니다.' : '측정을 완료하지 못했습니다.'}</h1><p>{dateChanged ? '이전 날짜의 손가락 통제 기록은 이어서 사용하지 않습니다.' : '손가락 통제 측정을 처음부터 다시 시작해 주세요.'}</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.resetAssessment}>처음부터 다시</PrimaryButton></div></div>;
  }
  return <div className="screen control-screen ready-screen control-ready-poster">
    <header className="progress-header"><span>손가락 통제</span><span>4 / 5</span></header>
    <section className="control-ready-content" aria-labelledby="control-ready-title">
      <div className="control-ready-heading"><span className="control-heading-calibration" aria-hidden="true" /><h1 id="control-ready-title">손가락 통제</h1><p>움직이는 표시가 목표 지점에<br />왔다고 느껴질 때 멈춰주세요</p></div>
      <div className="control-ready-preview" aria-hidden="true" style={{ pointerEvents: 'none' }}>
        <span className="control-preview-corners" /><span className="control-preview-ticks ticks-top" /><span className="control-preview-ticks ticks-bottom" /><span className="control-preview-side side-left" /><span className="control-preview-side side-right" />
        <span className="control-preview-direction">→</span><span className="control-preview-rail" /><span className="control-preview-start"><i />START</span><span className="control-preview-marker" /><span className="control-preview-target"><i />TARGET</span>
      </div>
      <aside className="control-ready-note"><span className="note-control" aria-hidden="true" /><div><strong>움직임을 멈추는 감각을 측정합니다</strong><p>표시의 움직임을 관찰하고 목표 지점에서 멈춰주세요.</p></div></aside>
    </section>
    <div className="bottom-action control-ready-action"><PrimaryButton onClick={assessment.startTrial}>측정 시작</PrimaryButton></div>
  </div>;
}
