import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { AssessmentIntroScreen } from './screens/AssessmentIntroScreen';
import { AssessmentReadyScreen } from './screens/AssessmentReadyScreen';
import { HomeScreen } from './screens/HomeScreen';
import './styles.css';

export type AppScreen = 'home' | 'intro' | 'assessment-ready';

type EntryMode = 'first-time' | 'returning';

export function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
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
      {screen === 'assessment-ready' && <AssessmentReadyScreen />}
    </AppShell>
  );
}
