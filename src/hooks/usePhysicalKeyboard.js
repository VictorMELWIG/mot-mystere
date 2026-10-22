import { useEffect } from 'react';
import { ACTIONS } from '../logic/gameReducer.js';

// Écoute les touches du clavier de l'ordinateur et les transforme en actions du jeu
export function usePhysicalKeyboard(dispatch) {
  useEffect(() => {
    function handleKeyDown(event) {
      // On ignore les raccourcis du navigateur (Ctrl+R, Cmd+C...)
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === 'Enter') {
        dispatch({ type: ACTIONS.SUBMIT_GUESS });
      } else if (event.key === 'Backspace') {
        dispatch({ type: ACTIONS.DELETE_LETTER });
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        // Une seule lettre de A à Z : les autres touches (chiffres, Shift...) sont ignorées
        dispatch({ type: ACTIONS.ADD_LETTER, payload: event.key });
      }
    }

    // On commence à écouter le clavier quand la page de jeu s'affiche...
    window.addEventListener('keydown', handleKeyDown);
    // ...et on arrête quand on quitte la page
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
}
