import { describe, expect, it } from 'vitest';
import { selectRepresentativeCertification } from './representativeCertification';
import type { AbilityScores, CertificationTier } from './types';

const scores: AbilityScores = { time: 70, center: 99, balance: 88, control: 77, focus: 66 };
const observer = { time: 'observer', center: 'observer', balance: 'observer', control: 'observer', focus: 'observer' } satisfies Record<keyof AbilityScores, CertificationTier>;

describe('selectRepresentativeCertification', () => {
  it('점수보다 tier를 먼저 비교한다', () => expect(selectRepresentativeCertification({ ...observer, time: 'special' }, scores).ability).toBe('time'));
  it('tier 동률이면 ability score가 높은 항목을 선택한다', () => expect(selectRepresentativeCertification(observer, scores).ability).toBe('center'));
  it('tier와 score 동률이면 fixed ability order를 사용한다', () => expect(selectRepresentativeCertification(observer, { time: 80, center: 80, balance: 80, control: 80, focus: 80 }).ability).toBe('time'));
});
