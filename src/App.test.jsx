import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { POINT_FADE_MS, createPoints, nextStatus, normalizePointCount } from './gameLogic.js';

describe('game logic', () => {
  it('creates numbered points with stable first ten positions', () => {
    const points = createPoints(10);
    expect(points).toHaveLength(10);
    expect(points.map((point) => point.label)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(points[0]).toMatchObject({ x: 8, y: 35, state: 'visible' });
  });

  it('normalizes point count input safely', () => {
    expect(normalizePointCount('abc')).toBe(0);
    expect(normalizePointCount('-1')).toBe(0);
    expect(normalizePointCount('999')).toBe(500);
  });

  it('does not report all cleared while a clicked point is still fading', () => {
    expect(nextStatus({ points: [{ label: 1, state: 'clearing' }], nextNumber: 2, started: true })).toBe(
      "LET'S PLAY",
    );
    expect(nextStatus({ points: [], nextNumber: 2, started: true })).toBe('ALL CLEARED');
  });
});

describe('App', () => {
  it('starts with the entrance-test layout and ten points', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: "LET'S PLAY" })).toBeInTheDocument();
    expect(screen.getByLabelText('Points')).toHaveValue('10');
    expect(screen.getAllByRole('button', { name: /Point \d+/ })).toHaveLength(10);
  });

  it('clears points in order and displays all cleared only after fade completes', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '1' } });
    vi.useFakeTimers();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Point 1' }));
    });

    expect(screen.queryByRole('heading', { name: 'ALL CLEARED' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "LET'S PLAY" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(POINT_FADE_MS);
    });

    expect(screen.getByRole('heading', { name: 'ALL CLEARED' })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows game over when the player clicks the wrong point', async () => {
    vi.useFakeTimers();
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Point 2' }));
    });

    expect(screen.getByRole('heading', { name: 'GAME OVER' })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
