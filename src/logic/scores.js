import { MAX_ATTEMPTS } from '../constants.js';
import { getTodayKey } from './dailyWord.js';

export function getTopScores(games, wordLength = null, hardMode = null) {
  const wonGames = [];
  for (const game of games) {
    if (!game.won) continue;
    if (wordLength !== null && game.wordLength !== wordLength) continue;
    if (hardMode !== null && game.hardMode !== hardMode) continue;
    wonGames.push(game);
  }

  wonGames.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return a.date - b.date;
  });

  return wonGames.slice(0, 10);
}

export function getDailyScores(games, todayKey = getTodayKey()) {
  const todayGames = [];
  for (const game of games) {
    if (game.daily && game.day === todayKey && game.won) {
      todayGames.push(game);
    }
  }

  todayGames.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return a.duration - b.duration;
  });

  return todayGames.slice(0, 10);
}

export function getStats(games, pseudo) {
  let played = 0;
  let wins = 0;
  let totalPoints = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  const distribution = {};
  for (let attempts = 1; attempts <= MAX_ATTEMPTS; attempts++) {
    distribution[attempts] = 0;
  }

  for (const game of games) {
    if (game.pseudo !== pseudo) {
      continue;
    }

    played = played + 1;
    totalPoints = totalPoints + game.points;

    if (game.won) {
      wins = wins + 1;
      distribution[game.attempts] = (distribution[game.attempts] || 0) + 1;
      currentStreak = currentStreak + 1;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  let winPercent = 0;
  if (played > 0) {
    winPercent = Math.round((wins / played) * 100);
  }

  return { played, winPercent, currentStreak, bestStreak, totalPoints, distribution };
}
