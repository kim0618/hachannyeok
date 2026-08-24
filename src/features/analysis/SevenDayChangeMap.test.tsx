import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AbilityScores } from '../../domain/scoring/types';
import { SevenDayChangeMap } from './SevenDayChangeMap';
import { sevenDayChangeRows } from './sevenDayChangeMapModel';

const baseline: AbilityScores = { time: 82, center: 91, balance: 74, control: 86, focus: 68 };
const final: AbilityScores = { time: 79, center: 92, balance: 77, control: 83, focus: 72 };

describe('SevenDayChangeMap', () => {
  it('engine score를 5개 presentation row로만 변환한다', () => {
    expect(sevenDayChangeRows(baseline, final, 'focus')).toEqual([
      { ability: 'time', day1Baseline: 82, final: 79, delta: -3, day7Selected: false }, { ability: 'center', day1Baseline: 91, final: 92, delta: 1, day7Selected: false }, { ability: 'balance', day1Baseline: 74, final: 77, delta: 3, day7Selected: false }, { ability: 'control', day1Baseline: 86, final: 83, delta: -3, day7Selected: false }, { ability: 'focus', day1Baseline: 68, final: 72, delta: 4, day7Selected: true },
    ]);
  });
  it('DAY1, FINAL, 변화와 DAY7 selected 상태를 접근 가능하게 표시한다', () => {
    render(<SevenDayChangeMap baselineScores={baseline} finalScores={final} selectedAbility="focus"/>);
    expect(screen.getByRole('heading', { name: '7일 변화 지도' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('img', { name: '시간 DAY 1 82점에서 FINAL 79점, 변화 -3점' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '집중 DAY 1 68점에서 FINAL 72점, 변화 +4점' })).toBeInTheDocument();
    expect(screen.getByText('DAY 7 보정')).toBeInTheDocument();
  });
});
