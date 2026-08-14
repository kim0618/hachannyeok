import { describe, expect, it } from 'vitest';
import type { DailyRawResult } from '../assessment/results';
import { baselineFixture } from '../../test/day1Fixture';
import { throughDay4Fixture } from '../../test/dailyThroughDay4Fixture';
import { CALIBRATION_VERSION } from './calibration';
import { applyDailyModifier, deriveDailyModifier } from './dailyModifier';
import { deriveAnalysis } from './deriveAnalysis';
import { DAY5_CONTROL_TRIAL_CONFIGS } from '../assessment/day5ControlConfig';
import { DAY6_EXPOSURE_DURATION_MS, day6ConfigForAttempt } from '../assessment/day6SpatialMemoryConfig';

const valid = { startedAtMs: 0, completedAtMs: 1, valid: true as const, invalidReason: null };
const baseline = baselineFixture.assessmentRawResults;
const day5 = (predictable: number, surprise: number): Extract<DailyRawResult, { assessmentType: 'day5_control_surprise' }> => ({
  assessmentType: 'day5_control_surprise',
  trials: DAY5_CONTROL_TRIAL_CONFIGS.map((config, index) => ({ ...valid, ...config, trialId: `d5-${index}`, kind: 'controlCondition' as const, observedPosition: config.targetPosition + (config.condition === 'predictable' ? predictable : surprise) })),
});
const score = (result: DailyRawResult, baselineScore: number) => {
  const modifier = deriveDailyModifier(baseline, result);
  expect(modifier.ok).toBe(true);
  if (!modifier.ok) throw new Error(modifier.reason);
  return { ...modifier.value, score: applyDailyModifier(baselineScore, modifier.value.delta) };
};

describe('DAILY Ability Scoring V2', () => {
  it('공통 positive/negative/neutral modifier와 ±8 cap을 적용한다', () => {
    expect(applyDailyModifier(50, 0)).toBe(50);
    expect(applyDailyModifier(50, 3)).toBe(53);
    expect(applyDailyModifier(50, -3)).toBe(47);
    expect(applyDailyModifier(50, 100)).toBe(58);
    expect(applyDailyModifier(50, -100)).toBe(42);
    expect(applyDailyModifier(98, 8)).toBe(100);
  });

  it('DAY 2 plain 대비 distracted condition effect로 Time만 갱신한다', () => {
    const result: Extract<DailyRawResult, { assessmentType: 'day2_time_distraction' }> = { assessmentType: 'day2_time_distraction', trials: ['plain','distracted','plain','distracted'].map((condition,index) => ({ ...valid, trialId:`t${index}`, kind:'timeCondition' as const, condition:condition as 'plain'|'distracted', targetDurationMs:3000 as const, observedDurationMs:condition === 'plain' ? 3100 : 3400 })) };
    expect(score(result, 90)).toMatchObject({ ability: 'time', delta: -2, score: 88 });
  });

  it('DAY 3 plain 대비 decorated condition effect로 Center만 갱신한다', () => {
    const result: Extract<DailyRawResult, { assessmentType: 'day3_decorated_center' }> = { assessmentType:'day3_decorated_center', trials:(['plain','decoratedLeft','decoratedRight'] as const).map((condition,index)=>({ ...valid, trialId:`c${index}`, kind:'centerCondition' as const, condition, decorationSide:(['none','left','right'] as const)[index]!, stimulusId:(['day3-plain-01','day3-left-01','day3-right-01'] as const)[index]!, target:{x:.5,y:.5}, observed:{x:.5+(condition === 'plain' ? .01 : .11),y:.5} })) };
    expect(score(result, 90)).toMatchObject({ ability: 'center', delta: -3, score: 87 });
  });

  it('DAY 4 DAY 1 two-way 대비 three-way condition effect로 Balance만 갱신한다', () => {
    const result: Extract<DailyRawResult, { assessmentType: 'day4_balance_three_way' }> = { assessmentType:'day4_balance_three_way', trials:[1,2].map(index=>({ ...valid, trialId:`b${index}`, kind:'balanceThreeWay' as const, cutPositions:[.2,.6] as [number,number] })) };
    const modifier = deriveDailyModifier(baseline, result);
    expect(modifier.ok).toBe(true);
    if (modifier.ok) expect(modifier.value).toMatchObject({ ability:'balance', delta:-3 });
  });

  it.each([[.02,.02,0,94],[.19,.19,0,94],[.02,.10,-3,91]] as const)('DAY 5 CASE reference %f challenge %f', (predictable, surprise, delta, expected) => {
    expect(score(day5(predictable, surprise), 94)).toMatchObject({ ability:'control', delta, score:expected });
  });

  it('DAY 5 positive condition effect를 허용한다', () => {
    expect(score(day5(.10,.05), 94)).toMatchObject({ ability:'control', delta:2, score:96 });
  });

  it('DAY 5 QA 18/18/20/20은 19/19 neutral이라 baseline 94를 유지한다', () => {
    const result = day5(.18,.18);
    const third = result.trials[2]!; const fourth = result.trials[3]!;
    if (!third.valid || !fourth.valid) throw new Error('fixture');
    result.trials[2] = { ...third, observedPosition: third.targetPosition + .20 };
    result.trials[3] = { ...fourth, observedPosition: fourth.targetPosition + .20 };
    expect(score(result, 94)).toMatchObject({ conditionEffectNormalized:0, delta:0, score:94 });
  });

  it.each([[.02,.10,-2],[.10,.02,2],[.05,.05,0]] as const)('DAY 6 Focus V2 reference %f challenge %f',(spread,clustered,delta)=>{const result:Extract<DailyRawResult,{assessmentType:'day6_spatial_memory'}>={assessmentType:'day6_spatial_memory',trials:[0,1].map(index=>({...valid,trialId:`m${index}`,kind:'spatialMemory' as const,shownPositions:day6ConfigForAttempt(index).map(point=>({...point})),selectedPositions:day6ConfigForAttempt(index).map(point=>({x:point.x+(index===0?spread:clustered),y:point.y})),exposureDurationMs:DAY6_EXPOSURE_DURATION_MS,responseTimeMs:500}))};expect(score(result,68)).toMatchObject({ability:'focus',delta,score:68+delta});});

  it('항상 DAY 1 baseline에 적용하며 현재 점수에 누적하지 않는다', () => {
    const modifier = score(day5(.02,.10), 94);
    expect(modifier.score).toBe(91);
    expect(applyDailyModifier(94, modifier.delta)).toBe(91);
  });

  it('persisted raw V2 replay와 overall/profile/certification이 결정적이고 다른 Ability는 유지된다', () => {
    const first = deriveAnalysis(throughDay4Fixture); const second = deriveAnalysis(structuredClone(throughDay4Fixture));
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.value.calibrationVersion).toBe(2);
      expect(first.value.scores.control).toBe(first.value.baselineScores.control);
      expect(first.value.scores.focus).toBe(first.value.baselineScores.focus);
      expect(first.value.overallScore).toBeTypeOf('number');
      expect(first.value.profile.profileFamilyKey).toBeTypeOf('string');
      expect(first.value.certifications.control).toBeTypeOf('string');
    }
  });

  it('CALIBRATION_VERSION은 2다', () => expect(CALIBRATION_VERSION).toBe(2));
});
