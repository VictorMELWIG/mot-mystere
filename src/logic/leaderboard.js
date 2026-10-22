// Renvoie les 10 meilleures parties gagnées, de la meilleure à la moins bonne
export function getTopScores(games) {
  // 1. On garde seulement les parties gagnées (une partie perdue n'a pas de mot trouvé)
  const wonGames = [];
  for (const game of games) {
    if (game.won) {
      wonGames.push(game);
    }
  }

  // 2. On trie en comparant les parties deux par deux (a et b)
  wonGames.sort((a, b) => {
    // Critère 1 : celle qui a le plus de points passe devant
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    // Critère 2 (égalité de points) : la plus ancienne passe devant
    return a.date - b.date;
  });

  // 3. On garde seulement les 10 premières
  return wonGames.slice(0, 10);
}
