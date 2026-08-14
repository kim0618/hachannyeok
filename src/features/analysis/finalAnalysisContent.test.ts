import { describe, expect, it } from 'vitest';
import type { Ability, CrossInsight, CrossInsightKey } from '../../domain/scoring/types';
import { day2Fixture, throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { crossInsightCopy, cumulativeEvidenceRows, selectPresentedCrossInsights } from './finalAnalysisContent';

const insight=(key:CrossInsightKey,ability:Ability):CrossInsight=>({key,ability,magnitude:1,contentKey:`cross.${key}`,supportingEvidenceKeys:[]});

describe('finalAnalysisContent',()=>{
  it('모든 Cross Insight contentKey를 사용자에게 노출하지 않고 의미 카피로 매핑한다',()=>{
    const keys:CrossInsightKey[]=['stableStrength','conditionSensitiveStrength','consistentWeakness','positiveUpdate','crossContextResilience'];
    for(const key of keys){const copy=crossInsightCopy({key,ability:'time',magnitude:1,contentKey:`cross.${key}`,supportingEvidenceKeys:[]});expect(copy).toContain('시간');expect(copy).not.toContain('cross.');}
  });
  it('같은 Center stability 의미 2개는 먼저 나온 하나만 표시한다',()=>expect(selectPresentedCrossInsights([insight('crossContextResilience','center'),insight('stableStrength','center')])).toEqual([insight('crossContextResilience','center')]));
  it('Center stability 다음 Balance sensitivity를 찾아 순서대로 2개 표시한다',()=>expect(selectPresentedCrossInsights([insight('stableStrength','center'),insight('crossContextResilience','center'),insight('conditionSensitiveStrength','balance')])).toEqual([insight('stableStrength','center'),insight('conditionSensitiveStrength','balance')]));
  it('서로 다른 Ability의 서로 다른 insight는 그대로 2개 표시한다',()=>{const candidates=[insight('stableStrength','center'),insight('positiveUpdate','focus')];expect(selectPresentedCrossInsights(candidates)).toEqual(candidates)});
  it('후보 1개는 1개만 표시한다',()=>{const candidates=[insight('consistentWeakness','time')];expect(selectPresentedCrossInsights(candidates)).toEqual(candidates)});
  it('후보 0개는 빈 배열로 fallback 조건을 유지한다',()=>expect(selectPresentedCrossInsights([])).toEqual([]));
  it('dedup 뒤에도 engine의 deterministic order를 유지한다',()=>expect(selectPresentedCrossInsights([insight('stableStrength','center'),insight('crossContextResilience','center'),insight('positiveUpdate','focus'),insight('conditionSensitiveStrength','balance')]).map(value=>value.key)).toEqual(['stableStrength','positiveUpdate']));
  it('DAY2~6 실제 raw evidence를 날짜별 비교값으로 만든다',()=>{
    const rows=cumulativeEvidenceRows(throughDay6Fixture.baseline!,throughDay6Fixture.dailyRecords);
    expect(rows.map(row=>row.key)).toEqual(['day2','day3','day4','day5','day6']);
    expect(rows.map(row=>row.value).join(' ')).not.toContain('유효');
  });
  it('raw 값이 달라지면 누적 DAY2 근거도 달라진다',()=>{
    if(day2Fixture.rawResult.assessmentType!=='day2_time_distraction')throw new Error('fixture mismatch');
    const changed={...day2Fixture,rawResult:{...day2Fixture.rawResult,trials:day2Fixture.rawResult.trials.map(trial=>trial.valid&&trial.condition==='distracted'?{...trial,observedDurationMs:3400}:trial)}};
    const before=cumulativeEvidenceRows(throughDay6Fixture.baseline!,throughDay6Fixture.dailyRecords).find(row=>row.key==='day2')?.value;
    const after=cumulativeEvidenceRows(throughDay6Fixture.baseline!,[changed,...throughDay6Fixture.dailyRecords.slice(1)]).find(row=>row.key==='day2')?.value;
    expect(after).not.toBe(before);expect(after).toContain('방해 400ms');
  });
});
