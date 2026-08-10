import { describe, expect, it } from 'vitest';
import { isLocalDateKey, toLocalDateKey } from './localDate';

describe('LocalDateKey', () => {
  it('local date 구성 요소를 zero-padding한다', () => expect(toLocalDateKey(new Date(2026, 7, 1))).toBe('2026-08-01'));
  it('연말 날짜를 locale 문자열 없이 조립한다', () => expect(toLocalDateKey(new Date(2026, 11, 31))).toBe('2026-12-31'));
  it('실재하지 않는 날짜 key를 거부한다', () => expect(isLocalDateKey('2026-02-30')).toBe(false));
});

