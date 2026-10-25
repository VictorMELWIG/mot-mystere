import { it, expect } from 'vitest';
import { normalizeWord } from '../src/logic/rules.js';

it('enlève les accents', () => {
  expect(normalizeWord('école')).toBe('ECOLE');
});

it('remplace œ par OE', () => {
  expect(normalizeWord('cœur')).toBe('COEUR');
});
