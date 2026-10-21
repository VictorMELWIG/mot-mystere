import { evaluateGuess } from './evaluateGuess.js';
import { isValidWord } from './validateGuessWord.js';
import { normalizeWord } from './normalize.js';
import allowedWords from '../data/mots_solutions.json';

// Les actions possibles dans le jeu
export const ACTIONS = {
  ADD_LETTER: 'ADD_LETTER',
  DELETE_LETTER: 'DELETE_LETTER',
  SUBMIT_GUESS: 'SUBMIT_GUESS',
  SET_WORD: 'SET_WORD',
};

// L'état initial de la partie
export const initialGameState = {
  targetWord: '',     // Le mot mystère choisi au hasard
  guesses: [],        // Les mots déjà validés (ex: ['ARBRE', 'LIVRE'])
  currentGuess: '',   // La ligne en cours (ex: 'CHAT')
  gameStatus: 'IN_PROGRESS', // 'IN_PROGRESS', 'WON', 'LOST'
  errorMessage: '',   // Message affiché si le mot est refusé
};

// La fonction reducer qui met à jour l'état selon l'action
export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_LETTER:
      // Si la ligne fait déjà 5 lettres, on ne peut plus en ajouter
      if (state.currentGuess.length >= 5) return state;
      return {
        ...state,
        currentGuess: state.currentGuess + normalizeWord(action.payload),
        errorMessage: '',
      };

    case ACTIONS.DELETE_LETTER:
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1), // Supprime la dernière lettre
        errorMessage: '',
      };

    // Validation de la proposition (quand le joueur appuie sur Entrée)
    case ACTIONS.SUBMIT_GUESS: {
      // On ne peut plus jouer si la partie est terminée
      if (state.gameStatus !== 'IN_PROGRESS') return state;

      // 1. Vérifier que le mot est valide (5 lettres + présent dans la liste)
      const validation = isValidWord(state.currentGuess, allowedWords);
      if (!validation.valid) {
        return { ...state, errorMessage: validation.reason };
      }

      // 2. Évaluer la proposition avec ta fonction evaluateGuess
      const evaluation = evaluateGuess(state.currentGuess, state.targetWord);

      // 3. Ajouter cet essai (avec son mot et ses couleurs) à la liste
      const newGuesses = [...state.guesses, { word: state.currentGuess, evaluation }];

      // 4. Vérifier la victoire ou la défaite
      let newGameStatus = state.gameStatus;
      if (state.currentGuess === state.targetWord) {
        newGameStatus = 'WON';
      } else if (newGuesses.length >= 6) {
        newGameStatus = 'LOST';
      }

      // 5. RETOURNER le nouvel état (TRÈS IMPORTANT !)
      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus,
        errorMessage: '',
      };
    }

    case ACTIONS.SET_WORD:
      return {
        ...state,
        targetWord: normalizeWord(action.payload), // On met à jour le mot mystère (en majuscules, sans accents)
        guesses: [],                // On remet les essais à vide pour une nouvelle partie
        gameStatus: 'IN_PROGRESS',  // On remet le statut en cours
        currentGuess: '',           // On vide la ligne en cours
        errorMessage: '',
      };

    default:
      return state;
  }
}
