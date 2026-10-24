import { describe, it, expect } from 'vitest';
import { normalizeWord } from '../src/logic/rules.js';

describe('normalizeWord', () => {
  it('enlève les accents et met en majuscules', () => {
    expect(normalizeWord('école')).toBe('ECOLE');
  });

  it('remplace œ par OE', () => {
    expect(normalizeWord('cœur')).toBe('COEUR');
  });
});
