import { useEffect } from 'react';
import { PrimaryButton } from '../../../components/PrimaryButton';
import type { MeasurementClock } from '../time/useTimeTrial';
import { FocusShape } from './FocusShape';
import { useFocusAssessment, type FocusFrameScheduler } from './useFocusAssessment';
import type { Day1RawResult } from '../../../domain/assessment/results';
import type { LocalDateKey } from '../../../domain/progression/types';
import { toLocalDateKey } from '../../../domain/progression/localDate';
import { visualSkinClass } from '../visualSkin';

interface Props { onComplete: (result: Extract<Day1RawResult, { assessmentType: 'day1_focus_search' }>) => void; clock?: MeasurementClock; dateNow?: () => Date; createTrialId?: () => string; frameScheduler?: FocusFrameScheduler; baselineSessionDateKey?: LocalDateKey; onDateInvalidated?: () => void; variationSessionId?: string }
const formatReactionTime = (milliseconds: number) => `${(milliseconds / 1000).toFixed(2)}초`;
const formatTrialReactionTime = (milliseconds: number) => `${(milliseconds / 1000).toFixed(3)}초`;
const FOCUS_READY_DUMMY_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'triangle', 'diamond', 'circle', 'square', 'square', 'circle', 'diamond', 'triangle'] as const;

export function FocusAssessmentScreen(props: Props) {
  const assessment = useFocusAssessment(props);
  const { phase, trials, lastTrial, validTrials, activeConfig } = assessment;
  const { baselineSessionDateKey, onDateInvalidated, dateNow } = props;
  useEffect(() => {
    if (onDateInvalidated && (phase === 'dateInvalidated' || (baselineSessionDateKey && toLocalDateKey((dateNow ?? (() => new Date()))()) !== baselineSessionDateKey))) onDateInvalidated();
  }, [baselineSessionDateKey, dateNow, onDateInvalidated, phase]);
  if (phase === 'running') {
    const progress = trials.length < 3 ? `${trials.length + 1} / 3` : `추가 측정 ${trials.length - 2}`;
    return <div className="screen focus-screen focus-running focus-running-poster">
      <header className="progress-header"><span>시각 집중</span><span>{progress}</span></header>
      <section className="focus-running-content" aria-labelledby="focus-running-title">
        <div className="focus-running-heading"><span className="focus-heading-calibration" aria-hidden="true" /><h1 id="focus-running-title">목표 모양을 찾아<br /><strong>바로 눌러주세요</strong></h1></div>
        <div className="focus-target-cue" id="focus-cue"><span>찾을 모양</span><FocusShape shape={activeConfig.targetShape} /></div>
        <div className="focus-running-frame">
          <div className="focus-running-decoration" aria-hidden="true"><span className="focus-running-corners" /><span className="focus-running-ticks ticks-top" /><span className="focus-running-ticks ticks-bottom" /><span className="focus-running-side side-left" /><span className="focus-running-side side-right" /></div>
          <div className={`focus-grid ${visualSkinClass(props.variationSessionId, 'day1_focus_search', trials.length)}`} aria-label="시각 집중 선택지" aria-describedby="focus-cue">{activeConfig.items.map((item, index) => <button key={item.id} type="button" className="focus-item" aria-label={`선택지 ${index + 1}`} disabled={!assessment.interactive} onClick={() => assessment.selectItem(item.id)}><FocusShape shape={item.shape} /></button>)}</div>
        </div>
        <aside className="focus-running-note"><span className="note-focus" aria-hidden="true" /><div><strong>지정된 목표 모양을 가능한 한 빠르고 정확하게 선택하세요</strong><p>정확도와 반응 속도를 함께 측정합니다.</p></div></aside>
      </section>
      <div className="focus-running-status" aria-hidden="true" style={{ pointerEvents: 'none' }}><span />정확하게 찾아주세요<i>→</i></div>
    </div>;
  }
  if (phase === 'result' && lastTrial) {
    const progress = trials.length <= 3 ? `${trials.length} / 3` : `추가 측정 ${trials.length - 3}`;
    if (lastTrial.valid) {
      const reactionTime = lastTrial.reactionTimeMs === null ? '기록 없음' : formatTrialReactionTime(lastTrial.reactionTimeMs);
      return <div className="screen focus-screen result-screen focus-result-poster">
        <header className="progress-header"><span>시각 집중</span><span>{progress}</span></header>
        <section className="focus-trial-result" aria-live="polite" aria-labelledby="focus-result-title">
          <div className="focus-result-heading"><span className="focus-heading-calibration" aria-hidden="true" /><p>측정 완료</p><span>이번 선택 결과</span><h1 id="focus-result-title">{lastTrial.correct ? '정답' : '다른 항목 선택'}</h1><dl><dt>반응 시간</dt><dd>{reactionTime}</dd></dl></div>
          <div className="focus-result-frame">
            <div className="focus-result-decoration" aria-hidden="true"><span className="focus-running-corners" /><span className="focus-running-ticks ticks-top" /><span className="focus-running-ticks ticks-bottom" /><span className="focus-running-side side-left" /><span className="focus-running-side side-right" /></div>
            <div className={`focus-result-grid ${visualSkinClass(props.variationSessionId, 'day1_focus_search', trials.length - 1)}`} aria-label="시각 집중 결과 선택지">{activeConfig.items.map((item, index) => {
              const selected = item.id === lastTrial.selectedTargetId; const target = item.id === lastTrial.correctTargetId;
              return <div key={item.id} className={`focus-result-item${selected ? ' is-selected' : ''}${target ? ' is-target' : ''}`} aria-label={`선택지 ${index + 1}${selected ? ', 선택한 항목' : ''}${target ? ', 정답 항목' : ''}`}><FocusShape shape={item.shape} />{(selected || target) && <span className="focus-result-badges" aria-hidden="true">{selected && <i>선택</i>}{target && <b>정답</b>}</span>}</div>;
            })}</div>
          </div>
          <div className="focus-result-legend" aria-label="결과 표시 범례"><span className="selected">선택한 항목</span><span className="target">정답 항목</span><span className="neutral">다른 항목</span></div>
          <aside className="focus-result-note"><span className="note-focus" aria-hidden="true" /><div><strong>{lastTrial.correct ? '정확하게 찾았습니다.' : '이번에는 다른 모양을 선택했습니다.'}</strong><p>반응 시간은 <em>{reactionTime}</em>였습니다.<br />정확도와 반응 속도를 함께 측정합니다.</p></div></aside>
        </section>
        <div className="bottom-action focus-result-action"><PrimaryButton onClick={assessment.startTrial}>다음 측정</PrimaryButton></div>
      </div>;
    }
    return <div className="screen focus-screen result-screen"><header className="progress-header"><span>5 / 5 · 시각 집중</span><span>{progress}</span></header><section className="trial-result" aria-live="polite"><p className="eyebrow">다시 측정해 주세요</p><h1>이번 측정은 제외됩니다.</h1><p role="alert">화면을 벗어나서 이번 측정을 다시 해야 합니다.</p></section><div className="bottom-action"><PrimaryButton onClick={assessment.startTrial}>다시 측정</PrimaryButton></div></div>;
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
  return <div className="screen focus-screen ready-screen focus-ready-poster">
    <header className="progress-header"><span>시각 집중</span><span>5 / 5</span></header>
    <section className="focus-ready-content" aria-labelledby="focus-ready-title">
      <div className="focus-ready-heading"><span className="focus-heading-calibration" aria-hidden="true" /><h1 id="focus-ready-title">시각 집중</h1><p>여러 모양 중 지정된 목표를<br />빠르게 찾아주세요</p></div>
      <div className="focus-ready-preview" aria-hidden="true" style={{ pointerEvents: 'none' }}>
        <span className="focus-preview-corners" /><span className="focus-preview-ticks ticks-top" /><span className="focus-preview-ticks ticks-bottom" /><span className="focus-preview-side side-left" /><span className="focus-preview-side side-right" />
        <p>예시 화면 <small>(실제 측정과 무관한 예시입니다)</small></p><div className="focus-ready-matrix">{FOCUS_READY_DUMMY_SHAPES.map((shape, index) => <span key={`${shape}-${index}`} className="focus-ready-cell"><i className={`dummy-shape ${shape}`} /></span>)}</div>
      </div>
      <p className="sr-only">예시 화면은 실제 측정 문제와 무관합니다.</p>
      <aside className="focus-ready-note"><span className="note-focus" aria-hidden="true" /><div><strong>목표 모양을 빠르게 찾는 능력을 측정합니다</strong><p>정확도와 반응 시간을 함께 확인합니다.</p></div></aside>
    </section>
    <div className="bottom-action focus-ready-action"><PrimaryButton onClick={assessment.startTrial}>측정 시작</PrimaryButton></div>
  </div>;
}
