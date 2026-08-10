import type { FocusShape as FocusShapeName } from './focusConfig';

export function FocusShape({ shape }: { shape: FocusShapeName }) {
  return (
    <svg className="focus-shape" viewBox="0 0 32 32" aria-hidden="true">
      {shape === 'circle' && <circle cx="16" cy="16" r="10" />}
      {shape === 'square' && <rect x="6" y="6" width="20" height="20" />}
      {shape === 'triangle' && <path d="M16 5 L27 26 L5 26 Z" />}
      {shape === 'diamond' && <path d="M16 4 L27 16 L16 28 L5 16 Z" />}
    </svg>
  );
}
