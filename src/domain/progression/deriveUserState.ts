import type { PersistedAppData } from '../storage/types';
import type { LocalDateKey, UserState } from './types';

export function deriveUserState(data: PersistedAppData, today: LocalDateKey): UserState {
  if (data.finalRecord) return 'F';
  if (!data.baseline) return 'A';
  const dailyCount = data.dailyRecords.length;
  const lastCompletedKey = dailyCount === 0 ? data.baseline.completedLocalDateKey : data.dailyRecords[dailyCount - 1]!.localDateKey;
  const isLaterDate = today > lastCompletedKey;
  if (dailyCount === 5) return isLaterDate ? 'E' : 'D';
  if (isLaterDate) return 'C';
  return dailyCount === 0 ? 'B' : 'D';
}

