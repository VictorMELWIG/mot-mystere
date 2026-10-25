import { useReducer, useEffect, useMemo } from 'react';
import { gameReducer, initialGameState, ACTIONS } from '../logic/gameReducer.js';
import {
  getRandomWord,
  getKeyboardStatuses,
  calculateScore,
  isValidWord,
  checkHardMode,
  getMaxAttempts,
  WORD_LENGTHS,
} from '../logic/rules.js';
import { getTodayKey, getDailyWord } from '../logic/dailyWord.js';
import { isFrenchWord, getWiktionaryUrl } from '../services/wiktionary.js';
import { saveGame, loadDailyGame, saveDailyGame } from '../services/gamesStorage.js';
import { WORD_LISTS } from '../data/words.js';
import { WORD_LENGTH } from '../constants.js';

function getPseudo() {
  return localStorage.getItem('pseudo') || 'Joueur';
}

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

export function useGame(daily = false, wordLength = WORD_LENGTH, hardMode = false) {
  let length = Number(wordLength);
  if (daily || !WORD_LENGTHS.includes(length)) {
    length = WORD_LENGTH;
  }
  const wordList = WORD_LISTS[length];

  const [state, dispatch] = useReducer(gameReducer, null, () => createStartState(daily, wordList));

  const keyboardStatuses = getKeyboardStatuses(state.guesses);

  const score = calculateScore(state.guesses.length, state.gameStatus === 'WON', state.targetWord.length, hardMode);

  const gameResult = useMemo(() => {
    if (state.gameStatus === 'IN_PROGRESS') return null;
    return {
      word: state.solution,
      attempts: state.guesses.length,
      points: score,
      won: state.gameStatus === 'WON',
      date: state.endedAt,
      duration: Math.round((state.endedAt - state.startedAt) / 1000),
      wordLength: state.targetWord.length,
      hardMode: hardMode,
      daily: daily,
      day: state.day,
    };
  }, [state, score, hardMode, daily]);

  useEffect(() => {
    if (gameResult) {
      saveGame({ ...gameResult, pseudo: getPseudo() });
    }
  }, [gameResult]);

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

    if (hardMode) {
      const hardCheck = checkHardMode(state.currentGuess, state.guesses);
      if (!hardCheck.valid) {
        dispatch({ type: ACTIONS.REJECT_GUESS, payload: hardCheck.reason });
        return;
      }
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
    wordLength: state.targetWord.length,
    maxAttempts: getMaxAttempts(state.targetWord.length),
    solutionUrl: getWiktionaryUrl(state.solution),
    addLetter,
    deleteLetter,
    submitGuess,
    startNewGame,
  };
}
