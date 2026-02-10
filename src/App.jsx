import { useState } from 'react';
import StartButton from './components/StartButton';
import TextSequenceController from './components/TextSequenceController';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main className="app-shell">
      <TextSequenceController started={started} />
      {!started && (
        <div className="start-overlay">
          <h1>Una sorpresa para ti ✨</h1>
          <StartButton onStart={() => setStarted(true)} />
        </div>
      )}
    </main>
  );
}
