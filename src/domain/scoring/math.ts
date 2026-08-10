export type MathResult =
  | { ok: true; value: number }
  | { ok: false; error: 'emptyInput' | 'insufficientValues' | 'nonFiniteValue' };

const maximumAbsolute = (values: readonly number[]): number => {
  let maximum = 0;
  for (const value of values) maximum = Math.max(maximum, Math.abs(value));
  return maximum;
};

export function mean(values: readonly number[]): MathResult {
  if (values.length === 0) return { ok: false, error: 'emptyInput' };
  if (!values.every(Number.isFinite)) return { ok: false, error: 'nonFiniteValue' };
  const scale = maximumAbsolute(values);
  if (scale === 0) return { ok: true, value: 0 };
  let scaledMean = 0;
  values.forEach((value, index) => { scaledMean += (value / scale - scaledMean) / (index + 1); });
  const value = scaledMean * scale;
  return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: 'nonFiniteValue' };
}

export function populationStdDev(values: readonly number[]): MathResult {
  if (values.length < 2) return { ok: false, error: 'insufficientValues' };
  if (!values.every(Number.isFinite)) return { ok: false, error: 'nonFiniteValue' };
  const scale = maximumAbsolute(values);
  if (scale === 0) return { ok: true, value: 0 };
  let scaledMean = 0;
  let scaledSquaredDeviations = 0;
  values.forEach((value, index) => {
    const scaledValue = value / scale;
    const delta = scaledValue - scaledMean;
    scaledMean += delta / (index + 1);
    scaledSquaredDeviations += delta * (scaledValue - scaledMean);
  });
  const value = Math.sqrt(Math.max(scaledSquaredDeviations / values.length, 0)) * scale;
  return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: 'nonFiniteValue' };
}

export function median(values: readonly number[]): MathResult {
  if (values.length === 0) return { ok: false, error: 'emptyInput' };
  if (!values.every(Number.isFinite)) return { ok: false, error: 'nonFiniteValue' };
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 1 ? sorted[middle]! : sorted[middle - 1]! / 2 + sorted[middle]! / 2;
  return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: 'nonFiniteValue' };
}

export function euclideanDistance(left: { x: number; y: number }, right: { x: number; y: number }): number {
  requireFinite(left.x); requireFinite(left.y); requireFinite(right.x); requireFinite(right.y);
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function requireFinite(value: number): void {
  if (!Number.isFinite(value)) throw new RangeError('Math helper requires a finite number');
}
export const clamp01 = (value: number): number => { requireFinite(value); return Math.min(Math.max(value, 0), 1); };
export const clampRatio01 = (value: number, maximum: number): number => {
  requireFinite(value); requireFinite(maximum);
  if (maximum <= 0) throw new RangeError('Ratio maximum must be positive');
  if (value <= 0) return 0;
  return value >= maximum ? 1 : value / maximum;
};
export const roundScore = (value: number): number => { requireFinite(value); return Math.round(Math.min(Math.max(value, 0), 100)); };
