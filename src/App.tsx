import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { AssessmentIntroScreen } from './screens/AssessmentIntroScreen';
import { AssessmentReadyScreen } from './screens/AssessmentReadyScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NextAssessmentPlaceholder } from './screens/NextAssessmentPlaceholder';
import { TimeAssessmentScreen } from './features/assessment/time/TimeAssessmentScreen';
import { CenterAssessmentScreen } from './features/assessment/center/CenterAssessmentScreen';
import { BalanceAssessmentScreen } from './features/assessment/balance/BalanceAssessmentScreen';
import { ControlAssessmentScreen } from './features/assessment/control/ControlAssessmentScreen';
import { FocusAssessmentScreen } from './features/assessment/focus/FocusAssessmentScreen';
import './styles.css';

export type AppScreen = 'home' | 'intro' | 'assessment-ready' | 'time-assessment' | 'center-assessment' | 'balance-assessment' | 'control-assessment' | 'focus-assessment' | 'next-placeholder';

type EntryMode = 'first-time' | 'returning';

export function App({ initialScreen = 'home' }: { initialScreen?: AppScreen } = {}) {
  const [screen, setScreen] = useState<AppScreen>(initialScreen);
  // Storage integration will derive this later. It is intentionally separate from navigation.
  const entryMode: EntryMode = 'first-time';

  return (
    <AppShell>
      {screen === 'home' && entryMode === 'first-time' && (
        <HomeScreen onStart={() => setScreen('intro')} />
      )}
      {screen === 'intro' && (
        <AssessmentIntroScreen
          onBack={() => setScreen('home')}
          onStart={() => setScreen('assessment-ready')}
        />
      )}
      {screen === 'assessment-ready' && <AssessmentReadyScreen onStart={() => setScreen('time-assessment')} />}
      {screen === 'time-assessment' && <TimeAssessmentScreen onNext={() => setScreen('center-assessment')} />}
      {screen === 'center-assessment' && <CenterAssessmentScreen onNext={() => setScreen('balance-assessment')} />}
      {screen === 'balance-assessment' && <BalanceAssessmentScreen onNext={() => setScreen('control-assessment')} />}
      {screen === 'control-assessment' && <ControlAssessmentScreen onNext={() => setScreen('focus-assessment')} />}
      {screen === 'focus-assessment' && <FocusAssessmentScreen onNext={() => setScreen('next-placeholder')} />}
      {screen === 'next-placeholder' && <NextAssessmentPlaceholder />}
    </AppShell>
  );
}
