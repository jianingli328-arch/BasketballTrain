import React, { useEffect, useState, useRef, useCallback } from 'react';

type Props = { onDurationChange?: (totalSeconds: number) => void };

export default function WorkoutTimer({ onDurationChange }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const startRef = useRef(Date.now());
  const pausedRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const total = pausedRef.current + Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(total);
      onDurationChange?.(total);
    }, 1000);
    return () => clearTimer();
  }, []);

  function togglePause() {
    if (isRunning) {
      clearTimer();
      pausedRef.current = elapsed;
      setIsRunning(false);
    } else {
      startRef.current = Date.now();
      intervalRef.current = window.setInterval(() => {
        const total = pausedRef.current + Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(total);
        onDurationChange?.(total);
      }, 1000);
      setIsRunning(true);
    }
  }

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const display = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      padding: '12px 20px', marginBottom: 16, border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <button
        onClick={togglePause}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: isRunning ? 'var(--primary)' : 'var(--success)',
          color: '#fff', fontSize: 16, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}
      >
        {isRunning ? 'II' : '>'}
      </button>
      <span style={{
        fontSize: 'var(--font-xxxl)', fontWeight: 700, color: 'var(--text)',
        fontVariant: 'tabular-nums', letterSpacing: 2,
        opacity: isRunning ? 1 : 0.5,
      }}>
        {display}
      </span>
    </div>
  );
}