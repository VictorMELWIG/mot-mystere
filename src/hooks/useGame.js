import { useReducer, useEffect, useMemo } from 'react';
import { gameReducer, initialGameState, ACTIONS } from '../logic/gameReducer.js';
import { getRandomWord, getKeyboardStatuses, calculateScore, isValidWord } from '../logic/rules.js';
import { getTodayKey, getDailyWord } from '../logic/dailyWord.js';
import { isFrenchWord, getWiktionaryUrl } from '../services/wiktionary.js';
import { saveGame, loadDailyGame, saveDailyGame } from '../services/gamesStorage.js';
import { WORD_LISTS } from '../data/words.js';
import { WORD_LENGTH } from '../constants.js';

function getPseudo() {
  return localStorage.getItem('pseudo') || 'Joueur';
}

// La partie au chargement de la page : en mot du jour, on reprend celle d'aujourd'hui si elle existe
function createStartState(daily, wordList) {
  if (daily) {
    const todayKey = getTodayKey();
    const savedState = loadDailyGame(getPseudo(), todayKey);
    if (savedState) {
      return { ...savedState, isChecking: false };
    }
    const newState = gameReducer(initialGameState, { type: ACTIONS.SET_WORD, payload: getDailyWord(wordList, todayKey) });
    return { ...newState, day: todayKey };
  }
  return gameReducer(initialGameState, { type: ACTIONS.SET_WORD, payload: getRandomWord(wordList) });
}

// Toute la partie (état, couleurs, points) et les fonctions pour jouer, prêtes pour l'affichage
// daily = true pour le mot du jour, false pour une partie libre
export function useGame(daily = false, wordList = WORD_LISTS[WORD_LENGTH]) {
  const [state, dispatch] = useReducer(gameReducer, null, () => createStartState(daily, wordList));

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
      duration: Math.round((state.endedAt - state.startedAt) / 1000), // en secondes
      wordLength: state.targetWord.length,
      hardMode: false,
      daily: daily,
      day: state.day,
    };
  }, [state.gameStatus, state.solution, state.guesses.length, score, state.endedAt, state.startedAt, state.targetWord.length, daily, state.day]);

  // Dès que la partie est finie, on l'enregistre pour le tableau des scores et les statistiques
  useEffect(() => {
    if (gameResult) {
      saveGame({ ...gameResult, pseudo: getPseudo() });
    }
  }, [gameResult]);

  // Mot du jour : on garde la partie à chaque coup pour la reprendre si la page est rechargée
  useEffect(() => {
    if (daily) {
      saveDailyGame(getPseudo(), state.day, state);
    }
  }, [daily, state]);

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
