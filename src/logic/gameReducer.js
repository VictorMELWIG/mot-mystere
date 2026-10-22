import { evaluateGuess } from './evaluateGuess.js';
import { isValidWord } from './validateGuessWord.js';
import { normalizeWord } from './normalize.js';
import { MAX_ATTEMPTS } from '../constants.js';

// Les actions possibles dans le jeu
export const ACTIONS = {
  ADD_LETTER: 'ADD_LETTER',
  DELETE_LETTER: 'DELETE_LETTER',
  START_CHECK: 'START_CHECK',     // Début de la vérification auprès du Wiktionnaire
  REJECT_GUESS: 'REJECT_GUESS',   // Le mot est refusé (trop court, ou pas dans le dictionnaire)
  SUBMIT_GUESS: 'SUBMIT_GUESS',   // Le mot est accepté : on le colore
  SET_WORD: 'SET_WORD',
};

// L'état initial de la partie
export const initialGameState = {
  targetWord: '',     // Le mot mystère, en majuscules sans accents (ex: 'ECOLE')
  solution: '',       // Le mot mystère tel qu'il est écrit dans la liste, avec ses accents (ex: 'école')
  guesses: [],        // Les mots déjà validés (ex: [{ word: 'ARBRE', colors: ['correct', 'absent', ...] }])
  currentGuess: '',   // La ligne en cours (ex: 'CHAT')
  gameStatus: 'IN_PROGRESS', // 'IN_PROGRESS', 'WON', 'LOST'
  errorMessage: '',   // Message affiché si le mot est refusé
  isChecking: false,  // true pendant que le Wiktionnaire vérifie le mot
  rejectCount: 0,     // Nombre de mots refusés (sert à relancer l'animation de la ligne refusée)
  startedAt: 0,       // Heure de début de la partie (pour le temps de résolution)
  endedAt: 0,         // Heure de fin de la partie (0 tant qu'elle est en cours)
};

// La fonction reducer qui met à jour l'état selon l'action
export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_LETTER:
      // On ne peut pas taper si la partie est terminée ou pendant la vérification
      if (state.gameStatus !== 'IN_PROGRESS' || state.isChecking) return state;
      // Si la ligne a déjà autant de lettres que le mot mystère, on ne peut plus en ajouter
      if (state.currentGuess.length >= state.targetWord.length) return state;
      return {
        ...state,
        currentGuess: state.currentGuess + normalizeWord(action.payload),
        errorMessage: '',
      };

    case ACTIONS.DELETE_LETTER:
      // On ne peut pas effacer pendant la vérification
      if (state.isChecking) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1), // Supprime la dernière lettre
        errorMessage: '',
      };

    case ACTIONS.START_CHECK:
      return { ...state, isChecking: true, errorMessage: '' };

    case ACTIONS.REJECT_GUESS:
      // Un mot refusé ne compte pas comme un essai : on garde la ligne telle quelle
      return {
        ...state,
        isChecking: false,
        errorMessage: action.payload,
        rejectCount: state.rejectCount + 1,
      };

    // Le mot a été accepté : on le colore
    case ACTIONS.SUBMIT_GUESS: {
      // On ne peut plus jouer si la partie est terminée
      if (state.gameStatus !== 'IN_PROGRESS') return state;

      // 1. Sécurité : vérifier que le mot a le bon nombre de lettres
      const validation = isValidWord(state.currentGuess, null, state.targetWord.length);
      if (!validation.valid) {
        return { ...state, isChecking: false, errorMessage: validation.reason, rejectCount: state.rejectCount + 1 };
      }

      // 2. Évaluer la proposition avec ta fonction evaluateGuess
      const colors = evaluateGuess(state.currentGuess, state.targetWord);

      // 3. Ajouter cet essai (avec son mot et ses couleurs) à la liste
      const newGuesses = [...state.guesses, { word: state.currentGuess, colors }];

      // 4. Vérifier la victoire ou la défaite
      let newGameStatus = state.gameStatus;
      if (state.currentGuess === state.targetWord) {
        newGameStatus = 'WON';
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        newGameStatus = 'LOST';
      }

      // 5. Si la partie vient de se terminer, on note l'heure de fin
      let endedAt = 0;
      if (newGameStatus !== 'IN_PROGRESS') {
        endedAt = Date.now();
      }

      // 6. RETOURNER le nouvel état (TRÈS IMPORTANT !)
      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus,
        endedAt: endedAt,
        errorMessage: action.payload || '', // Message éventuel (ex : dictionnaire injoignable)
        isChecking: false,
      };
    }

    case ACTIONS.SET_WORD:
      return {
        ...state,
        targetWord: normalizeWord(action.payload), // On met à jour le mot mystère (en majuscules, sans accents)
        solution: action.payload,   // On garde aussi le mot avec ses accents pour la fin de partie
        guesses: [],                // On remet les essais à vide pour une nouvelle partie
        gameStatus: 'IN_PROGRESS',  // On remet le statut en cours
        currentGuess: '',           // On vide la ligne en cours
        errorMessage: '',
        isChecking: false,
        startedAt: Date.now(),      // La partie commence maintenant
        endedAt: 0,
      };

    default:
      return state;
  }
}
