import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import type { DailyRecord, PersistedAppData } from '../../domain/storage/types';
import { baselineFixture } from '../../test/day1Fixture';
import { Day2AnalysisScreen } from './Day2AnalysisScreen';
import { deriveTimeShiftDirection } from './day2TimeShift';

const makeRecord = (plain: [number, number], distracted: [number, number]): DailyRecord => ({
  recordId: 'd2:day2', sessionId: 'd2', analysisDay: 2, assessmentType: 'day2_time_distraction',
  startedAt: '2026-08-13T01:00:00.000Z', completedAt: '2026-08-13T01:01:00.000Z', localDateKey: '2026-08-13',
  rawResult: { assessmentType: 'day2_time_distraction', trials: ['plain', 'distracted', 'plain', 'distracted'].map((condition, index) => ({ kind: 'timeCondition' as const, condition: condition as 'plain' | 'distracted', targetDurationMs: 3000 as const, observedDurationMs: condition === 'plain' ? plain[Math.floor(index / 2)]! : distracted[Math.floor(index / 2)]!, trialId: `d2-${index}`, startedAtMs: index * 5000, completedAtMs: index * 5000 + 3000, valid: true as const, invalidReason: null })) },
});

const baselineRoot: PersistedAppData = { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} };

function renderResult(record: DailyRecord, onHome = () => undefined) {
  const before = deriveAnalysis(baselineRoot); const after = deriveAnalysis({ ...baselineRoot, dailyRecords: [record] });
  if (!before.ok || !after.ok) throw new Error('fixture must derive');
  render(<Day2AnalysisScreen record={record} before={before.value} after={after.value} saveStatus="saved" onHome={onHome} />);
  return { before: before.value, after: after.value };
}

describe('Day2AnalysisScreen', () => {
  it('signed shift 방향을 exact 3-state로 분리한다', () => {
    expect(deriveTimeShiftDirection(-1)).toBe('earlier');
    expect(deriveTimeShiftDirection(1)).toBe('later');
    expect(deriveTimeShiftDirection(0)).toBe('neutral');
    expect(deriveTimeShiftDirection(Number.NaN)).toBeNull();
    expect(deriveTimeShiftDirection(Number.POSITIVE_INFINITY)).toBeNull();
  });
  it('eligible tendency의 late 방향과 baseline score 변화를 표시한다', () => {
    const values = renderResult(makeRecord([3000, 3000], [4100, 4100]));
    expect(screen.getByText(/시간이 조금 늦어지는 편/)).toBeInTheDocument();
    expect(screen.getByText(/평소보다 늦게/)).toBeInTheDocument();
    expect(screen.getByText('기존 TIME').nextElementSibling).toHaveTextContent(String(values.before.scores.time));
    expect(screen.getByText('현재 TIME').nextElementSibling).toHaveTextContent(String(values.after.scores.time));
    expect(screen.getByLabelText(`변화량 ${values.after.scores.time - values.before.scores.time}`)).toBeInTheDocument();
  });
  it('eligible degradation과 neutral signed direction을 함께 보존한다', () => {
    const record = makeRecord([2900, 3100], [2600, 3400]);
    const values = renderResult(record);
    const tendency = values.after.tendencies.find((item) => item.key === 'distractionSensitivity');
    expect(tendency).toMatchObject({ eligible: true, direction: 'degraded' });
    expect(screen.getByText('방해가 있으면 오차 폭이 커지는 편')).toBeInTheDocument();
    expect(screen.getByText(/한쪽 방향은 뚜렷하지 않았어요/)).toBeInTheDocument();
    expect(screen.getByText('평소보다 오차 폭이 커졌어요.')).toBeInTheDocument();
    expect(screen.queryByText(/평소보다 빨리 누르는 방향/)).not.toBeInTheDocument();
    expect(screen.queryByText(/평소보다 늦게 누르는 방향/)).not.toBeInTheDocument();
    const replay = deriveAnalysis({ ...baselineRoot, dailyRecords: [record] });
    expect(replay.ok && replay.value).toEqual(values.after);
  });
  it('eligible tendency의 earlier 방향을 유지한다', () => {
    renderResult(makeRecord([3000, 3000], [1900, 1900]));
    expect(screen.getByText(/시간이 조금 빨라지는 편/)).toBeInTheDocument();
    expect(screen.getByText(/평소보다 빨리/)).toBeInTheDocument();
  });
  it('threshold 미달이면 fallback과 점수 유지 문구를 표시한다', () => {
    const values = renderResult(makeRecord([3000, 3000], [3000, 3000]));
    expect(screen.getByText(/거의 그대로/)).toBeInTheDocument();
    expect(screen.getByText('이번 측정에서는 뚜렷한 편향이 확인되지 않았어요.')).toBeInTheDocument();
    if (values.before.scores.time === values.after.scores.time) expect(screen.getByText('시간 감각 점수는 그대로 유지됐어요.')).toBeInTheDocument();
  });
  it('작은 양의 조건 차이를 초 단위 비교 카드로 보여주고 점수는 기존 결과로 둔다', () => {
    const values = renderResult(makeRecord([3030, 3040], [3040, 3050]));
    expect(screen.getByText('0.035초')).toBeInTheDocument();
    expect(screen.getByText('0.045초')).toBeInTheDocument();
    expect(screen.getByText('+0.010초')).toBeInTheDocument();
    expect(screen.getByText('이번 조건 차이는 0.010초로 작았어요.')).toBeInTheDocument();
    expect(screen.getByText('오차 증가')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'TIME 능력 변화' })).toBeInTheDocument();
    expect(values.after.scores.time).toBe(values.before.scores.time);
    expect(screen.getByText('시간 감각 점수는 그대로 유지됐어요.')).toBeInTheDocument();
    expect(screen.queryByText('점수는 오차뿐 아니라 측정 일관성도 함께 반영해요.')).not.toBeInTheDocument();
    const replay = deriveAnalysis({ ...baselineRoot, dailyRecords: [makeRecord([3030, 3040], [3040, 3050])] });
    expect(replay.ok && replay.value).toEqual(values.after);
  });
  it('음의 조건 차이는 오차 감소로, 동률은 차이 없음으로 중립 표시한다', () => {
    renderResult(makeRecord([3400, 3400], [3100, 3100]));
    expect(screen.getAllByText('-0.300초')).toHaveLength(3);
    expect(screen.getByText('오차 감소')).toBeInTheDocument();
    expect(screen.getByText('방해 조건에서 시간 감각 오차가 더 작았습니다.')).toBeInTheDocument();
    cleanup();
    renderResult(makeRecord([3200, 3200], [2800, 2800]));
    expect(screen.getByText('차이 없음')).toBeInTheDocument();
    expect(screen.getByText('두 조건에서 같은 시간 감각 오차를 보였습니다.')).toBeInTheDocument();
  });
  it('완료 CTA가 기존 onHome callback을 직접 호출한다', () => {
    const onHome = vi.fn();
    renderResult(makeRecord([3000, 3000], [3000, 3000]), onHome);
    fireEvent.click(screen.getByRole('button', { name: '분석 결과 확인 완료' }));
    expect(onHome).toHaveBeenCalledOnce();
  });
});
