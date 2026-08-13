import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { MeasurementClock } from '../time/useTimeTrial';
import { FocusShape } from './FocusShape';
import { useFocusAssessment, type FocusFrameScheduler } from './useFocusAssessment';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_focus_search' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; frameScheduler?: FocusFrameScheduler; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void }
const formatReactionTime = (milliseconds: number) => `${(milliseconds / 1000).toFixed(2)}초`;

export function FocusAssessmentScreen(props: Props) {
  const assessment = useFocusAssessment(props);
  const { phase, trials, lastTrial, validTrials, activeConfig } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);
  if (phase === 'running') {
    const progress = trials.length < 3 ? `${trials.length + 1} / 3` : `추가 측정 ${trials.length - 2}`;
    return <div className="screen focus-screen focus-running"><header className="progress-header"><span>5 / 5 · 시각 집중</span><span>{progress}</span></header><section className="focus-stage" aria-labelledby="focus-cue"><div className="focus-cue"><p id="focus-cue">이 모양을 찾으세요</p><FocusShape shape={activeConfig.targetShape} /></div><div className="focus-grid" aria-label="시각 집중 선택지">{activeConfig.items.map((item, index) => <button key={item.id} type="button" className="focus-item" aria-label={`선택지 ${index + 1}`} disabled={!assessment.interactive} onClick={() => assessment.selectItem(item.id)}><FocusShape shape={item.shape} /></button>)}</div></section></div>;
  }
  if (phase === 'result' && lastTrial) {
    const progress = trials.length <= 3 ? `${trials.length} / 3` : `추가 측정 ${trials.length - 3}`;
    return <div className="screen focus-screen result-screen"><header className="progress-header"><span>5 / 5 · 시각 집중</span><span>{progress}</span></header><section className="trial-result" aria-live="polite">{lastTrial.valid ? <><p className="eyebrow">측정 결과</p><h1>{lastTrial.correct ? '찾았습니다.' : '다른 모양을 눌렀습니다.'}</h1><p>{formatReactionTime(lastTrial.reactionTimeMs ?? 0)}</p></> : <><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">화면을 벗어나서 이번 측정을 다시 해야 합니다.</p></>}</section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>{lastTrial.valid && assessment.completion.status !== 'retryAllowed' ? '다음 측정' : '다시 측정'}</PrimaryButton></div></div>;
  }
  if (phase === 'complete') {
    const correctTrials = validTrials.filter((trial) => trial.correct && trial.reactionTimeMs !== null);
    const meanReactionTimeMs = correctTrials.length === 0 ? null : correctTrials.reduce((sum, trial) => sum + (trial.reactionTimeMs ?? 0), 0) / correctTrials.length;
    return <div className="screen focus-screen summary-screen"><header className="progress-header"><span>다섯 번째 측정</span><span>5 / 5</span></header><section className="summary-content" aria-labelledby="focus-complete-title"><p className="eyebrow">측정 완료</p><h1 id="focus-complete-title">시각 집중 측정 완료</h1><div className="result-summary"><div><span>정답</span><strong>유효 측정 {validTrials.length}회 중 {correctTrials.length}회</strong></div><div><span>평균 반응 시간</span><strong>{meanReactionTimeMs === null ? '정답 기록 없음' : formatReactionTime(meanReactionTimeMs)}</strong></div></div></section><div className="bottom-action"><PrimaryButton onClick={() => props.onComplete({ assessmentType: 'day1_focus_search', trials })}>기본 분석 보기</PrimaryButton></div></div>;
  }
  if (phase === 'dateInvalidated' || phase === 'incomplete') {
    const dateChanged = phase === 'dateInvalidated';
    return <div className="screen focus-screen summary-screen"><section className="summary-content" role="alert"><p className="eyebrow">측정 다시 시작</p><h1>{dateChanged ? '날짜가 바뀌어서 측정을 다시 시작해야 합니다.' : '측정을 완료하지 못했습니다.'}</h1><p>{dateChanged ? '이전 날짜의 시각 집중 기록은 이어서 사용하지 않습니다.' : '시각 집중 측정을 처음부터 다시 시작해 주세요.'}</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.resetAssessment}>처음부터 다시</PrimaryButton></div></div>;
  }
  return <div className="screen focus-screen ready-screen"><header className="progress-header"><span>시각 집중</span><span>5 / 5</span></header><section className="ready-content" aria-labelledby="focus-ready-title"><p className="eyebrow">다섯 번째 측정</p><h1 id="focus-ready-title">시각 집중</h1><p>화면에서 지정된 모양을 최대한 빠르게 찾아 눌러주세요.<br />속도도 보지만, 정확하게 찾는 게 더 중요합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>시작하기</PrimaryButton></div></div>;
}
