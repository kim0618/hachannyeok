import { describe, expect, it } from 'vitest';
import { deriveCenterShiftDirection } from './centerShiftDirection';
describe('deriveCenterShiftDirection', () => {
  it.each([[0,0,'neutral'],[.1,.1,'neutral'],[-.1,.1,'neutral'],[.2,.1,'right'],[-.2,.1,'left'],[.1,-.2,'up'],[.1,.2,'down']] as const)('%s/%s → %s', (dx, dy, expected) => expect(deriveCenterShiftDirection(dx, dy)).toBe(expected));
  it('non-finite은 정상 방향 카피로 보내지 않는다', () => expect(deriveCenterShiftDirection(Number.NaN, 0)).toBeNull());
});
