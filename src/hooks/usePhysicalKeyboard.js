//ce hook écoute le clavier de l'ordi pendant la partie
//onLetter quand on tape une lettre, onDelete pour Retour arrière, onEnter pour Entrée
import { useEffect } from "react";
export function usePhysicalKeyboard(onLetter, onDelete, onEnter) {
  useEffect(() => {
    function handleKeyDown(e) {
      //on ignore les raccourcis du navigateur (Ctrl+R, Ctrl+C...)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault(); //empeche le navigateur de recharger la page quand on tape Entrée
        onEnter();
      } else if (e.key === "Backspace") {
        onDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        //que les lettres de A à Z, le reste on s'en fiche
        onLetter(e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    //on enlève l'écouteur quand on quitte la page
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLetter, onDelete, onEnter]);
}