import { describe, expect, it } from 'vitest';
import { horizontalPointerRatio, moveDay4Cut } from './day4BalanceMeasurement';
describe('DAY 4 divider measurement', () => {
  it('horizontal coordinate를 normalized ratio로 변환한다', () => { expect(horizontalPointerRatio(110,{left:10,width:200})).toBe(.5); expect(horizontalPointerRatio(NaN,{left:0,width:1})).toBeNull(); expect(horizontalPointerRatio(Infinity,{left:0,width:1})).toBeNull(); expect(horizontalPointerRatio(0,{left:0,width:1})).toBeNull(); });
  it('두 divider 이동을 허용하되 crossing과 경계를 거부한다', () => { expect(moveDay4Cut([.28,.72],0,.4)).toEqual([.4,.72]); expect(moveDay4Cut([.4,.72],1,.8)).toEqual([.4,.8]); expect(moveDay4Cut([.4,.72],0,.72)).toBeNull(); expect(moveDay4Cut([.4,.72],1,.4)).toBeNull(); expect(moveDay4Cut([.4,.72],0,0)).toBeNull(); });
});
