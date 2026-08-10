import { describe, expect, it } from 'vitest';
import { FOCUS_BASELINE_CONFIGS, focusConfigForAttempt, isValidFocusConfig, type FocusBaselineConfig } from './focusConfig';

describe('DAY 1 Focus config', () => {
  it.each([[0, 1], [1, 7], [2, 10]])('config %i의 target index가 %i다', (configIndex, targetIndex) => {
    const config = FOCUS_BASELINE_CONFIGS[configIndex]!;
    expect(config.items).toHaveLength(12);
    expect(new Set(config.items.map((item) => item.id)).size).toBe(12);
    expect(config.items.filter((item) => item.shape === config.targetShape)).toHaveLength(1);
    expect(config.items.filter((item) => item.shape === config.distractorShape)).toHaveLength(11);
    expect(config.items[targetIndex]?.id).toBe(config.correctTargetId);
    expect(isValidFocusConfig(config)).toBe(true);
  });

  it('attempt 4/5/6은 config 1/2/3을 반복한다', () => {
    expect([3, 4, 5].map((index) => focusConfigForAttempt(index).stimulusId)).toEqual(['focus-baseline-1', 'focus-baseline-2', 'focus-baseline-3']);
  });

  it('중복 ID나 target 개수가 깨진 config를 거부한다', () => {
    const base = FOCUS_BASELINE_CONFIGS[0]!;
    const malformed = { ...base, items: base.items.map((item) => ({ ...item, id: base.correctTargetId })) } as FocusBaselineConfig;
    expect(isValidFocusConfig(malformed)).toBe(false);
  });
});
