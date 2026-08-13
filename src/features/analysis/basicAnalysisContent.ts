import type { Day1RawResult } from '../../domain/assessment/results';
import { ABILITIES, type Ability, type CertificationTier, type ProfileResult } from '../../domain/scoring/types';

export const ABILITY_LABELS: Record<Ability, string> = { time: '시간', center: '중심', balance: '균형', control: '통제', focus: '집중' };

const HIGH_COPY: Record<Ability, string> = {
  time: '타이밍 감각은 날카롭지만', center: '중심은 잘 잡지만', balance: '균형은 잘 맞추지만',
  control: '손가락은 말을 잘 듣지만', focus: '눈썰미는 빠르지만',
};
const LOW_COPY: Record<Ability, string> = {
  time: '시간은 가끔 놓치는 인간', center: '정중앙은 가끔 비껴가는 인간', balance: '반반은 가끔 흔들리는 인간',
  control: '멈출 때를 조금 놓치는 인간', focus: '눈길이 가끔 새는 인간',
};

export const CERTIFICATION_LABELS: Record<Ability, Record<CertificationTier, string>> = {
  time: { special: '인간타이머 특급', grade1: '인간타이머 1급', grade2: '인간타이머 2급', grade3: '시간감각관찰사 3급', observer: '시계참고권장자' },
  center: { special: '화면중앙감별사 특급', grade1: '화면중앙감별사 1급', grade2: '화면중앙감별사 2급', grade3: '중심추정관찰사', observer: '중앙재확인권장자' },
  balance: { special: '피자공정분배사 특급', grade1: '피자공정분배사 1급', grade2: '피자공정분배사 2급', grade3: '균형분배관찰사', observer: '마지막조각양보권고자' },
  control: { special: '버튼정지관리사 특급', grade1: '버튼정지관리사 1급', grade2: '버튼정지관리사 2급', grade3: '손가락통제관찰사', observer: '버튼재확인대상' },
  focus: { special: '쓸데없는집중관리사 특급', grade1: '쓸데없는집중관리사 1급', grade2: '쓸데없는집중관리사 2급', grade3: '시각집중관찰사', observer: '주변관심분산형' },
};

export function profileAbilities(profile: ProfileResult): { high: Ability; low: Ability } | null {
  const [high, low, ...rest] = profile.profileFamilyKey.split('_');
  if (rest.length || !ABILITIES.includes(high as Ability) || !ABILITIES.includes(low as Ability)) return null;
  return { high: high as Ability, low: low as Ability };
}

export function profileDisplay(profile: ProfileResult): string | null {
  const abilities = profileAbilities(profile);
  return abilities ? `${HIGH_COPY[abilities.high]}\n${LOW_COPY[abilities.low]}` : null;
}

export function profileVariantDisplay(profileVariantKey: string): string {
  const [stability, tendency] = profileVariantKey.split(':', 2);
  if (stability === 'stable') return '꽤 일정한 편';
  if (tendency && tendency !== 'noTendency') return '조건에 따라 흔들리는 편';
  return '상황에 따라 달라지는 편';
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export interface MeasurementEvidence { ability: Ability; title: string; value: string }

export function summarizeDay1Evidence(results: readonly Day1RawResult[]): MeasurementEvidence[] {
  return results.map((result): MeasurementEvidence => {
    if (result.assessmentType === 'day1_time') {
      const trials = result.trials.filter((trial) => trial.valid);
      return { ability: 'time', title: '3초 감각', value: `평균 ${(mean(trials.map((trial) => trial.observedDurationMs)) / 1000).toFixed(3)}초 · 오차 ${(mean(trials.map((trial) => Math.abs(trial.observedDurationMs - trial.targetDurationMs))) / 1000).toFixed(3)}초` };
    }
    if (result.assessmentType === 'day1_center') {
      const trials = result.trials.filter((trial) => trial.valid);
      return { ability: 'center', title: '중심 인지', value: `평균 오차 ${(mean(trials.map((trial) => Math.hypot(trial.observed.x - trial.target.x, trial.observed.y - trial.target.y))) * 100).toFixed(1)}%` };
    }
    if (result.assessmentType === 'day1_balance_two_way') {
      const trials = result.trials.filter((trial) => trial.valid);
      return { ability: 'balance', title: '균형 분배', value: `평균 오차 ${(mean(trials.map((trial) => Math.abs(trial.observedRatio - trial.targetRatio))) * 100).toFixed(1)}%` };
    }
    if (result.assessmentType === 'day1_control_constant') {
      const trials = result.trials.filter((trial) => trial.valid);
      return { ability: 'control', title: '손가락 통제', value: `평균 정지 오차 ${(mean(trials.map((trial) => Math.abs(trial.observedPosition - trial.targetPosition))) * 100).toFixed(1)}%` };
    }
    const trials = result.trials.filter((trial) => trial.valid);
    const correct = trials.filter((trial) => trial.correct && trial.reactionTimeMs !== null);
    const reaction = correct.length ? ` · 평균 반응 ${(mean(correct.map((trial) => trial.reactionTimeMs!)) / 1000).toFixed(2)}초` : ' · 정답 반응 기록 없음';
    return { ability: 'focus', title: '시각 집중', value: `${trials.length}회 중 ${correct.length}회${reaction}` };
  });
}
