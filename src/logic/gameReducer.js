import { evaluateGuess, isValidWord, normalizeWord } from './rules.js';
import { MAX_ATTEMPTS } from '../constants.js';

export const ACTIONS = {
  ADD_LETTER: 'ADD_LETTER',
  DELETE_LETTER: 'DELETE_LETTER',
  START_CHECK: 'START_CHECK',
  REJECT_GUESS: 'REJECT_GUESS',
  SUBMIT_GUESS: 'SUBMIT_GUESS',
  SET_WORD: 'SET_WORD',
};

export const initialGameState = {
  targetWord: '',
  solution: '',
  guesses: [],
  currentGuess: '',
  gameStatus: 'IN_PROGRESS',
  errorMessage: '',
  isChecking: false,
  rejectCount: 0,
  startedAt: 0,
  endedAt: 0,
};

// Renvoie le nouvel état de la partie selon l'action reçue
export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_LETTER:
      if (state.gameStatus !== 'IN_PROGRESS' || state.isChecking) return state;
      if (state.currentGuess.length >= state.targetWord.length) return state;
      return {
        ...state,
        currentGuess: state.currentGuess + normalizeWord(action.payload),
        errorMessage: '',
      };

    case ACTIONS.DELETE_LETTER:
      if (state.isChecking) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        errorMessage: '',
      };

    case ACTIONS.START_CHECK:
      return { ...state, isChecking: true, errorMessage: '' };

    case ACTIONS.REJECT_GUESS:
      return {
        ...state,
        isChecking: false,
        errorMessage: action.payload,
        rejectCount: state.rejectCount + 1,
      };

    case ACTIONS.SUBMIT_GUESS: {
      if (state.gameStatus !== 'IN_PROGRESS') return state;

      const validation = isValidWord(state.currentGuess, state.targetWord.length);
      if (!validation.valid) {
        return { ...state, isChecking: false, errorMessage: validation.reason, rejectCount: state.rejectCount + 1 };
      }

      const colors = evaluateGuess(state.currentGuess, state.targetWord);
      const newGuesses = [...state.guesses, { word: state.currentGuess, colors }];

      let newGameStatus = state.gameStatus;
      if (state.currentGuess === state.targetWord) {
        newGameStatus = 'WON';
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        newGameStatus = 'LOST';
      }

      let endedAt = 0;
      if (newGameStatus !== 'IN_PROGRESS') {
        endedAt = Date.now();
      }

      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus,
        endedAt: endedAt,
        errorMessage: action.payload || '',
        isChecking: false,
      };
    }

    case ACTIONS.SET_WORD:
      return {
        ...state,
        targetWord: normalizeWord(action.payload),
        solution: action.payload,
        guesses: [],
        gameStatus: 'IN_PROGRESS',
        currentGuess: '',
        errorMessage: '',
        isChecking: false,
        startedAt: Date.now(),
        endedAt: 0,
      };

    default:
      return state;
  }
}
