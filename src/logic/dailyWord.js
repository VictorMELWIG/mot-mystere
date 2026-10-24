const START_DAY = '2025-01-01'; // le jour n°0 du mot du jour
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// La date du jour à l'heure française, sous la forme "2026-10-24" (même résultat sur tous les ordinateurs)
export function getTodayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
}

// Le mot du jour : le nombre de jours depuis START_DAY donne sa place dans la liste
export function getDailyWord(wordList, todayKey = getTodayKey()) {
  const daysSinceStart = Math.round((Date.parse(todayKey) - Date.parse(START_DAY)) / ONE_DAY_MS);
  return wordList[daysSinceStart % wordList.length];
}

// Le temps qu'il reste avant minuit, heure française
export function getTimeUntilMidnight(date = new Date()) {
  const parisTime = date.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hourCycle: 'h23' }); // "18:15:09"
  const [h, m, s] = parisTime.split(':').map(Number);
  const secondsLeft = 24 * 3600 - (h * 3600 + m * 60 + s);

  return {
    hours: Math.floor(secondsLeft / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  };
}
