import { useReducer, useEffect, useMemo } from 'react';
import { gameReducer, initialGameState, ACTIONS } from '../logic/gameReducer.js';
import { getRandomWord, getKeyboardStatuses, calculateScore, isValidWord } from '../logic/rules.js';
import { isFrenchWord, getWiktionaryUrl } from '../services/wiktionary.js';
import { WORD_LISTS } from '../data/words.js';
import { WORD_LENGTH } from '../constants.js';

// Toute la partie (état, couleurs, points) et les fonctions pour jouer, prêtes pour l'affichage
export function useGame(wordList = WORD_LISTS[WORD_LENGTH]) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const keyboardStatuses = useMemo(() => getKeyboardStatuses(state.guesses), [state.guesses]);

  const score = calculateScore(state.guesses.length, state.gameStatus === 'WON');

  const gameResult = useMemo(() => {
    if (state.gameStatus === 'IN_PROGRESS') return null;
    return {
      word: state.solution,
      attempts: state.guesses.length,
      points: score,
      won: state.gameStatus === 'WON',
      date: state.endedAt,
      duration: state.endedAt - state.startedAt,
      wordLength: state.targetWord.length,
      hardMode: false,
    };
  }, [state.gameStatus, state.solution, state.guesses.length, score, state.endedAt, state.startedAt, state.targetWord.length]);

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_WORD, payload: getRandomWord(wordList) });
  }, [wordList]);

  const startNewGame = () => {
    dispatch({ type: ACTIONS.SET_WORD, payload: getRandomWord(wordList) });
  };

  const addLetter = (letter) => {
    dispatch({ type: ACTIONS.ADD_LETTER, payload: letter });
  };

  const deleteLetter = () => {
    dispatch({ type: ACTIONS.DELETE_LETTER });
  };

  const submitGuess = async () => {
    if (state.isChecking || state.gameStatus !== 'IN_PROGRESS') return;

    const validation = isValidWord(state.currentGuess, state.targetWord.length);
    if (!validation.valid) {
      dispatch({ type: ACTIONS.REJECT_GUESS, payload: validation.reason });
      return;
    }

    dispatch({ type: ACTIONS.START_CHECK });

    try {
      const isFrench = await isFrenchWord(state.currentGuess);
      if (isFrench) {
        dispatch({ type: ACTIONS.SUBMIT_GUESS });
      } else {
        dispatch({ type: ACTIONS.REJECT_GUESS, payload: "Ce mot n'est pas dans le dictionnaire." });
      }
    } catch {
      dispatch({ type: ACTIONS.SUBMIT_GUESS, payload: 'Dictionnaire injoignable : mot accepté sans vérification.' });
    }
  };

  return {
    state,
    keyboardStatuses,
    score,
    gameResult,
    solutionUrl: getWiktionaryUrl(state.solution),
    addLetter,
    deleteLetter,
    submitGuess,
    startNewGame,
  };
}
