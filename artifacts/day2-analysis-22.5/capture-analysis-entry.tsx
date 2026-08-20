import React from 'react';
import { createRoot } from 'react-dom/client';
import { deriveAnalysis } from '../../src/domain/scoring/deriveAnalysis';
import type { DailyRecord, PersistedAppData } from '../../src/domain/storage/types';
import { Day2AnalysisScreen } from '../../src/features/analysis/Day2AnalysisScreen';
import { baselineFixture } from '../../src/test/day1Fixture';
import '../../src/styles.css';

const record: DailyRecord = {
  recordId: 'day2-h22-qa:day2', sessionId: 'day2-h22-qa', analysisDay: 2, assessmentType: 'day2_time_distraction',
  startedAt: '2026-08-20T12:00:00.000Z', completedAt: '2026-08-20T12:01:00.000Z', localDateKey: '2026-08-20',
  rawResult: { assessmentType: 'day2_time_distraction', trials: [
    ['plain', 2910], ['distracted', 3240], ['plain', 3070], ['distracted', 3290],
  ].map(([condition, observedDurationMs], index) => ({ kind: 'timeCondition' as const, condition: condition as 'plain' | 'distracted', targetDurationMs: 3000 as const, observedDurationMs: Number(observedDurationMs), trialId: `h22-${index}`, startedAtMs: index * 5000, completedAtMs: index * 5000 + Number(observedDurationMs), valid: true as const, invalidReason: null })) },
};
const beforeRoot: PersistedAppData = { schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} };
const before = deriveAnalysis(beforeRoot);
const after = deriveAnalysis({ ...beforeRoot, dailyRecords: [record] });
if (!before.ok || !after.ok) throw new Error('h-22 capture fixture failed');
createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<main className="app-shell"><Day2AnalysisScreen record={record} before={before.value} after={after.value} saveStatus="saved" onHome={() => undefined} /></main>);
