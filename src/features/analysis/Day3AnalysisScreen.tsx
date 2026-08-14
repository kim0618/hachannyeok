import { PrimaryButton } from '../../components/PrimaryButton';
import type { CenterConditionTrial, CenterTrial } from '../../domain/assessment/trials';
import type { DerivedAnalysis } from '../../domain/scoring/types';
import type { BaselineRecord, DailyRecord } from '../../domain/storage/types';
interface Props { baseline: BaselineRecord; record: DailyRecord; before: DerivedAnalysis; after: DerivedAnalysis; saveStatus: 'saving' | 'saved' | 'failed'; onRetrySave?: () => void; onHome?: () => void; onAnalysis?: () => void }
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const pointMean = (points: readonly { x: number; y: number }[]) => ({ x: mean(points.map((p) => p.x)), y: mean(points.map((p) => p.y)) });
const error = (point: { x: number; y: number }) => Math.hypot(point.x - .5, point.y - .5);
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const directionLabels = { left: '왼쪽', right: '오른쪽', up: '위쪽', down: '아래쪽', neutral: '한쪽 방향 없음' } as const;
export function Day3AnalysisScreen({ baseline, record, before, after, saveStatus, onRetrySave, onHome, onAnalysis }: Props) {
  const baselineResult = baseline.assessmentRawResults.find((result) => result.assessmentType === 'day1_center');
  const validBaseline = baselineResult?.assessmentType === 'day1_center' ? baselineResult.trials.filter((trial): trial is Extract<CenterTrial, { valid: true }> => trial.valid) : [];
  const validDay3 = record.rawResult.assessmentType === 'day3_decorated_center' ? record.rawResult.trials.filter((trial): trial is Extract<CenterConditionTrial, { valid: true }> => trial.valid) : [];
  if (validBaseline.length === 0 || validDay3.length < 3) return <div className="screen analysis-error"><section role="alert"><h1>분석에 필요한 기록을 계산하지 못했습니다.</h1></section></div>;
  const baselinePoint = pointMean(validBaseline.map((trial) => trial.observed));
  const decorated = validDay3.filter((trial) => trial.condition !== 'plain'); const decoratedPoint = pointMean(decorated.map((trial) => trial.observed));
  const decoratedError = mean(decorated.map((trial) => error(trial.observed)));
  const plain = validDay3.find((trial) => trial.condition === 'plain')!;
  const referenceError = error(plain.observed);
  const shifts = decorated.map((trial) => ({ x: trial.observed.x - plain.observed.x, y: trial.observed.y - plain.observed.y }));
  const shiftMagnitude = mean(shifts.map((shift) => Math.hypot(shift.x, shift.y)));
  const tendency = after.tendencies.find((item) => item.key === 'visualBias'); const direction = tendency?.direction as keyof typeof directionLabels | undefined;
  const neutral = direction === 'neutral'; const eligible = Boolean(tendency?.eligible);
  const headline = !eligible ? '주변 정보가 있어도 중심 감각은 거의 그대로' : neutral ? '주변 정보가 있으면 중심 위치가 흔들리는 편' : `주변 정보가 있으면 중심이 ${directionLabels[direction!]}으로 조금 끌리는 편`;
  const scoreChanged = before.scores.center !== after.scores.center;
  return <div className="screen analysis-screen daily-analysis day3-analysis"><header className="analysis-record-header"><span>쓸능검 · 추가 분석</span><span>DAY 3</span></header><main><section className="analysis-hero"><p className="eyebrow">오늘 새로 확인한 것</p><h1>{headline}</h1><span className="analysis-chip">심화 분석 2/5</span></section><section className="report-section"><div className="section-index">01 · VISUAL GUIDANCE</div><h2>무장식과 시각 유도 비교</h2><div className="condition-cards"><div><span>무장식</span><strong>{pct(referenceError)}</strong><small>DAY 3 plain 평균 중심 오차</small></div><div><span>시각 유도</span><strong>{pct(decoratedError)}</strong><small>장식 조건 평균 중심 오차</small></div></div><div className="condition-delta"><span>중심 이동</span><strong>{direction ? `${directionLabels[direction]} · ${pct(shiftMagnitude)}` : pct(shiftMagnitude)}</strong></div><div className="center-comparison-diagram" role="img" aria-label="중심 비교 다이어그램. DAY 1 평균 위치, DAY 3 장식 조건 평균 위치, 실제 중심 위치를 비교합니다."><span className="diagram-true" /><span className="diagram-baseline" style={{ left: `${baselinePoint.x * 100}%`, top: `${baselinePoint.y * 100}%` }} /><span className="diagram-day3" style={{ left: `${decoratedPoint.x * 100}%`, top: `${decoratedPoint.y * 100}%` }} /></div><p className="marker-legend day3-diagram-legend"><span className="day3-legend-baseline">DAY 1 평균</span><span className="day3-legend-day3">DAY 3 장식 평균</span><span className="day3-legend-true">실제 중심</span></p></section><section className="report-section"><div className="section-index">02 · INTERPRETATION</div><h2>근거 해석</h2><p>{!eligible ? '이번 측정에서는 주변 정보에 따른 뚜렷한 중심 이동이 확인되지 않았어요.' : neutral ? '주변 정보 때문에 중심 위치는 흔들렸지만, 한쪽 방향으로 뚜렷하게 끌리지는 않았어요.' : `주변 정보가 있을 때 중심 판단이 ${directionLabels[direction!]} 방향으로 이동했어요.`}</p></section><section className="report-section score-secondary"><div className="section-index">03 · CENTER SCORE</div><h2>중심 감각 점수</h2>{scoreChanged ? <p className="score-change">{before.scores.center} → {after.scores.center}</p> : <p>중심 감각 점수는 그대로 유지됐어요.</p>}<p>시간·균형·통제·집중 점수는 기존 결과를 유지합니다.</p></section>{saveStatus === 'saving' && <p role="status" className="storage-status">추가 분석을 기기에 저장하고 있습니다.</p>}{saveStatus === 'failed' && <div role="alert" className="storage-warning"><p>추가 분석을 저장하지 못했습니다. 측정 결과는 그대로 유지됩니다.</p>{onRetrySave && <button className="secondary-button" onClick={onRetrySave}>다시 저장</button>}</div>}<div className="analysis-actions"><PrimaryButton disabled={!onHome} onClick={onHome}>홈으로</PrimaryButton>{onAnalysis && <button className="secondary-button" onClick={onAnalysis}>업데이트된 분석서 보기</button>}</div></main></div>;
}
