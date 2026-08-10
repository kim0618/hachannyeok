import { describe, expect, it } from 'vitest';
import type { PersistedAppData } from '../storage/types';
import type { LocalDateKey } from './types';
import { deriveUserState } from './deriveUserState';

const baseline = { recordId: 'b', sessionId: 's1', startedAt: '2026-08-01T00:00:00Z', completedAt: '2026-08-01T00:01:00Z', startedLocalDateKey: '2026-08-01' as const, completedLocalDateKey: '2026-08-01' as const, assessmentRawResults: [] };
const root = (dailyCount: number, final = false): PersistedAppData => ({ schemaVersion: 1, baseline, dailyRecords: Array.from({ length: dailyCount }, (_, index) => ({ recordId: `d${index}`, sessionId: `s${index}`, analysisDay: (index + 2) as 2 | 3 | 4 | 5 | 6, assessmentType: `day${index + 2}_${['time_distraction', 'decorated_center', 'balance_three_way', 'control_surprise', 'spatial_memory'][index]}` as never, startedAt: `2026-08-0${index + 2}T00:00:00Z`, completedAt: `2026-08-0${index + 2}T00:01:00Z`, localDateKey: `2026-08-0${index + 2}` as LocalDateKey, rawResult: {} as never })), ...(final ? { finalRecord: { recordId: 'f', sessionId: 'sf', selectedAbility: 'time' as const, assessmentType: 'finalTime' as const, startedAt: '2026-08-08T00:00:00Z', completedAt: '2026-08-08T00:01:00Z', localDateKey: '2026-08-08' as const, rawResult: {} as never } } : {}), metadata: {} });

describe('STATE A~F raw derivation', () => {
  it('baseline이 없으면 A다', () => expect(deriveUserState({ schemaVersion: 1, dailyRecords: [], metadata: {} }, '2026-08-01')).toBe('A'));
  it('DAY 1 완료 당일은 B다', () => expect(deriveUserState(root(0), '2026-08-01')).toBe('B'));
  it('다음 날짜에는 DAY 2가 가능한 C다', () => expect(deriveUserState(root(0), '2026-08-02')).toBe('C'));
  it('DAILY 완료 당일은 D다', () => expect(deriveUserState(root(1), '2026-08-02')).toBe('D'));
  it('DAY 6 완료 당일은 D, 다음 날짜는 E다', () => { expect(deriveUserState(root(5), '2026-08-06')).toBe('D'); expect(deriveUserState(root(5), '2026-08-07')).toBe('E'); });
  it('final 완료는 F다', () => expect(deriveUserState(root(5, true), '2026-08-08')).toBe('F'));
  it('날짜 역행으로 다음 분석을 해금하지 않는다', () => expect(deriveUserState(root(2), '2026-08-01')).toBe('D'));
});
