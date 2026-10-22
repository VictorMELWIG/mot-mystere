//le plateau de jeu : le message, la grille, le clavier à l'écran et le clavier de l'ordi
import { useEffect } from "react";
import { WORD_LENGTH, MAX_ATTEMPTS } from "../constants.js";

const KEYBOARD_ROWS = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["ENTER", "W", "X", "C", "V", "B", "N", "DELETE"],
];
const KEY_LABELS = { ENTER: "Entrée", DELETE: "⌫" }; //ce qu'on écrit sur les 2 touches spéciales

function usePhysicalKeyboard(onLetter, onDelete, onEnter) { //écoute le clavier de l'ordi pendant la partie
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return; //on laisse passer les raccourcis du navigateur
      if (e.key === "Enter") {
        e.preventDefault(); //sinon ça reclique sur le dernier bouton cliqué
        onEnter();
      } else if (e.key === "Backspace") {
        onDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onLetter(e.key.toUpperCase()); //que les lettres de A à Z
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); //on enlève l'écouteur quand on quitte la page
  }, [onLetter, onDelete, onEnter]);
}

export function Tile({ letter, status, index = 0 }) { //status : correct=vert present=jaune absent=gris, rien si pas validée
  let className = "tile";
  let style = {};
  if (status) {
    className += " " + status + " flip";
    style = { animationDelay: index * 0.25 + "s" }; //chaque case se retourne un peu après celle d'avant
  } else if (letter) {
    className += " filled";
  }
  return (
    <div className={className} style={style}>
      {letter}
    </div>
  );
}

function Row({ word = "", colors = [], extraClass = "" }) {
  const tiles = [];
  for (let i = 0; i < WORD_LENGTH; i++) {
    tiles.push(<Tile key={i} letter={word[i]} status={colors[i]} index={i} />);
  }
  return <div className={"row " + extraClass}>{tiles}</div>;
}

function Grid({ state }) {
  let currentClass = "";
  if (state.isChecking) {
    currentClass = "checking"; //la ligne clignote pendant la vérification
  } else if (state.errorMessage && state.currentGuess !== "") {
    currentClass = "invalid"; //refusée seulement s'il reste des lettres (dico en panne = mot accepté, ligne vide)
  }

  const rows = [];
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i < state.guesses.length) {
      rows.push(<Row key={i} word={state.guesses[i].word} colors={state.guesses[i].colors} />);
    } else if (i === state.guesses.length) {
      rows.push(<Row key={"current-" + state.rejectCount} word={state.currentGuess} extraClass={currentClass} />); //la key change à chaque refus = la ligne retremble
    } else {
      rows.push(<Row key={i} />);
    }
  }
  return <div className="grid">{rows}</div>;
}

function Keyboard({ game }) {
  function handleClick(value) {
    if (value === "ENTER") game.submitGuess();
    else if (value === "DELETE") game.deleteLetter();
    else game.addLetter(value);
  }

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((value) => {
            let className = "key";
            if (KEY_LABELS[value]) className += " wide";
            else if (game.keyboardStatuses[value]) className += " " + game.keyboardStatuses[value]; //la couleur de la lettre
            return (
              <button
                type="button"
                key={value}
                className={className}
                onClick={() => handleClick(value)}
                disabled={value === "ENTER" && game.state.isChecking} //pas 2 validations en même temps
              >
                {KEY_LABELS[value] || value}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function GameMessage({ state }) { //toujours affiché (même vide) pour que la grille bouge pas
  if (state.isChecking) return <p className="message checking">Vérification du mot...</p>;
  return <p className="message error">{state.errorMessage}</p>; //mot refusé ou dico en panne
}

function Board({ game }) { //game=tout ce que renvoie useGame
  usePhysicalKeyboard(game.addLetter, game.deleteLetter, game.submitGuess);
  return (
    <>
      <GameMessage state={game.state} />
      <Grid state={game.state} />
      <Keyboard game={game} />
    </>
  );
}
export default Board;
