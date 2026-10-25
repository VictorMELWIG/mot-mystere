function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function loadGames() {
  const saved = readJson('games');
  if (Array.isArray(saved)) {
    return saved;
  }
  return [];
}

export function saveGame(game) {
  const games = loadGames();
  for (const savedGame of games) {
    if (savedGame.date === game.date && savedGame.pseudo === game.pseudo) {
      return;
    }
  }
  games.push(game);
  localStorage.setItem('games', JSON.stringify(games));
}

export function loadDailyGame(pseudo, todayKey) {
  const saved = readJson('daily-' + pseudo);
  if (saved && saved.day === todayKey) {
    return saved.state;
  }
  return null;
}

export function saveDailyGame(pseudo, todayKey, state) {
  localStorage.setItem('daily-' + pseudo, JSON.stringify({ day: todayKey, state }));
}

export function loadSettings() {
  const saved = readJson('settings');
  return { wordLength: 5, hardMode: false, ...saved };
}

export function saveSettings(settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}
