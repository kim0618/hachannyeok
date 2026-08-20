export const timeResultMarkerPosition = (actualMs: number): number => Math.max(6, Math.min(94, 50 + (actualMs - 3000) / 40));
