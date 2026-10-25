import { WORD_LENGTH } from '../constants.js';

export const WORD_LENGTHS = [5, 6, 7];

const LENGTH_MULTIPLIERS = { 5: 1, 6: 1.5, 7: 2 };
const HARD_MODE_MULTIPLIER = 1.5;
const COLOR_PRIORITY = { correct: 3, present: 2, absent: 1 };

export function normalizeWord(str) {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/Œ/g, 'OE');
}

export function getRandomWord(wordList) {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

export function isValidWord(guess, wordLength = WORD_LENGTH) {
  if (guess.length !== wordLength) {
    return { valid: false, reason: `Le mot doit faire ${wordLength} lettres.` };
  }
  return { valid: true };
}

export function evaluateGuess(guess, targetWord) {
  const length = targetWord.length;
  const result = Array(length).fill('absent');
  const targetLetters = targetWord.split('');

  for (let i = 0; i < length; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i] = 'correct';
    }
  }

  for (let i = 0; i < length; i++) {
    if (result[i] === 'correct') continue;

    for (let j = 0; j < length; j++) {
      if (result[j] === 'correct') continue;

      if (guess[i] === targetLetters[j]) {
        result[i] = 'present';
        targetLetters[j] = null;
        break;
      }
    }
  }

  return result;
}

export function getMaxAttempts(wordLength = WORD_LENGTH) {
  return wordLength + 1;
}

export function checkHardMode(guess, guesses) {
  for (const previous of guesses) {
    for (let i = 0; i < previous.word.length; i++) {
      const letter = previous.word[i];

      if (previous.colors[i] === 'correct' && guess[i] !== letter) {
        const position = i === 0 ? '1re' : i + 1 + 'e';
        return { valid: false, reason: `Mode difficile : la ${position} lettre doit être un ${letter}.` };
      }

      if (previous.colors[i] === 'present' && !guess.includes(letter)) {
        return { valid: false, reason: `Mode difficile : le mot doit contenir un ${letter}.` };
      }
    }
  }
  return { valid: true };
}

export function calculateScore(attempts, won, wordLength = WORD_LENGTH, hardMode = false) {
  if (!won) return 0;

  const basePoints = (getMaxAttempts(wordLength) - attempts + 1) * 100;
  const lengthBonus = LENGTH_MULTIPLIERS[wordLength];
  const hardBonus = hardMode ? HARD_MODE_MULTIPLIER : 1;

  return basePoints * lengthBonus * hardBonus;
}

export function getKeyboardStatuses(guesses = []) {
  const statuses = {};

  for (const guess of guesses) {
    for (let i = 0; i < guess.word.length; i++) {
      const letter = guess.word[i];
      const currentStatus = guess.colors[i];
      const existingStatus = statuses[letter];

      if (!existingStatus || COLOR_PRIORITY[currentStatus] > COLOR_PRIORITY[existingStatus]) {
        statuses[letter] = currentStatus;
      }
    }
  }

  return statuses;
}
