import { PrimaryButton } from '../../components/PrimaryButton';
import type { BalanceThreeWayTrial, BalanceTwoWayTrial } from '../../domain/assessment/trials';
import { threeWayError, twoWayError } from '../../domain/scoring/normalizers';
import type { DerivedAnalysis } from '../../domain/scoring/types';
import type { BaselineRecord, DailyRecord } from '../../domain/storage/types';
import { day4Segments } from '../assessment/day4Balance/day4BalanceConfig';
import { deriveTerminalDirection, hasCancellationAcrossTrials, hasMeaningfulThreeWayDegradation } from './day4Presentation';
import { DailyDiscoveryPanel } from './DailyDiscoveryPanel';

interface Props { baseline: BaselineRecord; record: DailyRecord; before: DerivedAnalysis; after: DerivedAnalysis; saveStatus: 'saving' | 'saved' | 'failed'; onRetrySave?: () => void; onHome?: () => void; onAnalysis?: () => void }
const mean = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export function Day4AnalysisScreen({ baseline, record, before, after, saveStatus, onRetrySave, onHome, onAnalysis }: Props) {
  const baselineResult = baseline.assessmentRawResults.find((result) => result.assessmentType === 'day1_balance_two_way');
  const baselineTrials = baselineResult?.assessmentType === 'day1_balance_two_way' ? baselineResult.trials.filter((trial): trial is Extract<BalanceTwoWayTrial, { valid: true }> => trial.valid) : [];
  const day4Trials = record.rawResult.assessmentType === 'day4_balance_three_way' ? record.rawResult.trials.filter((trial): trial is Extract<BalanceThreeWayTrial, { valid: true }> => trial.valid) : [];
  if (!baselineTrials.length || day4Trials.length < 2) return <div className="screen analysis-error"><section role="alert"><h1>분석에 필요한 기록을 계산하지 못했습니다.</h1></section></div>;
  const twoWayMean = mean(baselineTrials.map(twoWayError).filter((value): value is number => value !== null));
  const threeWayMean = mean(day4Trials.map(threeWayError).filter((value): value is number => value !== null));
  const trialSegments = day4Trials.map((trial) => day4Segments(trial.cutPositions));
  const averageSegments = [0, 1, 2].map((index) => mean(trialSegments.map((segments) => segments[index]!)));
  const terminalBias = averageSegments[2]! - 1 / 3;
  const terminalDirection = deriveTerminalDirection(terminalBias);
  const degradationEligible = hasMeaningfulThreeWayDegradation(twoWayMean, threeWayMean);
  const cancellation = hasCancellationAcrossTrials(trialSegments);
  const headline = degradationEligible ? '세 조각으로 나누면 균형 판단이 조금 더 흔들리는 편' : '세 조각으로 늘어나도 균형 감각은 꽤 안정적인 편';
  const terminalCopy = terminalDirection === 'large' ? '마지막 구간을 조금 크게 남기는 편이에요.' : terminalDirection === 'small' ? '마지막 구간을 조금 작게 남기는 편이에요.' : '세 구간에서 뚜렷하게 한쪽을 크게 또는 작게 남기는 편향은 없었어요.';
  const scoreChanged = before.scores.balance !== after.scores.balance;
  return <div className="screen analysis-screen daily-analysis day4-analysis"><header className="analysis-record-header"><span>쓸능검 · 추가 분석</span><span>DAY 4</span></header><main><DailyDiscoveryPanel day={4} insight={headline} nextTeaser="DAY 5에는 예상하지 못한 움직임에서 통제력이 어떻게 달라지는지 확인해요."><span className="analysis-chip">심화 분석 3/5</span></DailyDiscoveryPanel><section className="report-section"><div className="section-index">01 · TWO VS THREE</div><h2>2등분과 3등분 안정성</h2><div className="condition-cards"><div><span>DAY 1 · 2등분</span><strong>{pct(twoWayMean)}</strong><small>평균 분배 오차</small></div><div><span>DAY 4 · 3등분</span><strong>{pct(threeWayMean)}</strong><small>평균 분배 오차</small></div></div><p>{degradationEligible ? '두 조각일 때보다 세 조각에서 오차가 더 늘어났어요.' : '세 조각으로 늘어나도 오차 차이는 크지 않았어요.'}</p></section><section className="report-section"><div className="section-index">02 · ACTUAL SPLITS</div><h2>실제 분배</h2><div className="day4-segment-comparison" aria-label={`평균 분배: 첫 구간 ${pct(averageSegments[0]!)}, 가운데 구간 ${pct(averageSegments[1]!)}, 마지막 구간 ${pct(averageSegments[2]!)}`}>{trialSegments.map((segments, index) => <div key={day4Trials[index]!.trialId}><span>{index + 1}회차</span><strong>{segments.map((value) => pct(value)).join(' | ')}</strong></div>)}<div><span>내 평균</span><strong>{averageSegments.map((value) => pct(value)).join(' | ')}</strong><small>첫 구간 | 가운데 구간 | 마지막 구간</small></div><div><span>같은 분배</span><strong>33.3% | 33.3% | 33.3%</strong><small>비교 기준</small></div></div>{cancellation && <p>평균 분배는 비슷했지만, 시도마다 다른 방향으로 흔들린 부분이 있었어요.</p>}</section><section className="report-section"><div className="section-index">03 · LAST SEGMENT</div><h2>마지막 구간 편향</h2><p>{terminalCopy}</p></section><section className="report-section score-secondary"><div className="section-index">04 · BALANCE SCORE</div><h2>균형 분배 점수</h2>{scoreChanged ? <p className="score-change">{before.scores.balance} → {after.scores.balance}</p> : <p>균형 분배 점수는 그대로 유지됐어요.</p>}<p>시간·중심·통제·집중 점수는 기존 결과를 유지합니다.</p></section>{saveStatus === 'saving' && <p role="status" className="storage-status">추가 분석을 기기에 저장하고 있습니다.</p>}{saveStatus === 'failed' && <div role="alert" className="storage-warning"><p>추가 분석을 저장하지 못했습니다. 측정 결과는 그대로 유지됩니다.</p>{onRetrySave && <button className="secondary-button" onClick={onRetrySave}>다시 저장</button>}</div>}<div className="analysis-actions"><PrimaryButton disabled={!onHome} onClick={onHome}>홈으로</PrimaryButton>{onAnalysis && <button className="secondary-button" onClick={onAnalysis}>업데이트된 분석서 보기</button>}</div></main></div>;
}
