/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '../../src/components/AppShell';
import { deriveAnalysis } from '../../src/domain/scoring/deriveAnalysis';
import { BasicAnalysisScreen } from '../../src/features/analysis/BasicAnalysisScreen';
import { Day5ControlAssessmentScreen } from '../../src/features/assessment/day5Control/Day5ControlAssessmentScreen';
import { AssessmentIntroScreen } from '../../src/screens/AssessmentIntroScreen';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { baselineFixture } from '../../src/test/day1Fixture';

type View = 'home' | 'intro' | 'basic' | 'day5-predictable' | 'day5-surprise';
const view = new URLSearchParams(location.search).get('view') as View | null;
const analysis = deriveAnalysis({ schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} });

function Day5Running({ surprise }: { surprise: boolean }) {
  useEffect(() => {
    const click = (label: string) => [...document.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === label)?.click();
    const timers = [window.setTimeout(() => click('측정 시작'), 30)];
    if (surprise) {
      timers.push(window.setTimeout(() => click('멈춰!'), 70));
      timers.push(window.setTimeout(() => click('다음 측정'), 110));
    }
    return () => timers.forEach(id => window.clearTimeout(id));
  }, [surprise]);
  return <Day5ControlAssessmentScreen sessionDateKey="2026-08-16" dateNow={() => new Date('2026-08-16T12:00:00Z')} clock={{ now: () => 500 }} createTrialId={() => 'qa-day5'} onDateInvalidated={() => undefined} onComplete={() => undefined}/>;
}

const content = view === 'intro' ? <AssessmentIntroScreen onStart={() => undefined} onBack={() => undefined}/>
  : view === 'basic' ? <BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined}/>
  : view === 'day5-predictable' ? <Day5Running surprise={false}/>
  : view === 'day5-surprise' ? <Day5Running surprise/>
  : <HomeScreen onStart={() => undefined}/>;

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<AppShell>{content}</AppShell>);
