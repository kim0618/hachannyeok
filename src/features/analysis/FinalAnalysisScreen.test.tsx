import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import { throughDay6Fixture } from '../../test/dailyThroughDay4Fixture';
import { FinalAnalysisScreen } from './FinalAnalysisScreen';

describe('FinalAnalysisScreen brand', () => {
  it('최종 분석서와 seal에 쓸능검 브랜드를 표시한다', () => {
    const analysis = deriveAnalysis(throughDay6Fixture);
    render(<FinalAnalysisScreen baseline={throughDay6Fixture.baseline} dailyRecords={throughDay6Fixture.dailyRecords} analysis={analysis} saveStatus="saved" />);
    expect(screen.getByText('쓸능검 · 최종 분석서')).toBeInTheDocument();
    expect(screen.getByText('최종 종합 쓸능검')).toBeInTheDocument();
    expect(document.querySelector('.certification-seal-brand')).toHaveTextContent('쓸능검');
  });
});
