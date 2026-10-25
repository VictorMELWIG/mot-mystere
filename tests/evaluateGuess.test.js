import { it, expect } from 'vitest';
import { evaluateGuess } from '../src/logic/rules.js';

it('met tout en vert quand le mot est trouvé', () => {
  expect(evaluateGuess('ARBRE', 'ARBRE')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
});

it('lettres en double : ERRER avec le mot ARBRE', () => {
  expect(evaluateGuess('ERRER', 'ARBRE')).toEqual(['present', 'correct', 'present', 'absent', 'absent']);
});

it('lettres en double : TOTEM avec le mot PORTE', () => {
  expect(evaluateGuess('TOTEM', 'PORTE')).toEqual(['present', 'correct', 'absent', 'present', 'absent']);
});
