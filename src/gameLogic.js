export const POINT_FADE_MS = 900;

const PRESET_POSITIONS = [
  { x: 8, y: 35 },
  { x: 16, y: 10 },
  { x: 55, y: 31 },
  { x: 92, y: 42 },
  { x: 52, y: 12 },
  { x: 60, y: 18 },
  { x: 34, y: 68 },
  { x: 12, y: 23 },
  { x: 41, y: 6 },
  { x: 75, y: 11 },
];

export function createPoints(count) {
  return Array.from({ length: count }, (_, index) => {
    const preset = PRESET_POSITIONS[index];
    const generated = {
      x: 6 + ((index * 37) % 88),
      y: 6 + ((index * 53) % 82),
    };

    return {
      id: index + 1,
      label: index + 1,
      ...(preset ?? generated),
      state: 'visible',
    };
  });
}

export function normalizePointCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(500, parsed));
}

export function nextStatus({ points, nextNumber, started, failed }) {
  if (failed) return 'GAME OVER';
  if (started && points.length === 0 && nextNumber > 1) return 'ALL CLEARED';
  return "LET'S PLAY";
}
