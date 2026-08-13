import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { MeasurementClock } from '../time/useTimeTrial';
import { CENTER_SHAPE_LABELS, centerDistanceError } from './centerMeasurement';
import { useCenterAssessment } from './useCenterAssessment';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_center' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void }
const formatError = (error: number) => `${(error * 100).toFixed(1)}%`;

export function CenterAssessmentScreen(props: Props) {
  const assessment = useCenterAssessment(props);
  const { phase, trials, lastTrial, validTrials } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);
  if (phase === 'running' && assessment.activeShape) {
    const shape = assessment.activeShape;
    return <div className="screen center-screen center-running"><header className="progress-header"><span>2 / 5 · 중심 감각</span><span>{Math.min(trials.length + 1, 3)} / 3</span></header><section className="center-stage"><div className={`center-shape center-shape-${shape}`} role="application" aria-label="도형의 가운데라고 생각하는 위치를 선택" aria-describedby="center-running-instruction" onPointerDown={(event) => assessment.selectPosition(event, event.currentTarget.getBoundingClientRect())} /><p id="center-running-instruction">가운데라고 느끼는 곳을 눌러주세요.</p></section></div>;
  }
  if (phase === 'result' && lastTrial) {
    return <div className="screen center-screen result-screen"><header className="progress-header"><span>2 / 5 · 중심 감각</span><span>{Math.min(trials.length, 3)} / 3</span></header><section className="trial-result" aria-live="polite">{lastTrial.valid ? <><div className={`center-result-shape center-shape-${lastTrial.shapeId}`} aria-hidden="true"><span className="center-marker actual-marker" /><span className="center-marker selected-marker" style={{ left: `${lastTrial.observed.x * 100}%`, top: `${lastTrial.observed.y * 100}%` }} /></div><p className="marker-legend"><span>선택한 점</span><span>실제 중심</span></p><h1>{centerDistanceError(lastTrial.observed) < 0.01 ? '거의 가운데입니다.' : `약 ${formatError(centerDistanceError(lastTrial.observed))}`}</h1><p>{centerDistanceError(lastTrial.observed) < 0.01 ? '중심에 매우 가깝습니다.' : `중심에서 약 ${formatError(centerDistanceError(lastTrial.observed))} 정도 벗어났습니다.`}</p></> : <><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">{lastTrial.invalidReason === 'backgrounded' ? '화면을 벗어나서 이번 측정은 다시 해야 합니다.' : '선택 위치를 확인할 수 없어 다시 측정해야 합니다.'}</p></>}</section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>{assessment.completion.status === 'retryAllowed' || !lastTrial.valid ? '다시 측정' : '다음 도형'}</PrimaryButton></div></div>;
  }
  if (phase === 'complete') {
    const errors = validTrials.map((trial) => centerDistanceError(trial.observed));
    const bestIndex = errors.indexOf(Math.min(...errors));
    return <div className="screen center-screen summary-screen"><header className="progress-header"><span>두 번째 측정</span><span>2 / 5</span></header><section className="summary-content" aria-labelledby="center-complete-title"><p className="eyebrow">측정 완료</p><h1 id="center-complete-title">중심 감각 측정 완료</h1><div className="result-summary"><div><span>평균 중심 오차</span><strong>{formatError(errors.reduce((sum, value) => sum + value, 0) / errors.length)}</strong></div><div><span>가장 정확했던 도형</span><strong>{CENTER_SHAPE_LABELS[validTrials[bestIndex].shapeId]}</strong></div></div></section><div className="bottom-action"><PrimaryButton onClick={() => props.onComplete({ assessmentType: 'day1_center', trials })}>다음 측정</PrimaryButton></div></div>;
  }
  if (phase === 'dateInvalidated' || phase === 'incomplete') {
    const dateChanged = phase === 'dateInvalidated';
    return <div className="screen center-screen summary-screen"><section className="summary-content" role="alert"><p className="eyebrow">측정 다시 시작</p><h1>{dateChanged ? '날짜가 바뀌어서 측정을 다시 시작해야 합니다.' : '측정을 완료하지 못했습니다.'}</h1><p>{dateChanged ? '이전 날짜의 중심 측정 기록은 이어서 사용하지 않습니다.' : '중심 감각 측정을 처음부터 다시 시작해 주세요.'}</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.resetAssessment}>처음부터 다시</PrimaryButton></div></div>;
  }
  return <div className="screen center-screen ready-screen"><header className="progress-header"><span>중심 감각</span><span>2 / 5</span></header><section className="ready-content" aria-labelledby="center-ready-title"><p className="eyebrow">두 번째 측정</p><h1 id="center-ready-title">중심 감각</h1><p>도형의 정확한 가운데라고 느껴지는 곳을 눌러주세요.<br />너무 오래 고민하지 않아도 됩니다.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>시작하기</PrimaryButton></div></div>;
}
