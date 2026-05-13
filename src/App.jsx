import { useEffect, useMemo, useRef, useState } from 'react';
import { POINT_FADE_MS, createPoints, nextStatus, normalizePointCount } from './gameLogic.js';

function formatTime(seconds) {
  return `${seconds.toFixed(1)}s`;
}

export default function App() {
  const [pointInput, setPointInput] = useState('10');
  const [points, setPoints] = useState(() => createPoints(10));
  const [nextNumber, setNextNumber] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const timers = useRef(new Map());

  const status = useMemo(
    () => nextStatus({ points, nextNumber, started, failed }),
    [points, nextNumber, started, failed],
  );

  useEffect(() => {
    if (!started || failed || status === 'ALL CLEARED') return undefined;

    const interval = window.setInterval(() => {
      setElapsed((current) => Number((current + 0.1).toFixed(1)));
    }, 100);

    return () => window.clearInterval(interval);
  }, [started, failed, status]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  function resetGame() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();

    const count = normalizePointCount(pointInput);
    setPointInput(String(count));
    setPoints(createPoints(count));
    setNextNumber(1);
    setElapsed(0);
    setStarted(true);
    setFailed(false);
  }

  function handlePointClick(point) {
    if (!started || failed || point.state !== 'visible') return;

    if (point.label !== nextNumber) {
      setFailed(true);
      return;
    }

    setPoints((current) =>
      current.map((item) => (item.id === point.id ? { ...item, state: 'clearing' } : item)),
    );
    setNextNumber((current) => current + 1);

    const timer = window.setTimeout(() => {
      setPoints((current) => current.filter((item) => item.id !== point.id));
      timers.current.delete(point.id);
    }, POINT_FADE_MS);

    timers.current.set(point.id, timer);
  }

  const isComplete = status === 'ALL CLEARED';
  const isGameOver = status === 'GAME OVER';

  return (
    <main className="app-shell">
      <section className="game-panel" aria-label="HAIBAZO React Entrance Test game">
        <h1 className={isComplete ? 'success' : isGameOver ? 'danger' : ''}>{status}</h1>

        <div className="controls">
          <label htmlFor="point-count">Points:</label>
          <input
            id="point-count"
            aria-label="Points"
            value={pointInput}
            inputMode="numeric"
            onChange={(event) => setPointInput(event.target.value.replace(/[^\d]/g, ''))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') resetGame();
            }}
          />

          <span>Time:</span>
          <output aria-label="Time">{formatTime(elapsed)}</output>

          <button type="button" onClick={resetGame}>
            Restart
          </button>
        </div>

        <div className="play-area" data-testid="play-area">
          {points.map((point) => (
            <button
              key={point.id}
              type="button"
              className={`point point-${point.state}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => handlePointClick(point)}
              aria-label={`Point ${point.label}`}
              disabled={point.state !== 'visible' || failed}
            >
              {point.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
