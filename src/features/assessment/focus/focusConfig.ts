export type FocusShape = 'circle' | 'square' | 'triangle' | 'diamond';
export interface FocusItem { readonly id: string; readonly shape: FocusShape }
export interface FocusBaselineConfig {
  readonly stimulusId: string;
  readonly targetShape: FocusShape;
  readonly distractorShape: FocusShape;
  readonly correctTargetId: string;
  readonly items: readonly FocusItem[];
}

const makeItems = (stimulusId: string, targetShape: FocusShape, distractorShape: FocusShape, targetIndex: number): readonly FocusItem[] =>
  Array.from({ length: 12 }, (_, index) => ({
    id: `${stimulusId}-item-${String(index + 1).padStart(2, '0')}`,
    shape: index === targetIndex ? targetShape : distractorShape,
  }));

export const FOCUS_BASELINE_CONFIGS: readonly FocusBaselineConfig[] = [
  { stimulusId: 'focus-baseline-1', targetShape: 'circle', distractorShape: 'square', correctTargetId: 'focus-baseline-1-item-02', items: makeItems('focus-baseline-1', 'circle', 'square', 1) },
  { stimulusId: 'focus-baseline-2', targetShape: 'triangle', distractorShape: 'circle', correctTargetId: 'focus-baseline-2-item-08', items: makeItems('focus-baseline-2', 'triangle', 'circle', 7) },
  { stimulusId: 'focus-baseline-3', targetShape: 'diamond', distractorShape: 'triangle', correctTargetId: 'focus-baseline-3-item-11', items: makeItems('focus-baseline-3', 'diamond', 'triangle', 10) },
];

const SHAPES: readonly FocusShape[] = ['circle', 'square', 'triangle', 'diamond'];

export function isValidFocusConfig(config: FocusBaselineConfig): boolean {
  if (config.items.length !== 12 || !SHAPES.includes(config.targetShape) || !SHAPES.includes(config.distractorShape)) return false;
  const ids = new Set(config.items.map((item) => item.id));
  if (ids.size !== 12 || config.items.some((item) => !SHAPES.includes(item.shape))) return false;
  const matchingTargetId = config.items.filter((item) => item.id === config.correctTargetId);
  const targets = config.items.filter((item) => item.shape === config.targetShape);
  const distractors = config.items.filter((item) => item.shape === config.distractorShape);
  return matchingTargetId.length === 1 && targets.length === 1 && targets[0]?.id === config.correctTargetId && distractors.length === 11;
}

export function focusConfigForAttempt(attemptIndex: number): FocusBaselineConfig {
  const config = FOCUS_BASELINE_CONFIGS[attemptIndex % FOCUS_BASELINE_CONFIGS.length];
  if (!config || !isValidFocusConfig(config)) throw new Error('Invalid DAY 1 Focus config');
  return config;
}
