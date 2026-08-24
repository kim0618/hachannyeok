import { type CSSProperties } from 'react';
import { DailyDiscoveryPanel } from '../../components/DailyDiscoveryPanel';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { TimeConditionTrial } from '../../domain/assessment/trials';
import type { DerivedAnalysis } from '../../domain/scoring/types';
import type { DailyRecord } from '../../domain/storage/types';
import { DAY2_TIME_TARGET_DURATION_MS } from '../assessment/day2Time/day2TimeConfig';
import { deriveTimeShiftDirection } from './day2TimeShift';

interface Props {
  record: DailyRecord;
  before: DerivedAnalysis;
  after: DerivedAnalysis;
  saveStatus: 'saving' | 'saved' | 'failed';
  onRetrySave?: () => void;
  onHome?: () => void;
  onAnalysis?: () => void;
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const preciseSeconds = (value: number) => `${(value / 1000).toFixed(3)}초`;
const signedSeconds = (value: number) => `${value > 0 ? '+' : ''}${preciseSeconds(value)}`;
const signedPosition = (value: number) => Math.max(5, Math.min(95, 50 + value / 6));

function AnalysisProgress() {
  const steps = [{ label: 'INTRO', state: 'complete' }, { label: 'PLAIN', state: 'complete' }, { label: 'DISTRACTED', state: 'complete' }, { label: 'ANALYSIS', state: 'active' }, { label: 'COMPLETE', state: 'pending' }] as const;
  return <ol className="day2-condition-progress" aria-label="DAY 2 진행 단계">{steps.map((step) => <li className={`is-${step.state}`} key={step.label} aria-current={step.state === 'active' ? 'step' : undefined}><span aria-hidden="true">{step.state === 'complete' ? '✓' : ''}</span><strong>{step.label}</strong></li>)}</ol>;
}

function SignedMiniScale({ value }: { value: number }) {
  return <div className="day2-analysis-mini-scale" aria-hidden="true" style={{ '--signed-position': `${signedPosition(value)}%` } as CSSProperties}><div /><i /><span>-0.300초</span><span>0</span><span>+0.300초</span><small>너무 빠름</small><small>정확</small><small>너무 늦음</small></div>;
}

export function Day2AnalysisScreen({ record, before, after, saveStatus, onRetrySave, onHome, onAnalysis }: Props) {
  const trials = record.rawResult.assessmentType === 'day2_time_distraction' ? record.rawResult.trials.filter((trial): trial is Extract<TimeConditionTrial, { valid: true }> => trial.valid) : [];
  const signed = (condition: 'plain' | 'distracted') => trials.filter((trial) => trial.condition === condition).map((trial) => trial.observedDurationMs - trial.targetDurationMs);
  const absolute = (condition: 'plain' | 'distracted') => signed(condition).map(Math.abs);
  const plainSigned = mean(signed('plain')); const distractedSigned = mean(signed('distracted'));
  const signedShift = distractedSigned - plainSigned;
  const plainAbsolute = mean(absolute('plain')); const distractedAbsolute = mean(absolute('distracted'));
  const delta = distractedAbsolute - plainAbsolute;
  const tendency = after.tendencies.find((item) => item.key === 'distractionSensitivity');
  const shiftDirection = deriveTimeShiftDirection(signedShift);
  if (shiftDirection === null) return <div className="screen analysis-error"><section role="alert"><h1>분석에 필요한 기록을 계산하지 못했습니다.</h1><p>저장된 측정 기록을 다시 확인해 주세요.</p></section></div>;
  const neutralDegradation = tendency?.eligible && tendency.direction === 'degraded' && shiftDirection === 'neutral';
  const smallDifference = !tendency?.eligible;
  const hero = tendency?.eligible
    ? tendency.direction === 'degraded'
      ? shiftDirection === 'earlier' ? '방해가 들어오면 시간이 조금 빨라지는 편' : shiftDirection === 'later' ? '방해가 들어오면 시간이 조금 늦어지는 편' : '방해가 있으면 오차 폭이 커지는 편'
      : '움직임이 있어도 시간 감각이 더 안정적인 편'
    : '움직임이 있어도 시간 감각은 거의 그대로';
  const scoreChanged = before.scores.time !== after.scores.time;
  const interpretation = !tendency?.eligible
    ? '이번 측정에서는 뚜렷한 편향이 확인되지 않았어요.'
    : neutralDegradation
      ? '방해 조건에서 시간 오차는 커졌지만, 빠르게 누르거나 늦게 누르는 한쪽 방향은 뚜렷하지 않았어요.'
      : shiftDirection === 'earlier'
        ? '방해가 들어오면 평소보다 빨리 누르는 방향이 확인됐어요.'
        : shiftDirection === 'later'
          ? '방해가 들어오면 평소보다 늦게 누르는 방향이 확인됐어요.'
          : '방해 조건에서도 빠름이나 늦음의 한쪽 방향은 뚜렷하지 않았어요.';
  const change = after.scores.time - before.scores.time;
  const deltaCopy = delta > 0 ? '방해 요소가 있을 때 시간 감각 오차가 더 커졌습니다.' : delta < 0 ? '방해 조건에서 시간 감각 오차가 더 작았습니다.' : '두 조건에서 같은 시간 감각 오차를 보였습니다.';
  const targetMs = trials[0]?.targetDurationMs ?? DAY2_TIME_TARGET_DURATION_MS;
  return <div className="screen analysis-screen daily-analysis day2-analysis day2-analysis-poster">
    <header className="day2-ready-masthead"><span className="day2-ready-back" aria-hidden="true">‹</span><div><strong>DAY 2</strong><h1>시간 감각 · 조건 비교</h1></div><span className="day2-ready-help" aria-hidden="true">?</span></header>
    <AnalysisProgress />
    <main>
      <section className="day2-analysis-complete"><span aria-hidden="true">▥</span><div><h2>분석 완료</h2><p>두 조건에서의 시간 감각 차이를 분석했습니다.</p></div></section>
      <header className="day2-analysis-heading"><h2>조건별 평균 오차</h2><p>목표 시간 {preciseSeconds(targetMs)} 기준</p></header>
      <section className="day2-analysis-condition-grid" aria-label="조건별 평균 오차 비교">
        <article className="is-plain"><span className="condition-icon" aria-hidden="true">♧</span><h3>기본 조건 · PLAIN</h3><p>평균 오차 (|초|)</p><strong>{preciseSeconds(plainAbsolute)}</strong><small>시도 {signed('plain').length}회</small><SignedMiniScale value={plainSigned} /></article>
        <article className="is-distracted"><span className="condition-icon" aria-hidden="true">◉</span><h3>방해 조건 · DISTRACTED</h3><p>평균 오차 (|초|)</p><strong>{preciseSeconds(distractedAbsolute)}</strong><small>시도 {signed('distracted').length}회</small><SignedMiniScale value={distractedSigned} /></article>
      </section>
      <section className="day2-analysis-delta"><div><p>조건 차이 <small>(DISTRACTED − PLAIN)</small></p><strong>{signedSeconds(delta)}</strong></div><div><p>{deltaCopy}</p><span>{delta > 0 ? '오차 증가' : delta < 0 ? '오차 감소' : '차이 없음'}</span></div></section>
      <section className="day2-analysis-interpretation"><span aria-hidden="true">◎</span><div><h2>짧은 해석</h2><strong>{hero}</strong><p>{interpretation}</p>{smallDifference && <small>이번 조건 차이는 {preciseSeconds(Math.abs(delta))}로 작았어요.</small>}<small className="signed-detail">기본 signed error {signedSeconds(plainSigned)} · 방해 {signedSeconds(distractedSigned)}</small></div></section>
      <section className="day2-analysis-score"><h2>TIME 능력 변화</h2><div><span aria-hidden="true">◷</span><dl><div><dt>기존 TIME</dt><dd>{before.scores.time}</dd></div><i aria-hidden="true">→</i><div><dt>현재 TIME</dt><dd>{after.scores.time}</dd></div><strong aria-label={`변화량 ${change > 0 ? '+' : ''}${change}`}>{change > 0 ? '+' : ''}{change}</strong><p>조건 비교 결과를 반영한 기존 scoring 결과입니다.<br />(±8 범위 내 조정)</p></dl></div>{!scoreChanged && <small>시간 감각 점수는 그대로 유지됐어요.</small>}{neutralDegradation && <small>평소보다 오차 폭이 커졌어요.</small>}</section>
      <DailyDiscoveryPanel day={2} totalDays={7} insight={hero} nextTeaser="DAY 3에는 시각 정보가 있을 때 중심 판단이 어떻게 달라지는지 확인해요." />
      {saveStatus === 'saving' && <p role="status" className="storage-status">추가 분석을 기기에 저장하고 있습니다.</p>}{saveStatus === 'failed' && <div role="alert" className="storage-warning"><p>추가 분석을 저장하지 못했습니다. 측정 결과는 그대로 유지됩니다.</p>{onRetrySave && <button className="secondary-button" onClick={onRetrySave}>다시 저장</button>}</div>}
      <div className="day2-analysis-actions"><PrimaryButton disabled={!onHome} onClick={onHome}>분석 결과 확인 완료</PrimaryButton>{onAnalysis && <button className="secondary-button" onClick={onAnalysis}>업데이트된 분석서 보기</button>}<p>모든 데이터는 안전하게 저장되며 분석에만 사용됩니다.</p></div>
    </main>
  </div>;
}
