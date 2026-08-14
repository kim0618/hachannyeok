import { useEffect, useRef } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { MeasurementClock } from '../time/useTimeTrial';
import { balanceError, closerOrientation, normalizeDividerPosition, type RectLike } from './balanceMeasurement';
import { useBalanceAssessment } from './useBalanceAssessment';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import { BalanceInstrument, InstrumentReadyContent } from '../AssessmentInstruments';
import { visualSkinClass } from '../visualSkin';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_balance_two_way' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void; variationSessionId?: string }
const formatError = (error: number) => `${(error * 100).toFixed(1)}%`;
const orientationLabel = { vertical: '세로 나누기', horizontal: '가로 나누기' } as const;

export function BalanceAssessmentScreen(props: Props) {
  const assessment = useBalanceAssessment(props);
  const draggingPointerRef = useRef<number | null>(null);
  const updateFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const result = normalizeDividerPosition({ orientation: assessment.orientation, clientX: event.clientX, clientY: event.clientY, rect: event.currentTarget.getBoundingClientRect() as RectLike });
    if (result.ok) assessment.moveDivider(result.ratio);
  };
  const { phase, trials, lastTrial, validTrials } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);

  if (phase === 'running') {
    const vertical = assessment.orientation === 'vertical';
    const progress = trials.length < 2 ? `${trials.length + 1} / 2` : `추가 측정 ${trials.length - 1}`;
    return <div className="screen balance-screen balance-running"><header className="progress-header"><span>3 / 5 · 균형 분배</span><span>{progress}</span></header><section className="balance-stage"><div className={`balance-area ${visualSkinClass(props.variationSessionId, 'day1_balance_two_way', trials.length)}`} role="slider" tabIndex={0} aria-label="구분선을 움직여 영역을 반으로 나누세요" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(assessment.dividerRatio * 100)} aria-orientation={vertical ? 'horizontal' : 'vertical'} onKeyDown={(event) => { const delta = vertical ? event.key === 'ArrowLeft' ? -0.01 : event.key === 'ArrowRight' ? 0.01 : 0 : event.key === 'ArrowUp' ? -0.01 : event.key === 'ArrowDown' ? 0.01 : 0; if (delta) { event.preventDefault(); assessment.moveDivider(assessment.dividerRatio + delta); } }} onPointerDown={(event) => { draggingPointerRef.current = event.pointerId; event.currentTarget.setPointerCapture?.(event.pointerId); updateFromPointer(event); }} onPointerMove={(event) => { if (draggingPointerRef.current === event.pointerId) updateFromPointer(event); }} onPointerUp={(event) => { if (draggingPointerRef.current === event.pointerId) draggingPointerRef.current = null; }} onPointerCancel={(event) => { if (draggingPointerRef.current === event.pointerId) draggingPointerRef.current = null; }}><span className={`balance-divider ${vertical ? 'vertical' : 'horizontal'}`} style={vertical ? { left: `${assessment.dividerRatio * 100}%` } : { top: `${assessment.dividerRatio * 100}%` }} /></div><p>선을 움직여 반으로 나눠보세요.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.confirmTrial}>여기서 나누기</PrimaryButton></div></div>;
  }
  if (phase === 'result' && lastTrial) {
    return <div className="screen balance-screen result-screen"><header className="progress-header"><span>3 / 5 · 균형 분배</span><span>{Math.min(trials.length, 2)} / 2</span></header><section className="trial-result" aria-live="polite">{lastTrial.valid ? <><div className={`balance-result-area ${visualSkinClass(props.variationSessionId, 'day1_balance_two_way', trials.length - 1)}`} aria-hidden="true"><span className={`balance-target ${lastTrial.orientation}`} /><span className={`balance-divider ${lastTrial.orientation}`} style={lastTrial.orientation === 'vertical' ? { left: `${lastTrial.observedRatio * 100}%` } : { top: `${lastTrial.observedRatio * 100}%` }} /></div><p className="divider-legend"><span>내가 나눈 위치</span><span>정확한 반</span></p><h1>반에서 약 {formatError(balanceError(lastTrial.observedRatio))} 벗어났습니다.</h1></> : <><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">{lastTrial.invalidReason === 'backgrounded' ? '화면을 벗어나서 이번 측정은 다시 해야 합니다.' : '측정 조건이 바뀌어 다시 시작해야 합니다.'}</p></>}</section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>{assessment.completion.status === 'retryAllowed' || !lastTrial.valid ? '다시 측정' : '다음 측정'}</PrimaryButton></div></div>;
  }
  if (phase === 'complete') {
    const meanError = validTrials.reduce((sum, trial) => sum + balanceError(trial.observedRatio), 0) / validTrials.length;
    const closer = closerOrientation(trials);
    return <div className="screen balance-screen summary-screen"><header className="progress-header"><span>세 번째 측정</span><span>3 / 5</span></header><section className="summary-content" aria-labelledby="balance-complete-title"><p className="eyebrow">측정 완료</p><h1 id="balance-complete-title">균형 분배 측정 완료</h1><div className="result-summary"><div><span>평균 분배 오차</span><strong>{formatError(meanError)}</strong></div><div><span>더 정확했던 방향</span><strong>{closer === null ? '확인 불가' : orientationLabel[closer]}</strong></div></div></section><div className="bottom-action"><PrimaryButton onClick={() => props.onComplete({ assessmentType: 'day1_balance_two_way', trials })}>다음 측정</PrimaryButton></div></div>;
  }
  if (phase === 'dateInvalidated' || phase === 'incomplete') {
    const dateChanged = phase === 'dateInvalidated';
    return <div className="screen balance-screen summary-screen"><section className="summary-content" role="alert"><p className="eyebrow">측정 다시 시작</p><h1>{dateChanged ? '날짜가 바뀌어서 측정을 다시 시작해야 합니다.' : '측정을 완료하지 못했습니다.'}</h1><p>{dateChanged ? '이전 날짜의 균형 측정 기록은 이어서 사용하지 않습니다.' : '균형 분배 측정을 처음부터 다시 시작해 주세요.'}</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.resetAssessment}>처음부터 다시</PrimaryButton></div></div>;
  }
  return <div className="screen balance-screen ready-screen"><header className="progress-header"><span>균형 분배</span><span>3 / 5</span></header><InstrumentReadyContent instrument={<BalanceInstrument />} eyebrow="세 번째 측정" titleId="balance-ready-title" title="균형 분배">영역이 정확히 반반이라고 느껴지는 곳에 선을 놓아주세요.<br />숫자로 재지 말고 눈대중으로 해보세요.</InstrumentReadyContent><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>시작하기</PrimaryButton></div></div>;
}
