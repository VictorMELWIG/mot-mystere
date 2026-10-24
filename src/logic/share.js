import { MAX_ATTEMPTS } from '../constants.js';
import { getTodayKey } from './dailyWord.js';

const EMOJIS = { correct: '🟩', present: '🟨', absent: '⬛' };

// Le texte à partager : les couleurs de chaque essai, sans les lettres
export function getShareText(guesses, won, todayKey = getTodayKey()) {
  const [, month, day] = todayKey.split('-'); // "2026-10-24" -> "10" et "24"
  const score = won ? guesses.length : 'X';

  let text = `Le Mot Mystère ${day}/${month} · ${score}/${MAX_ATTEMPTS}`;
  for (const guess of guesses) {
    text += '\n' + guess.colors.map((color) => EMOJIS[color]).join('');
  }
  return text;
}
