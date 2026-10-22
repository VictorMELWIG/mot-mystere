import { MAX_ATTEMPTS } from '../constants.js';

// Calcule les statistiques d'un joueur à partir de toutes les parties enregistrées
export function getStats(games, pseudo) {
  let played = 0;        // Parties jouées
  let wins = 0;          // Parties gagnées
  let totalPoints = 0;   // Total des points
  let currentStreak = 0; // Série en cours (victoires d'affilée)
  let bestStreak = 0;    // Meilleure série

  // Répartition des victoires selon le nombre d'essais : { 1: 0, 2: 0, ..., 6: 0 }
  const distribution = {};
  for (let attempts = 1; attempts <= MAX_ATTEMPTS; attempts++) {
    distribution[attempts] = 0;
  }

  // On parcourt les parties dans l'ordre où elles ont été jouées
  for (const game of games) {
    // On ignore les parties des autres joueurs
    if (game.pseudo !== pseudo) {
      continue;
    }

    played = played + 1;
    totalPoints = totalPoints + game.points;

    if (game.won) {
      wins = wins + 1;
      distribution[game.attempts] = distribution[game.attempts] + 1;
      // Une victoire de plus dans la série
      currentStreak = currentStreak + 1;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    } else {
      // Une défaite remet la série à zéro
      currentStreak = 0;
    }
  }

  // Pourcentage de victoires (0 si aucune partie, pour ne pas diviser par zéro)
  let winPercent = 0;
  if (played > 0) {
    winPercent = Math.round((wins / played) * 100);
  }

  return { played, winPercent, currentStreak, bestStreak, totalPoints, distribution };
}
