import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrecisionCertificationSeal } from './PrecisionCertificationSeal';

describe('PrecisionCertificationSeal', () => {
  it('Basic과 Final이 공유하는 fictional seal 구조를 접근성 트리에서 숨긴다', () => {
    const { container } = render(<PrecisionCertificationSeal />);
    const seal = container.firstElementChild;
    expect(seal).toHaveClass('certification-seal');
    expect(seal).toHaveAttribute('aria-hidden', 'true');
    expect(seal?.querySelector('.certification-seal-brand')).toHaveTextContent('쓸능검');
    expect(seal?.querySelector('.certification-seal-copy')).toHaveTextContent('PRECISION CERTIFIED');
  });
});
