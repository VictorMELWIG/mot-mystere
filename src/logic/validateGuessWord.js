import { normalizeWord } from './normalize.js';

export function isValidWord(guess, allowedWordsList) {
  // 1. Vérifier que le mot fait exactement 5 lettres
  if (!guess || guess.length !== 5) {
    return { valid: false, reason: "Le mot doit faire 5 lettres." };
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
