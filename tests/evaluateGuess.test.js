import { describe, it, expect } from 'vitest';
import { evaluateGuess } from '../src/logic/rules.js';

describe('evaluateGuess', () => {
  it('met tout en vert quand le mot est trouvé', () => {
    expect(evaluateGuess('ARBRE', 'ARBRE')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('met tout en gris quand aucune lettre n\'est dans le mot', () => {
    expect(evaluateGuess('BIJOU', 'CERFS')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  // Lettres en double : l'exemple du sujet, ARBRE n'a que deux R et un E
  it('ne met pas plus de jaunes que de lettres dans le mot (ERRER / ARBRE)', () => {
    expect(evaluateGuess('ERRER', 'ARBRE')).toEqual(['present', 'correct', 'present', 'absent', 'absent']);
  });

  // Lettres en double : deux T proposés, un seul T dans le mot
  it('met le deuxième T en gris quand le mot n\'en a qu\'un (TOTEM / PORTE)', () => {
    expect(evaluateGuess('TOTEM', 'PORTE')).toEqual(['present', 'correct', 'absent', 'present', 'absent']);
  });

  // Lettres en double : la lettre bien placée passe avant les jaunes
  it('ne met pas en jaune une lettre déjà trouvée en vert (EEEEE / PLAGE)', () => {
    expect(evaluateGuess('EEEEE', 'PLAGE')).toEqual(['absent', 'absent', 'absent', 'absent', 'correct']);
  });
});
