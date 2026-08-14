import { selectDeterministicVariant } from '../../domain/assessment/deterministicVariation';

export const VISUAL_SKIN_COUNT = 4;
export const visualSkinClass = (sessionId: string | undefined, assessmentType: string, attemptIndex: number) =>
  `visual-skin-${selectDeterministicVariant({ sessionId: sessionId ?? 'default-session', assessmentType, attemptIndex, variantCount: VISUAL_SKIN_COUNT })}`;
