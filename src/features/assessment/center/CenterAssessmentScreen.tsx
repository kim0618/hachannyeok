import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { Day1RawResult } from '../../../domain/assessment/results';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import type { LocalDateKey } from '../../../domain/progression/types';
import type { MeasurementClock } from '../time/useTimeTrial';
import { visualSkinClass } from '../visualSkin';
import { CENTER_SHAPE_LABELS, centerDistanceError } from './centerMeasurement';
import { useCenterAssessment } from './useCenterAssessment';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_center' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void; variationSessionId?: string }
const formatError = (error: number) => `${(error * 100).toFixed(1)}%`;
type ValidCenterTrial = Extract<NonNullable<ReturnType<typeof useCenterAssessment>['lastTrial']>, { valid: true }>;

function CenterValidTrialResult({ trial, skin }: { trial: ValidCenterTrial; skin: string }) {
  const error = centerDistanceError(trial.observed);
  const formattedError = formatError(error);
  return <div className="center-result-evidence">
    <p className="center-result-status"><span aria-hidden="true">✓</span> 측정 완료</p>
    <p className="center-result-label">이번 선택 위치</p>
    <h1>약 {formattedError}</h1>
    <div className="center-result-metric"><span>실제 중심에서 벗어난 거리</span><strong>약 {formattedError}</strong><small>{error === 0 ? '정확한 중심이에요' : '조금 벗어났어요'}</small></div>
    <div className={`center-result-shape center-result-field center-shape-${trial.shapeId} ${skin}`} aria-hidden="true">
      <svg className="center-result-connection" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1={trial.observed.x * 100} y1={trial.observed.y * 100} x2={trial.target.x * 100} y2={trial.target.y * 100} /></svg>
      <span className="center-evidence-marker center-true-marker" style={{ left: `${trial.target.x * 100}%`, top: `${trial.target.y * 100}%` }} />
      <span className="center-evidence-marker center-selected-marker" style={{ left: `${trial.observed.x * 100}%`, top: `${trial.observed.y * 100}%` }} />
    </div>
    <div className="center-result-legend" aria-label="선택 위치와 실제 중심 비교"><span className="selected">선택한 점</span><span className="target">실제 중심</span></div>
    <aside className="center-result-note"><span className="note-optic" aria-hidden="true" /><div><strong>중심에서 약 {formattedError} 벗어났습니다.</strong><p>{error === 0 ? '선택한 위치가 실제 중심과 일치합니다.' : '선택한 위치와 실제 중심을 비교한 결과입니다.'}</p></div></aside>
  </div>;
}

export function CenterAssessmentScreen(props: Props) {
  const assessment = useCenterAssessment(props);
  const { phase, trials, lastTrial, validTrials } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);

  if (phase === 'running' && assessment.activeShape) {
    const shape = assessment.activeShape;
    return <div className="screen center-screen center-running center-running-poster">
      <header className="progress-header"><span>중심 감각</span><span>{Math.min(trials.length + 1, 3)} / 3</span></header>
      <section className="center-stage center-running-content">
        <div className="center-running-heading"><h1>가운데라고 느껴지는 곳을<br />눌러주세요</h1><p id="center-running-instruction">화면 안의 도형을 보고 정확한 중심이라고 느껴지는 위치를 눌러주세요.</p></div>
        <div className={`center-running-optical center-running-optical-${shape}`}>
          <div className="center-running-decoration" aria-hidden="true" style={{ pointerEvents: 'none' }}><span className="running-corner corner-tl" /><span className="running-corner corner-tr" /><span className="running-corner corner-bl" /><span className="running-corner corner-br" /><span className="running-rail rail-left" /><span className="running-rail rail-right" /></div>
          <div className={`center-shape center-shape-${shape} ${visualSkinClass(props.variationSessionId, 'day1_center', trials.length)}`} role="application" aria-label="가운데라고 느껴지는 위치 선택" aria-describedby="center-running-instruction" onPointerDown={(event) => assessment.selectPosition(event, event.currentTarget.getBoundingClientRect())} />
        </div>
        <aside className="center-running-note"><span className="note-optic" aria-hidden="true" /><div><strong>한 번만 선택할 수 있어요</strong><p>선택한 위치는 바로 기록됩니다.</p></div></aside>
      </section>
    </div>;
  }

  if (phase === 'result' && lastTrial) {
    return <div className={`screen center-screen result-screen ${lastTrial.valid ? 'center-result-poster' : ''}`}>
      <header className="progress-header"><span>중심 감각</span><span>{Math.min(trials.length, 3)} / 3</span></header>
      <section className={`trial-result ${lastTrial.valid ? 'center-trial-result' : ''}`} aria-live="polite">{lastTrial.valid ? <CenterValidTrialResult trial={lastTrial} skin={visualSkinClass(props.variationSessionId, 'day1_center', trials.length - 1)} /> : <><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">{lastTrial.invalidReason === 'backgrounded' ? '화면을 벗어나서 이번 측정을 다시 해야 합니다.' : '선택 위치를 확인할 수 없어 다시 측정해야 합니다.'}</p></>}</section>
      <div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>{assessment.completion.status === 'retryAllowed' || !lastTrial.valid ? '다시 측정' : '다음 도형'}</PrimaryButton></div>
    </div>;
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

  return <div className="screen center-screen ready-screen center-ready-poster">
    <header className="progress-header"><span>중심 감각</span><span>2 / 5</span></header>
    <section className="center-ready-content" aria-labelledby="center-ready-title">
      <span className="center-ready-badge">연습 아님</span>
      <div className="center-ready-heading"><h1 id="center-ready-title">중심 감각</h1><p>도형의 정확한 가운데라고<br /> 느껴지는 곳을 눌러주세요</p></div>
      <div className="center-ready-optical" aria-hidden="true"><span className="optical-corner corner-tl" /><span className="optical-corner corner-tr" /><span className="optical-corner corner-bl" /><span className="optical-corner corner-br" /><span className="optical-rail rail-left" /><span className="optical-rail rail-right" /></div>
      <aside className="center-ready-note"><span className="note-optic" aria-hidden="true" /><div><strong>중심을 찾는 감각을 측정합니다</strong><p>화면의 도형을 보고 가장 중심이라고 느껴지는 위치를 선택해주세요.</p></div></aside>
    </section>
    <div className="bottom-action center-ready-action"><PrimaryButton onClick={assessment.startTrial}>측정 시작</PrimaryButton></div>
  </div>;
}
