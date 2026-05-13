import ballerinaCappuccinaImage from './assets/brainrot/ballerina-cappuccina.png';
import bombardiroCrocodiloImage from './assets/brainrot/bombardiro-crocodilo.jpg';
import brrBrrPatapimImage from './assets/brainrot/brr-brr-patapim.jpg';
import cappuccinoAssassinoImage from './assets/brainrot/cappuccino-assassino.webp';
import chimpanziniBananiniImage from './assets/brainrot/chimpanzini-bananini.webp';
import frigoCameloImage from './assets/brainrot/frigo-camelo.png';
import liriliLarilaImage from './assets/brainrot/lirili-larila.webp';
import tralaleroTralalaImage from './assets/brainrot/tralalero-tralala.webp';
import trippiTroppiImage from './assets/brainrot/trippi-troppi.png';
import tungTungTungSahurImage from './assets/brainrot/tung-tung-tung-sahur.png';

export const POINT_FADE_MS = 900;

const PRESET_POSITIONS = [
  { x: 14, y: 18 },
  { x: 38, y: 18 },
  { x: 62, y: 18 },
  { x: 86, y: 18 },
  { x: 25, y: 50 },
  { x: 50, y: 50 },
  { x: 75, y: 50 },
  { x: 18, y: 82 },
  { x: 50, y: 82 },
  { x: 82, y: 82 },
];

export const BRAINROT_CHARACTERS = [
  { id: 'tralalero-tralala', name: 'Tralalero Tralala', image: tralaleroTralalaImage },
  { id: 'bombardiro-crocodilo', name: 'Bombardiro Crocodilo', image: bombardiroCrocodiloImage },
  { id: 'tung-tung-tung-sahur', name: 'Tung Tung Tung Sahur', image: tungTungTungSahurImage },
  { id: 'ballerina-cappuccina', name: 'Ballerina Cappuccina', image: ballerinaCappuccinaImage },
  { id: 'lirili-larila', name: 'Lirili Larila', image: liriliLarilaImage },
  { id: 'brr-brr-patapim', name: 'Brr Brr Patapim', image: brrBrrPatapimImage },
  { id: 'chimpanzini-bananini', name: 'Chimpanzini Bananini', image: chimpanziniBananiniImage },
  { id: 'cappuccino-assassino', name: 'Cappuccino Assassino', image: cappuccinoAssassinoImage },
  { id: 'frigo-camelo', name: 'Frigo Camelo', image: frigoCameloImage },
  { id: 'trippi-troppi', name: 'Trippi Troppi', image: trippiTroppiImage },
];

export function shuffleCharacters(characters = BRAINROT_CHARACTERS, random = Math.random) {
  const shuffled = [...characters];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function createPoints(count, characters = BRAINROT_CHARACTERS, random = Math.random) {
  const selectedCharacters = shuffleCharacters(characters, random).slice(0, count);

  return selectedCharacters.map((character, index) => {
    const preset = PRESET_POSITIONS[index];
    const generated = {
      x: 14 + ((index * 37) % 72),
      y: 18 + ((index * 53) % 64),
    };

    return {
      id: index + 1,
      label: index + 1,
      characterId: character.id,
      name: character.name,
      image: character.image,
      ...(preset ?? generated),
      state: 'visible',
    };
  });
}

export function normalizePointCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(BRAINROT_CHARACTERS.length, parsed));
}

export function nextStatus({ points, nextNumber, started, failed }) {
  if (failed) return 'GAME OVER';
  if (started && points.length === 0 && nextNumber > 1) return 'ALL CLEARED';
  return "LET'S PLAY";
}
