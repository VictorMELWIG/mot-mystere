import { normalizeWord } from './normalize.js';

/**
 * Calcule l'état de chaque lettre du clavier en fonction de tous les essais du joueur.
 * Priorité des couleurs : 'correct' (vert) > 'present' (jaune) > 'absent' (gris)
 */
export function getKeyboardStatuses(guesses = []) {
  const statuses = {};

  // Ordre de priorité pour écraser les couleurs si une lettre apparaît plusieurs fois
  const priority = {
    correct: 3,  // Vert
    present: 2,  // Jaune
    absent: 1,   // Gris
  };

  guesses.forEach(({ word, colors }) => {
    // word: ex "LIVRE", colors: ex ['correct', 'absent', 'present', 'absent', 'absent']
    for (let i = 0; i < word.length; i++) {
      const letter = normalizeWord(word[i]);
      const currentStatus = colors[i]; // 'correct', 'present', ou 'absent'

      const existingStatus = statuses[letter];

      // Si la lettre n'a pas encore de statut, ou si le nouveau statut est prioritaire
      if (!existingStatus || priority[currentStatus] > priority[existingStatus]) {
        statuses[letter] = currentStatus;
      }
    }
  });

  return statuses;
}