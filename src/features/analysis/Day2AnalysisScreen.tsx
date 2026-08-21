import { PrimaryButton } from '../../components/PrimaryButton';
import type { TimeConditionTrial } from '../../domain/assessment/trials';
import type { DerivedAnalysis } from '../../domain/scoring/types';
import type { DailyRecord } from '../../domain/storage/types';
import { deriveTimeShiftDirection } from './day2TimeShift';
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

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const milliseconds = (value: number) => `${Math.round(value)}ms`;
const signedMilliseconds = (value: number) => `${value >= 0 ? '+' : ''}${Math.round(value)}ms`;

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
  return <div className="screen analysis-screen daily-analysis day2-analysis"><header className="analysis-record-header"><span>쓸능검 · 추가 분석</span><span>DAY 2</span></header><main><DailyDiscoveryPanel day={2} insight={hero} nextTeaser="DAY 3에는 시각 정보가 있을 때 중심 판단이 어떻게 달라지는지 확인해요.">{smallDifference && <p className="difference-summary">이번 조건 차이는 {milliseconds(Math.abs(delta))}로 작았어요.</p>}<span className="analysis-chip">심화 분석 1/5</span></DailyDiscoveryPanel><section className="report-section condition-comparison"><div className="section-index">01 · CONDITION DIFFERENCE</div><h2>평소와 방해 조건 비교</h2><div className="condition-cards"><div><span>평소</span><strong>{milliseconds(plainAbsolute)}</strong><small>평균 오차</small></div><div><span>방해</span><strong>{milliseconds(distractedAbsolute)}</strong><small>평균 오차</small></div></div><div className="condition-delta"><span>조건 차이</span><strong>{signedMilliseconds(delta)}</strong></div></section><section className="report-section"><div className="section-index">02 · INTERPRETATION</div><h2>근거 해석</h2><p>{interpretation}</p><p className="signed-detail">평소 signed error {signedMilliseconds(plainSigned)} · 방해 {signedMilliseconds(distractedSigned)}</p></section><section className="report-section score-secondary"><div className="section-index">03 · TIME SCORE</div><h2>시간 감각 점수</h2>{neutralDegradation && <p>평소보다 오차 폭이 커졌어요.</p>}{scoreChanged ? <p className="score-change">{before.scores.time} → {after.scores.time}</p> : <p>시간 감각 점수는 그대로 유지됐어요.</p>}<p>중심·균형·통제·집중 점수는 기존 결과를 유지합니다.</p></section>{saveStatus === 'saving' && <p role="status" className="storage-status">추가 분석을 기기에 저장하고 있습니다.</p>}{saveStatus === 'failed' && <div role="alert" className="storage-warning"><p>추가 분석을 저장하지 못했습니다. 측정 결과는 그대로 유지됩니다.</p>{onRetrySave && <button className="secondary-button" onClick={onRetrySave}>다시 저장</button>}</div>}<div className="analysis-actions"><PrimaryButton disabled={!onHome} onClick={onHome}>홈으로</PrimaryButton>{onAnalysis && <button className="secondary-button" onClick={onAnalysis}>업데이트된 분석서 보기</button>}</div></main></div>;
}
