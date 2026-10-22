import { normalizeWord } from './normalize.js';
import { WORD_LENGTH } from '../constants.js';

export function isValidWord(guess, allowedWordsList, wordLength = WORD_LENGTH) {
  // 1. Vérifier que le mot a le bon nombre de lettres
  if (!guess || guess.length !== wordLength) {
    return { valid: false, reason: `Le mot doit faire ${wordLength} lettres.` };
  }

  // 2. Vérifier si le mot est dans la liste autorisée (si la liste est fournie)
  if (allowedWordsList && allowedWordsList.length > 0) {
    // On normalise les deux côtés pour comparer proprement (majuscules, sans accents)
    const upperGuess = normalizeWord(guess);
    const wordExists = allowedWordsList.some((word) => normalizeWord(word) === upperGuess);

    if (!wordExists) {
      return { valid: false, reason: "Ce mot n'est pas dans la liste des mots autorisés." };
    }
  }

  return { valid: true };
}
