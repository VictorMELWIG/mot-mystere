import { MAX_ATTEMPTS } from '../constants.js';
import { getTodayKey } from './dailyWord.js';

const EMOJIS = { correct: '🟩', present: '🟨', absent: '⬛' };

export function getShareText(guesses, won, todayKey = getTodayKey()) {
  const [, month, day] = todayKey.split('-');
  const score = won ? guesses.length : 'X';

  let text = `Le Mot Mystère ${day}/${month} · ${score}/${MAX_ATTEMPTS}`;
  for (const guess of guesses) {
    text += '\n' + guess.colors.map((color) => EMOJIS[color]).join('');
  }
  return text;
}
