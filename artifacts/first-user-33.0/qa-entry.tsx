import { createRoot } from 'react-dom/client';
import { App } from '../../src/App';
import type { PersistedAppData } from '../../src/domain/storage/types';
import { MemoryStorageAdapter } from '../../src/infrastructure/storage/MemoryStorageAdapter';
import { baselineFixture } from '../../src/test/day1Fixture';
import { day2Fixture, day3Fixture, throughDay4Fixture, throughDay5Fixture, throughDay6Fixture } from '../../src/test/dailyThroughDay4Fixture';

type Stage = 'fresh' | 'basic' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7';
const stage = stageFromQuery();
const fixtures: Record<Stage, { data: PersistedAppData; now: string }> = {
  fresh: { data: { schemaVersion: 1, dailyRecords: [], metadata: {} }, now: '2026-08-12T12:00:00Z' },
  basic: { data: { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} }, now: '2026-08-12T12:00:00Z' },
  day2: { data: { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} }, now: '2026-08-13T12:00:00Z' },
  day3: { data: { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [day2Fixture], metadata: {} }, now: '2026-08-14T12:00:00Z' },
  day4: { data: { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [day2Fixture, day3Fixture], metadata: {} }, now: '2026-08-15T12:00:00Z' },
  day5: { data: throughDay4Fixture, now: '2026-08-16T12:00:00Z' },
  day6: { data: throughDay5Fixture, now: '2026-08-17T12:00:00Z' },
  day7: { data: throughDay6Fixture, now: '2026-08-18T12:00:00Z' },
};
const selected = fixtures[stage];
const storage = new MemoryStorageAdapter(selected.data);

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date(selected.now)} createSessionId={() => `first-user-${stage}`}/>);

function stageFromQuery(): Stage {
  const value = new URLSearchParams(location.search).get('stage');
  return value === 'basic' || value === 'day2' || value === 'day3' || value === 'day4' || value === 'day5' || value === 'day6' || value === 'day7' ? value : 'fresh';
}
