import { it, expect } from 'vitest';
import { getTodayKey, getDailyWord } from '../src/logic/dailyWord.js';
import { getShareText } from '../src/logic/share.js';

it('change de jour à minuit heure française', () => {
  expect(getTodayKey(new Date('2026-10-23T22:30:00Z'))).toBe('2026-10-24');
});

it('donne un mot différent chaque jour', () => {
  const words = ['ARBRE', 'PLAGE', 'LIVRE'];
  expect(getDailyWord(words, '2025-01-01')).toBe('ARBRE');
  expect(getDailyWord(words, '2025-01-02')).toBe('PLAGE');
});

it('partage les couleurs sans les lettres', () => {
  const guesses = [{ word: 'ARBRE', colors: ['correct', 'correct', 'correct', 'correct', 'correct'] }];
  expect(getShareText(guesses, true, '2026-10-21')).toBe('Le Mot Mystère 21/10 · 1/6\n🟩🟩🟩🟩🟩');
});
