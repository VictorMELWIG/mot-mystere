import { describe, it, expect } from 'vitest';
import { getTodayKey, getDailyWord } from '../src/logic/dailyWord.js';
import { getShareText } from '../src/logic/share.js';

describe('mot du jour', () => {
  it('change de jour à minuit heure française', () => {
    // 22h30 à Londres (UTC) le 23, c'est déjà 0h30 le 24 à Paris
    expect(getTodayKey(new Date('2026-10-23T22:30:00Z'))).toBe('2026-10-24');
  });

  it('donne le même mot le même jour et un autre mot le lendemain', () => {
    const words = ['ARBRE', 'PLAGE', 'LIVRE'];
    expect(getDailyWord(words, '2025-01-01')).toBe('ARBRE');
    expect(getDailyWord(words, '2025-01-01')).toBe('ARBRE');
    expect(getDailyWord(words, '2025-01-02')).toBe('PLAGE');
    expect(getDailyWord(words, '2025-01-04')).toBe('ARBRE'); // on revient au début de la liste
  });
});

describe('partage du résultat', () => {
  it('montre les couleurs sans les lettres', () => {
    const guesses = [
      { word: 'PORTE', colors: ['absent', 'present', 'absent', 'absent', 'absent'] },
      { word: 'ARBRE', colors: ['correct', 'correct', 'correct', 'correct', 'correct'] },
    ];
    expect(getShareText(guesses, true, '2026-10-21')).toBe('Le Mot Mystère 21/10 · 2/6\n⬛🟨⬛⬛⬛\n🟩🟩🟩🟩🟩');
  });

  it('affiche X/6 quand la partie est perdue', () => {
    expect(getShareText([], false, '2026-10-21')).toBe('Le Mot Mystère 21/10 · X/6');
  });
});
