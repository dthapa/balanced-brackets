import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { AppMode } from './types';
import { NavBar } from './components/NavBar';
import { SplashModal } from './components/SplashModal';
import { LearnMode } from './components/learn/LearnMode';
import { PracticeMode } from './components/practice/PracticeMode';

function App() {
  const [mode, setMode] = useState<AppMode>('learn');
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar mode={mode} onModeChange={setMode} />

      <main className="pb-16">
        {mode === 'learn' && <LearnMode />}
        {mode === 'practice' && <PracticeMode />}
      </main>

      <AnimatePresence>
        {showSplash && (
          <SplashModal onDismiss={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
