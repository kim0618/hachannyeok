export interface DeterministicVariantInput { sessionId: string; assessmentType: string; attemptIndex: number; variantCount: number }

export function stableStringHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

export function selectDeterministicVariant({ sessionId, assessmentType, attemptIndex, variantCount }: DeterministicVariantInput): number {
  if (!Number.isInteger(variantCount) || variantCount <= 0) throw new RangeError('variantCount must be a positive integer');
  if (!Number.isInteger(attemptIndex) || attemptIndex < 0) throw new RangeError('attemptIndex must be a non-negative integer');
  const sessionOffset = stableStringHash(`${sessionId}\u001f${assessmentType}`) % variantCount;
  return (sessionOffset + (attemptIndex % variantCount)) % variantCount;
}
