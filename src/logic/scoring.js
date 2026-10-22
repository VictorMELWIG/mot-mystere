import { MAX_ATTEMPTS, WORD_LENGTH } from '../constants.js';

// Bonus selon la longueur du mot (5 lettres = pas de bonus)
const LENGTH_MULTIPLIERS = { 5: 1, 6: 1.5, 7: 2 };
const HARD_MODE_MULTIPLIER = 1.5;

// Calcule le score d'une partie : moins on fait d'essais, plus on gagne de points
// Exemple : trouvé en 1 essai = 600 pts, en 6 essais = 100 pts, perdu = 0 pt
// Les bonus se multiplient entre eux : 7 lettres en mode difficile = x2 * x1,5 = x3
export function calculateScore(attempts, won, wordLength = WORD_LENGTH, hardMode = false) {
  if (!won) return 0;

  const basePoints = (MAX_ATTEMPTS - attempts + 1) * 100;
  const lengthBonus = LENGTH_MULTIPLIERS[wordLength];
  const hardBonus = hardMode ? HARD_MODE_MULTIPLIER : 1;

  return basePoints * lengthBonus * hardBonus;
}
