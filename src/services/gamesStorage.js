const STORAGE_KEY = 'games';

// Lit une valeur enregistrée (null si rien ou si c'est illisible)
function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

// Toutes les parties terminées, gardées dans le navigateur (liste vide si rien ou si c'est illisible)
export function loadGames() {
  const saved = readJson(STORAGE_KEY);
  if (Array.isArray(saved)) {
    return saved;
  }
  return [];
}

// Ajoute une partie terminée à la fin de la liste (sauf si elle y est déjà, ex : partie du jour rechargée)
export function saveGame(game) {
  const games = loadGames();
  for (const savedGame of games) {
    if (savedGame.date === game.date && savedGame.pseudo === game.pseudo) {
      return;
    }
  }
  games.push(game);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

// La partie du jour en cours d'un joueur, seulement si elle date d'aujourd'hui (sinon null)
export function loadDailyGame(pseudo, todayKey) {
  const saved = readJson('daily-' + pseudo);
  if (saved && saved.day === todayKey) {
    return saved.state;
  }
  return null;
}

// Garde la partie du jour d'un joueur pour la reprendre si la page est rechargée
export function saveDailyGame(pseudo, todayKey, state) {
  localStorage.setItem('daily-' + pseudo, JSON.stringify({ day: todayKey, state }));
}
