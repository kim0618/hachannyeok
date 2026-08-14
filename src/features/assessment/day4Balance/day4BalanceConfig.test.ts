import { describe, expect, it } from 'vitest';
import { day4ConfigForAttempt, day4Segments } from './day4BalanceConfig';
describe('DAY 4 balance config', () => {
  it('전체 attempt index로 A/B를 결정적으로 순환한다', () => expect(Array.from({ length: 5 }, (_, index) => day4ConfigForAttempt(index))).toEqual([{cut1:.28,cut2:.72},{cut1:.38,cut2:.62},{cut1:.28,cut2:.72},{cut1:.38,cut2:.62},{cut1:.28,cut2:.72}]));
  it('cut1/cut2에서 세 segment를 정확히 파생한다', () => { const segments=day4Segments([.30,.65]); expect(segments[0]).toBeCloseTo(.30); expect(segments[1]).toBeCloseTo(.35); expect(segments[2]).toBeCloseTo(.35); });
});
