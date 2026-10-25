import { it, expect } from 'vitest';
import { calculateScore } from '../src/logic/rules.js';
import { getTopScores } from '../src/logic/scores.js';

it('donne 600 points en 1 essai', () => {
  expect(calculateScore(1, true)).toBe(600);
});

it('donne 0 point quand on perd', () => {
  expect(calculateScore(6, false)).toBe(0);
});

it('classe les parties gagnées par points', () => {
  const games = [
    { pseudo: 'A', points: 300, won: true, date: 1 },
    { pseudo: 'B', points: 0, won: false, date: 2 },
    { pseudo: 'C', points: 500, won: true, date: 3 },
  ];
  expect(getTopScores(games).map((game) => game.pseudo)).toEqual(['C', 'A']);
});
