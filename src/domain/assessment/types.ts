export type InvalidReason =
  | 'backgrounded' | 'dateChanged' | 'interrupted' | 'duplicateInput'
  | 'timingUnavailable' | 'outOfBounds' | 'insufficientObservation';

export interface TrialIdentity { trialId: string; startedAtMs: number }
export interface ValidTrialBase extends TrialIdentity { completedAtMs: number; valid: true; invalidReason: null }
export interface InvalidTrialBase extends TrialIdentity { completedAtMs: number | null; valid: false; invalidReason: InvalidReason }
export interface Point { x: number; y: number }

