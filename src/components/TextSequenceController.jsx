import { useEffect, useMemo, useState } from 'react';
import ParticleCanvas from './ParticleCanvas';

const messages = ['Te amo', 'mi niña', 'preciosa', 'gracias', 'por existir'];

export default function TextSequenceController({ started }) {
  const [phase, setPhase] = useState(0);
  const [mode, setMode] = useState('repel');

  useEffect(() => {
    if (!started) {
      return undefined;
    }

    if (phase >= messages.length) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setPhase((prev) => prev + 1);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [phase, started]);

  const currentTarget = useMemo(() => {
    if (!started) {
      return messages[0];
    }
    return phase >= messages.length ? '__heart__' : messages[phase];
  }, [phase, started]);

  return (
    <div className="scene-wrapper">
      <ParticleCanvas started={started} sequence={currentTarget} mode={mode} />
      {started && phase < messages.length && <p className="overlay-label">{messages[phase]}</p>}
      {started && (
        <div className="mode-switch">
          <span>Interacción:</span>
          <button onClick={() => setMode('repel')} className={mode === 'repel' ? 'active' : ''}>
            Dispersar
          </button>
          <button onClick={() => setMode('attract')} className={mode === 'attract' ? 'active' : ''}>
            Atraer
          </button>
        </div>
      )}
    </div>
  );
}
