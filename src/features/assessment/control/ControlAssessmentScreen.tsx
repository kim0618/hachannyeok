import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { MeasurementClock } from '../time/useTimeTrial';
import { controlPositionError } from './controlMovement';
import { useControlAssessment, type AnimationScheduler } from './useControlAssessment';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import { ControlInstrument, InstrumentReadyContent } from '../AssessmentInstruments';
import { visualSkinClass } from '../visualSkin';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_control_constant' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; animationScheduler?: AnimationScheduler; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void; variationSessionId?: string }
const formatError = (value: number) => `${(value * 100).toFixed(1)}%`;

export function ControlAssessmentScreen(props: Props) {
  const assessment = useControlAssessment(props);
  const { phase, trials, lastTrial, validTrials } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);
  if (phase === 'running') {
    const progress = trials.length < 3 ? `${trials.length + 1} / 3` : `추가 측정 ${trials.length - 2}`;
    return <div className="screen control-screen control-running"><header className="progress-header"><span>4 / 5 · 손가락 통제</span><span>{progress}</span></header><section className="control-stage" aria-label="표시가 움직이고 있습니다. 목표 위치라고 느껴질 때 멈춰 버튼을 누르세요."><div className={`control-track ${visualSkinClass(props.variationSessionId, 'day1_control_constant', trials.length)}`} aria-hidden="true"><span className="control-target" style={{ left: `${assessment.activeConfig.targetPosition * 100}%` }} /><span className="control-marker" style={{ left: `${assessment.markerPosition * 100}%` }} /></div><p>목표 지점이라고 느껴지는 순간 멈춰주세요.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.stopTrial}>멈춰!</PrimaryButton></div></div>;
  }
  if (phase === 'result' && lastTrial) {
    const progress = trials.length <= 3 ? `${trials.length} / 3` : `추가 측정 ${trials.length - 3}`;
    return <div className="screen control-screen result-screen"><header className="progress-header"><span>4 / 5 · 손가락 통제</span><span>{progress}</span></header><section className="trial-result" aria-live="polite">{lastTrial.valid ? <><div className={`control-track control-result-track ${visualSkinClass(props.variationSessionId, 'day1_control_constant', trials.length - 1)}`} aria-label="목표 위치와 사용자가 멈춘 위치 비교"><span className="control-target" style={{ left: `${lastTrial.targetPosition * 100}%` }} /><span className="control-stop-marker" style={{ left: `${lastTrial.observedPosition * 100}%` }} /></div><p className="control-legend"><span>멈춘 위치</span><span>목표 위치</span></p>{controlPositionError(lastTrial.observedPosition, lastTrial.targetPosition) < 0.005 ? <h1>거의 정확한 위치입니다.</h1> : <h1>목표에서 약 {formatError(controlPositionError(lastTrial.observedPosition, lastTrial.targetPosition))} 벗어났습니다.</h1>}</> : <><p className="eyebrow">다시 측정해 주세요</p><h1>{lastTrial.invalidReason === 'insufficientObservation' ? '놓쳤습니다.' : '이번 측정은 제외됩니다.'}</h1><p role="alert">{lastTrial.invalidReason === 'insufficientObservation' ? '한 번 더 측정할게요.' : '화면을 벗어나서 이번 측정은 다시 해야 합니다.'}</p></>}</section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>{lastTrial.valid && assessment.completion.status !== 'retryAllowed' ? '다음 측정' : '다시 측정'}</PrimaryButton></div></div>;
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
  return <div className="screen control-screen ready-screen"><header className="progress-header"><span>손가락 통제</span><span>4 / 5</span></header><InstrumentReadyContent instrument={<ControlInstrument />} eyebrow="네 번째 측정" titleId="control-ready-title" title="손가락 통제">움직이는 표시가 목표 지점에 왔다고 느껴질 때 멈춰주세요.<br />눈으로 보고 바로 눌러보세요.</InstrumentReadyContent><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>시작하기</PrimaryButton></div></div>;
}
