export interface HorizontalRect { left: number; width: number }

export function horizontalPointerRatio(clientX: number, rect: HorizontalRect): number | null {
  if (!Number.isFinite(clientX) || !Number.isFinite(rect.left) || !Number.isFinite(rect.width) || rect.width <= 0) return null;
  const ratio = (clientX - rect.left) / rect.width;
  return Number.isFinite(ratio) && ratio > 0 && ratio < 1 ? ratio : null;
}

export function moveDay4Cut(cuts: readonly [number, number], divider: 0 | 1, ratio: number): [number, number] | null {
  if (!Number.isFinite(ratio) || ratio <= 0 || ratio >= 1) return null;
  if (divider === 0 && ratio < cuts[1]) return [ratio, cuts[1]];
  if (divider === 1 && ratio > cuts[0]) return [cuts[0], ratio];
  return null;
}
