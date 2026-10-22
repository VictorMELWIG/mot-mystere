import { useReducer, useEffect, useMemo } from 'react';
import { gameReducer, initialGameState, ACTIONS } from '../logic/gameReducer.js';
import { getRandomWord } from '../logic/randomWord.js';
import { getKeyboardStatuses } from '../logic/keyboardState.js';
import { calculateScore } from '../logic/scoring.js';
import { usePhysicalKeyboard } from './usePhysicalKeyboard.js';
import { WORD_LISTS } from '../data/words.js';
import { WORD_LENGTH } from '../constants.js';

// Par défaut, on joue avec la liste des mots de 5 lettres
export function useGame(wordList = WORD_LISTS[WORD_LENGTH]) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Le clavier de l'ordinateur envoie ses actions directement au reducer
  usePhysicalKeyboard(dispatch);

  // Couleur de chaque lettre du clavier, recalculée seulement quand les essais changent
  const keyboardStatuses = useMemo(() => getKeyboardStatuses(state.guesses), [state.guesses]);

  // Points de la partie (0 tant qu'elle n'est pas gagnée)
  const score = calculateScore(state.guesses.length, state.gameStatus === 'WON');

  // Fonction pour initialiser ou relancer une partie avec un mot aléatoire
  const startNewGame = () => {
    const randomWord = getRandomWord(wordList);
    dispatch({ type: ACTIONS.SET_WORD, payload: randomWord });
  };

  // Au premier affichage de la page de jeu, on lance une partie
  // (et on en relance une si la liste de mots change, par exemple pour passer à 6 lettres)
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_WORD, payload: getRandomWord(wordList) });
  }, [wordList]);

  // Fonctions d'aide pour le joueur (pour le futur clavier à l'écran)
  const addLetter = (letter) => {
    dispatch({ type: ACTIONS.ADD_LETTER, payload: letter });
  };

  const deleteLetter = () => {
    dispatch({ type: ACTIONS.DELETE_LETTER });
  };

  const submitGuess = () => {
    dispatch({ type: ACTIONS.SUBMIT_GUESS });
  };

  return {
    state,
    keyboardStatuses,
    score,
    addLetter,
    deleteLetter,
    submitGuess,
    startNewGame,
  };
}
