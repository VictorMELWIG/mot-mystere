import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/logic/rules.js';
import { getTopScores, getDailyScores } from '../src/logic/scores.js';

describe('calculateScore', () => {
  it('donne 600 points en 1 essai et 100 en 6 essais', () => {
    expect(calculateScore(1, true)).toBe(600);
    expect(calculateScore(6, true)).toBe(100);
  });

  it('donne 0 point quand la partie est perdue', () => {
    expect(calculateScore(6, false)).toBe(0);
  });
});

describe('classements', () => {
  it('classe par points, puis la partie la plus ancienne devant, sans les défaites', () => {
    const games = [
      { pseudo: 'A', points: 300, won: true, date: 2 },
      { pseudo: 'B', points: 0, won: false, date: 3 },
      { pseudo: 'C', points: 500, won: true, date: 4 },
      { pseudo: 'D', points: 300, won: true, date: 1 },
    ];
    expect(getTopScores(games).map((game) => game.pseudo)).toEqual(['C', 'D', 'A']);
  });

  it('mot du jour : seulement les parties du jour, par points puis par temps', () => {
    const games = [
      { pseudo: 'A', points: 400, won: true, daily: true, day: '2026-10-24', duration: 90 },
      { pseudo: 'B', points: 400, won: true, daily: true, day: '2026-10-24', duration: 30 },
      { pseudo: 'C', points: 600, won: true, daily: true, day: '2026-10-23', duration: 10 },
      { pseudo: 'D', points: 600, won: true, daily: false, duration: 10 },
    ];
    expect(getDailyScores(games, '2026-10-24').map((game) => game.pseudo)).toEqual(['B', 'A']);
  });
});
