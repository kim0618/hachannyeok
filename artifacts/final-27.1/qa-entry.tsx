import { createRoot } from 'react-dom/client';
import { App } from '../../src/App';
import type { DailyRecord, PersistedAppData } from '../../src/domain/storage/types';
import { MemoryStorageAdapter } from '../../src/infrastructure/storage/MemoryStorageAdapter';
import { day2Fixture, throughDay6Fixture } from '../../src/test/dailyThroughDay4Fixture';

const path = new URLSearchParams(location.search).get('path') === 'time' ? 'time' : 'focus';
const fixture = path === 'time' ? timeSelectedFixture() : throughDay6Fixture;
const storage = new MemoryStorageAdapter(fixture);
(window as typeof window & { __DAY7_QA__?: { storage: MemoryStorageAdapter; path: string } }).__DAY7_QA__ = { storage, path };

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-18T12:00:00Z')} createSessionId={() => `qa-${path}-session`} />,
);

function timeSelectedFixture(): PersistedAppData {
  if (day2Fixture.rawResult.assessmentType !== 'day2_time_distraction') throw new Error('fixture mismatch');
  const unstableDay2: DailyRecord = {
    ...day2Fixture,
    rawResult: {
      ...day2Fixture.rawResult,
      trials: day2Fixture.rawResult.trials.map((trial, index) => trial.valid
        ? { ...trial, observedDurationMs: index % 2 === 0 ? 1000 : 5000 }
        : trial),
    },
  };
  return { ...throughDay6Fixture, dailyRecords: [unstableDay2, ...throughDay6Fixture.dailyRecords.slice(1)] };
}
