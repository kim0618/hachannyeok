import { describe, expect, it } from 'vitest';
import { deriveTerminalDirection, hasCancellationAcrossTrials, hasMeaningfulThreeWayDegradation, terminalDirectionMagnitude } from './day4Presentation';
describe('DAY 4 presentation derivation',()=>{
  it('기존 balance normalization과 tendency threshold로 terminal 방향 자격을 분리한다',()=>{expect(terminalDirectionMagnitude(-1/300)).toBeCloseTo(1/60);expect(deriveTerminalDirection(-1/300)).toBe('neutral');expect(deriveTerminalDirection(-.03)).toBe('small');expect(deriveTerminalDirection(.03)).toBe('large');});
  it('기존 condition sensitivity threshold로 primary degradation을 선택한다',()=>{expect(hasMeaningfulThreeWayDegradation(.015,.067)).toBe(true);expect(hasMeaningfulThreeWayDegradation(.015,.02)).toBe(false);});
  it('trial별 편차가 기준 양쪽에 있으면 cancellation을 감지한다',()=>{expect(hasCancellationAcrossTrials([[.28,.44,.28],[.38,.24,.38]])).toBe(true);expect(hasCancellationAcrossTrials([[.30,.35,.35],[.31,.34,.35]])).toBe(false);});
});
