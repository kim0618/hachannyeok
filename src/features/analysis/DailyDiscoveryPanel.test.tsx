import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { DailyDiscoveryPanel } from './DailyDiscoveryPanel';

describe('DailyDiscoveryPanel', () => {
  it('오늘의 발견, 누적 진행, 다음날 예고를 함께 표시한다', () => {
    render(<DailyDiscoveryPanel day={4} insight="오늘의 결과" nextTeaser="다음 조건 예고" />);

    expect(screen.getByText('오늘 새로 발견한 것')).toBeInTheDocument();
    expect(screen.getByText('DAY 4 / 7')).toBeInTheDocument();
    expect(screen.getByText('다음에 확인할 것')).toBeInTheDocument();
    expect(screen.getByText('다음 조건 예고')).toBeInTheDocument();
  });
});
