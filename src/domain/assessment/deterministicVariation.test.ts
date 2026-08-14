import { describe, expect, it } from 'vitest';
import { selectDeterministicVariant } from './deterministicVariation';
const select = (sessionId: string, attemptIndex: number, variantCount = 4) => selectDeterministicVariant({ sessionId, assessmentType: 'day1_center', attemptIndex, variantCount });
describe('selectDeterministicVariant', () => {
  it('does not use random selection', () => { expect(selectDeterministicVariant.toString()).not.toContain('Math.random'); });
  it('is reproducible, bounded, and progresses by total attempt', () => { expect(select('session-a', 3)).toBe(select('session-a', 3)); const values=Array.from({length:40},(_,i)=>select('session-a',i)); expect(values.every(value=>value>=0&&value<4)).toBe(true); expect(values.slice(1,4)).toEqual(values.slice(0,3).map(value=>(value+1)%4)); });
  it('can produce different session offsets', () => { expect(new Set(Array.from({length:16},(_,i)=>select(`session-${i}`,0))).size).toBeGreaterThan(1); });
  it.each([0,-1,1.5])('rejects invalid variantCount %s', variantCount => { expect(()=>select('session',0,variantCount)).toThrow(RangeError); });
  it.each([-1,1.5])('rejects invalid attemptIndex %s', attemptIndex => { expect(()=>select('session',attemptIndex)).toThrow(RangeError); });
});
