import { useReducer, useEffect } from 'react';
import { gameReducer, initialGameState, ACTIONS } from '../logic/gameReducer.js';
import { getRandomWord } from '../logic/randomWord.js';
// (Tu pourras importer ta liste de mots plus tard)

export function useGame(wordList) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Fonction pour initialiser ou relancer une partie avec un mot aléatoire
  const startNewGame = () => {
    const randomWord = getRandomWord(wordList);
    // On va dispatcher une action pour définir le mot mystère
    // (on peut ajouter une action SET_WORD dans le reducer si besoin)
  };

  // Fonctions d'aide pour le joueur
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
    addLetter,
    deleteLetter,
    submitGuess,
    startNewGame,
  };
}