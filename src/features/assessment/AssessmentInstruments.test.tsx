import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BalanceInstrument, CenterInstrument, ControlInstrument, FocusInstrument, MemoryInstrument, TimeInstrument } from './AssessmentInstruments';

describe('assessment visual identities', () => {
  it('renders six distinct decorative instruments without answer-bearing state', () => {
    const { container } = render(<>{<TimeInstrument/>}<CenterInstrument/><BalanceInstrument/><ControlInstrument/><FocusInstrument/><MemoryInstrument/></>);
    expect(container.querySelectorAll('.assessment-instrument')).toHaveLength(6);
    expect(container.querySelector('.center-instrument .actual-marker')).toBeNull();
    expect(container.querySelector('.center-instrument .center-marker')).toBeNull();
    expect(container.querySelector('.balance-instrument .balance-target')).toBeNull();
    expect(container.querySelector('.control-instrument [class*="near"]')).toBeNull();
    expect(container.querySelector('.focus-instrument .focus-shape')).toBeNull();
    expect(container.querySelector('.memory-instrument .memory-target')).toBeNull();
  });

  it('keeps the running time dial empty', () => {
    const { container } = render(<TimeInstrument mode="running"/>);
    expect(container).not.toHaveTextContent('3.000');
    expect(container).not.toHaveTextContent('REFERENCE');
  });
});
