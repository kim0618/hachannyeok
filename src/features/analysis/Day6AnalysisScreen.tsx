import { PrimaryButton } from '../../components/PrimaryButton';
import { isDay6SpreadAttempt } from '../../domain/assessment/day6SpatialMemoryConfig';
import type { SpatialMemoryTrial } from '../../domain/assessment/trials';
import { matchingMeanDistance } from '../../domain/scoring/normalizers';
import type { DerivedAnalysis } from '../../domain/scoring/types';
import type { DailyRecord } from '../../domain/storage/types';
import { DailyDiscoveryPanel } from './DailyDiscoveryPanel';

interface Props {
  record: DailyRecord;
  before: DerivedAnalysis;
  after: DerivedAnalysis;
  saveStatus: 'saving' | 'saved' | 'failed';
  onRetrySave?: () => void;
  onHome?: () => void;
  onAnalysis?: () => void;
}

const mean = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const delta = (value: number) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%p`;

export function Day6AnalysisScreen({ record, before, after, saveStatus, onRetrySave, onHome, onAnalysis }: Props) {
  const indexedTrials = record.rawResult.assessmentType === 'day6_spatial_memory'
    ? record.rawResult.trials.map((trial, attemptIndex) => ({ trial, attemptIndex }))
    : [];
  const errors = (spreadAttempt: boolean) => indexedTrials.flatMap(({ trial, attemptIndex }) =>
    trial.valid && isDay6SpreadAttempt(attemptIndex) === spreadAttempt
      ? [matchingMeanDistance(trial as Extract<SpatialMemoryTrial, { valid: true }>)!]
      : [],
  );
  const spread = errors(true);
  const clustered = errors(false);

  if (!spread.length || !clustered.length) {
    return <div className="screen analysis-error"><section role="alert"><h1>분석에 필요한 기록을 계산하지 못했습니다.</h1></section></div>;
  }

  const spreadMean = mean(spread);
  const clusteredMean = mean(clustered);
  const change = clusteredMean - spreadMean;
  const tendency = after.tendencies.find((item) => item.key === 'spatialMemorySupport');
  const eligible = Boolean(tendency?.eligible);
  const headline = !eligible
    ? '위치가 가까워져도 기억 정확도는 거의 그대로였어요.'
    : change > 0
      ? '위치가 서로 가까워지면 기억 지점이 조금 더 흔들리는 편'
      : '위치가 가까이 모여도 기억 지점은 더 정확한 편';
  const scoreChanged = before.scores.focus !== after.scores.focus;

  return <div className="screen analysis-screen daily-analysis day6-analysis">
    <header className="analysis-record-header"><span>쓸능검 · 추가 분석</span><span>DAY 6</span></header>
    <main>
      <DailyDiscoveryPanel day={6} insight={headline} nextTeaser="DAY 7에는 누적 기록을 바탕으로 마지막 보정을 확인해요."><span className="analysis-chip">심화 분석 5/5</span></DailyDiscoveryPanel>
      <section className="report-section day6-memory-analysis-section">
        <div className="section-index">01 · SPATIAL MEMORY</div><h2>공간 기억 조건 비교</h2>
        <div className="condition-cards"><div><span>넓은 배치 · SPREAD</span><strong>{pct(spreadMean)}</strong><small>평균 위치 오차</small></div><div><span>밀집 배치 · CLUSTERED</span><strong>{pct(clusteredMean)}</strong><small>평균 위치 오차</small></div></div>
        <div className="condition-delta"><span>{eligible ? (change > 0 ? '오차 증가' : '오차 감소') : '변화 거의 없음'}</span><strong>{delta(change)}</strong></div>
      </section>
      <section className="report-section score-secondary"><div className="section-index">02 · FOCUS SCORE</div><h2>시각 집중 점수</h2>{scoreChanged ? <p className="score-change">{before.scores.focus} → {after.scores.focus}</p> : <p>시각 집중 점수는 그대로 유지됐어요.</p>}<p>시간·중심·균형·통제 점수는 기존 결과를 유지합니다.</p></section>
      {saveStatus === 'saving' && <p role="status" className="storage-status">추가 분석을 기기에 저장하고 있습니다.</p>}
      {saveStatus === 'failed' && <div role="alert" className="storage-warning"><p>추가 분석을 저장하지 못했습니다. 측정 결과는 그대로 유지됩니다.</p>{onRetrySave && <button className="secondary-button" onClick={onRetrySave}>다시 저장</button>}</div>}
      <div className="analysis-actions"><PrimaryButton disabled={!onHome} onClick={onHome}>홈으로</PrimaryButton>{onAnalysis && <button className="secondary-button" onClick={onAnalysis}>업데이트된 분석서 보기</button>}</div>
    </main>
  </div>;
}
