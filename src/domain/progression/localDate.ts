import type { LocalDateKey } from './types';

export function toLocalDateKey(date: Date): LocalDateKey {
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid Date cannot become a LocalDateKey');
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as LocalDateKey;
}

export const isLocalDateKey = (value: unknown): value is LocalDateKey => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value) && (() => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);
  return date.getFullYear() === year && date.getMonth() === month! - 1 && date.getDate() === day;
})();

