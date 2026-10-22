import { useReducer, useEffect, useMemo } from 'react';
import { gameReducer, initialGameState, ACTIONS } from '../logic/gameReducer.js';
import { getRandomWord } from '../logic/randomWord.js';
import { getKeyboardStatuses } from '../logic/keyboardState.js';
import { calculateScore } from '../logic/scoring.js';
import { isValidWord } from '../logic/validateGuessWord.js';
import { isFrenchWord, getWiktionaryUrl } from '../services/wiktionary.js';
import { WORD_LISTS } from '../data/words.js';
import { WORD_LENGTH } from '../constants.js';

// Par défaut, on joue avec la liste des mots de 5 lettres
export function useGame(wordList = WORD_LISTS[WORD_LENGTH]) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Couleur de chaque lettre du clavier, recalculée seulement quand les essais changent
  const keyboardStatuses = useMemo(() => getKeyboardStatuses(state.guesses), [state.guesses]);

  // Points de la partie (0 tant qu'elle n'est pas gagnée)
  const score = calculateScore(state.guesses.length, state.gameStatus === 'WON');

  // Résumé de la partie terminée, prêt à être enregistré (null tant que la partie est en cours)
  let gameResult = null;
  if (state.gameStatus !== 'IN_PROGRESS') {
    gameResult = {
      word: state.solution,                              // Le mot mystère avec ses accents
      attempts: state.guesses.length,                    // Nombre d'essais
      points: score,                                     // Points gagnés
      won: state.gameStatus === 'WON',                   // Gagné ou perdu
      date: state.endedAt,                               // Date de fin de la partie (en millisecondes)
      duration: state.endedAt - state.startedAt,         // Temps de résolution, en millisecondes
      wordLength: state.targetWord.length,               // Longueur du mot (palier 5)
      hardMode: false,                                   // Mode difficile (palier 5)
    };
  }

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

  // Fonctions d'aide pour le joueur (utilisées par le clavier)
  const addLetter = (letter) => {
    dispatch({ type: ACTIONS.ADD_LETTER, payload: letter });
  };

  const deleteLetter = () => {
    dispatch({ type: ACTIONS.DELETE_LETTER });
  };

  // Validation d'un mot : on le vérifie auprès du Wiktionnaire avant de le colorer
  const submitGuess = async () => {
    // Pas de double validation pendant la vérification, ni après la fin de la partie
    if (state.isChecking || state.gameStatus !== 'IN_PROGRESS') return;

    // 1. Mot trop court : pas la peine de déranger le Wiktionnaire
    const validation = isValidWord(state.currentGuess, null, state.targetWord.length);
    if (!validation.valid) {
      dispatch({ type: ACTIONS.REJECT_GUESS, payload: validation.reason });
      return;
    }

    // 2. On prévient que la vérification commence (le joueur voit que ça travaille)
    dispatch({ type: ACTIONS.START_CHECK });

    try {
      // 3. On demande au Wiktionnaire si c'est un vrai mot français
      const isFrench = await isFrenchWord(state.currentGuess);
      if (isFrench) {
        dispatch({ type: ACTIONS.SUBMIT_GUESS });
      } else {
        dispatch({ type: ACTIONS.REJECT_GUESS, payload: "Ce mot n'est pas dans le dictionnaire." });
      }
    } catch {
      // 4. Le Wiktionnaire ne répond pas : on accepte le mot pour ne pas bloquer la partie
      dispatch({ type: ACTIONS.SUBMIT_GUESS, payload: 'Dictionnaire injoignable : mot accepté sans vérification.' });
    }
  };

  return {
    state,
    keyboardStatuses,
    score,
    gameResult,
    solutionUrl: getWiktionaryUrl(state.solution), // Lien vers la page du mot mystère
    addLetter,
    deleteLetter,
    submitGuess,
    startNewGame,
  };
}
