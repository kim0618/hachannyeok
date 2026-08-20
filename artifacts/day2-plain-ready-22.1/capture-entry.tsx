import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../src/App';
import { baselineFixture } from '../../src/test/day1Fixture';

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<App bypassInitialLoad initialPersistedData={{ schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} }} dateNow={() => new Date('2026-08-20T12:00:00+09:00')} createSessionId={() => 'day2-h18-qa'} />);
