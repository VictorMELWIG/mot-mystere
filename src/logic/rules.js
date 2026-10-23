import { MAX_ATTEMPTS, WORD_LENGTH } from '../constants.js';

const LENGTH_MULTIPLIERS = { 5: 1, 6: 1.5, 7: 2 };
const HARD_MODE_MULTIPLIER = 1.5;
const COLOR_PRIORITY = { correct: 3, present: 2, absent: 1 };

// Met un mot en majuscules sans accents : "cœur" devient "COEUR"
export function normalizeWord(str) {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/Œ/g, 'OE');
}

// Tire un mot au hasard dans la liste
export function getRandomWord(wordList) {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

// Vérifie que la proposition a la bonne longueur
export function isValidWord(guess, wordLength = WORD_LENGTH) {
  if (!guess || guess.length !== wordLength) {
    return { valid: false, reason: `Le mot doit faire ${wordLength} lettres.` };
  }
  return { valid: true };
}

// Couleur de chaque lettre : d'abord les verts, puis les jaunes en barrant les lettres déjà utilisées
export function evaluateGuess(guess, targetWord) {
  const length = targetWord.length;

  if (guess.length !== length) {
    throw new Error(`Les mots doivent contenir exactement ${length} lettres.`);
  }

  const result = Array(length).fill('absent');
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');

  for (let i = 0; i < length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
    }
  }

  for (let i = 0; i < length; i++) {
    if (result[i] === 'correct') continue;

    for (let j = 0; j < length; j++) {
      if (result[j] === 'correct') continue;

      if (guessLetters[i] === targetLetters[j]) {
        result[i] = 'present';
        targetLetters[j] = null;
        break;
      }
    }
  }

  return result;
}

// Points d'une partie : 600 en 1 essai, 100 en 6, 0 si perdu, avec les bonus de difficulté
export function calculateScore(attempts, won, wordLength = WORD_LENGTH, hardMode = false) {
  if (!won) return 0;

  const basePoints = (MAX_ATTEMPTS - attempts + 1) * 100;
  const lengthBonus = LENGTH_MULTIPLIERS[wordLength];
  const hardBonus = hardMode ? HARD_MODE_MULTIPLIER : 1;

  return basePoints * lengthBonus * hardBonus;
}

// Couleur de chaque touche du clavier : la meilleure info connue (vert > jaune > gris)
export function getKeyboardStatuses(guesses = []) {
  const statuses = {};

  guesses.forEach(({ word, colors }) => {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const currentStatus = colors[i];
      const existingStatus = statuses[letter];

      if (!existingStatus || COLOR_PRIORITY[currentStatus] > COLOR_PRIORITY[existingStatus]) {
        statuses[letter] = currentStatus;
      }
    }
  });

  return statuses;
}
