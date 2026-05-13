import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import {
  BRAINROT_CHARACTERS,
  POINT_FADE_MS,
  createPoints,
  nextStatus,
  normalizePointCount,
} from './gameLogic.js';

describe('game logic', () => {
  it('creates shuffled character answers with stable first ten positions', () => {
    const points = createPoints(10, BRAINROT_CHARACTERS, () => 0);
    expect(points).toHaveLength(10);
    expect(points.map((point) => point.label)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(points[0]).toMatchObject({ x: 14, y: 18, state: 'visible' });
    expect(points[0].name).toBe('Bombardiro Crocodilo');
    expect(typeof points[0].image).toBe('string');
  });

  it('normalizes point count input safely', () => {
    expect(normalizePointCount('abc')).toBe(0);
    expect(normalizePointCount('-1')).toBe(0);
    expect(normalizePointCount('999')).toBe(10);
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
    expect(screen.getByLabelText('Characters')).toHaveValue('10');
    expect(screen.getAllByRole('button', { name: /Tralalero|Bombardiro|Tung|Ballerina|Lirili|Brr|Chimpanzini|Cappuccino|Frigo|Trippi/ })).toHaveLength(10);
  });

  it('clears points in order and displays all cleared only after fade completes', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Characters'), { target: { value: '1' } });
    vi.useFakeTimers();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    });
    const targetName = screen.getByText('Pick:').nextSibling.textContent;
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: targetName }));
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
    const targetName = screen.getByText('Pick:').nextSibling.textContent;
    const wrongButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-label') && button.getAttribute('aria-label') !== targetName);
    act(() => {
      fireEvent.click(wrongButton);
    });

    expect(screen.getByRole('heading', { name: 'GAME OVER' })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
