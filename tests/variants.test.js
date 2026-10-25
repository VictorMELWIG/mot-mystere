import { it, expect } from 'vitest';
import { checkHardMode, calculateScore } from '../src/logic/rules.js';

const guesses = [{ word: 'ALORS', colors: ['present', 'correct', 'absent', 'absent', 'absent'] }];

it('mode difficile : refuse un mot sans la lettre verte', () => {
  expect(checkHardMode('PIANO', guesses).valid).toBe(false);
});

it('mode difficile : refuse un mot sans la lettre jaune', () => {
  expect(checkHardMode('BLEUS', guesses).valid).toBe(false);
});

it('mode difficile : accepte un mot qui respecte les indices', () => {
  expect(checkHardMode('CLAIR', guesses).valid).toBe(true);
});

it('applique les bonus de longueur et de mode difficile', () => {
  expect(calculateScore(1, true, 7, true)).toBe(2400);
});
