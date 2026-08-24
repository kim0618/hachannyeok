import { createRoot } from 'react-dom/client';
import '../../src/styles.css';
import { AppShell } from '../../src/components/AppShell';
import { deriveAnalysis } from '../../src/domain/scoring/deriveAnalysis';
import { BasicAnalysisScreen } from '../../src/features/analysis/BasicAnalysisScreen';
import { FinalAnalysisScreen } from '../../src/features/analysis/FinalAnalysisScreen';
import { Day3CenterAssessmentScreen } from '../../src/features/assessment/day3Center/Day3CenterAssessmentScreen';
import { Day4BalanceAssessmentScreen } from '../../src/features/assessment/day4Balance/Day4BalanceAssessmentScreen';
import { Day5ControlAssessmentScreen } from '../../src/features/assessment/day5Control/Day5ControlAssessmentScreen';
import { Day6SpatialMemoryAssessmentScreen } from '../../src/features/assessment/day6SpatialMemory/Day6SpatialMemoryAssessmentScreen';
import { FinalCalibrationScreen } from '../../src/features/assessment/final/FinalCalibrationScreen';
import { AssessmentIntroScreen } from '../../src/screens/AssessmentIntroScreen';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { baselineFixture } from '../../src/test/day1Fixture';
import { throughDay6Fixture } from '../../src/test/dailyThroughDay4Fixture';

const view = new URLSearchParams(location.search).get('view') ?? 'home';
const noop = () => undefined;
const basicAnalysis = deriveAnalysis({ schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} });
const finalAnalysis = deriveAnalysis(throughDay6Fixture);

// DAY6는 실제 1200/300ms timer 대신 수동 stepping으로 OBSERVE/HOLD/RECALL을 정지 캡처한다.
const day6Queue: Array<() => void> = [];
const day6Scheduler = { set: (callback: () => void) => day6Queue.push(callback), clear: noop };
(window as unknown as { __day6Step: () => void }).__day6Step = () => day6Queue.shift()?.();

const content = view === 'intro' ? <AssessmentIntroScreen onStart={noop} onBack={noop}/>
  : view === 'basic' ? <BasicAnalysisScreen baseline={baselineFixture} analysis={basicAnalysis} onRestart={noop} onHome={noop}/>
  : view === 'day3' ? <Day3CenterAssessmentScreen sessionDateKey="2026-08-14" dateNow={() => new Date('2026-08-14T12:00:00')} createTrialId={() => 'qa-day3'} onComplete={noop} onDateInvalidated={noop}/>
  : view === 'day4' ? <Day4BalanceAssessmentScreen sessionDateKey="2026-08-15" dateNow={() => new Date('2026-08-15T12:00:00')} createTrialId={() => 'qa-day4'} onComplete={noop} onDateInvalidated={noop}/>
  : view === 'day5' ? <Day5ControlAssessmentScreen sessionDateKey="2026-08-16" dateNow={() => new Date('2026-08-16T12:00:00Z')} clock={{ now: () => 500 }} createTrialId={() => 'qa-day5'} onComplete={noop} onDateInvalidated={noop}/>
  : view === 'day6' ? <Day6SpatialMemoryAssessmentScreen sessionDateKey="2026-08-17" dateNow={() => new Date('2026-08-17T12:00:00Z')} clock={{ now: () => 2000 }} scheduler={day6Scheduler} createTrialId={() => 'qa-day6'} onComplete={noop} onDateInvalidated={noop}/>
  : view === 'day7' ? <FinalCalibrationScreen ability="time" sessionDateKey="2026-08-18" dateNow={() => new Date('2026-08-18T12:00:00Z')} onComplete={noop} onRestart={noop}/>
  : view === 'final' && finalAnalysis.ok ? <FinalAnalysisScreen baseline={throughDay6Fixture.baseline} dailyRecords={throughDay6Fixture.dailyRecords} analysis={finalAnalysis} saveStatus="saved" onHome={noop}/>
  : <HomeScreen onStart={noop}/>;

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<AppShell>{content}</AppShell>);
