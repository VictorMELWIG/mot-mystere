//le plateau de jeu : le message, la grille, le clavier à l'écran et le clavier de l'ordi
import { useEffect } from "react";

const KEYBOARD_ROWS = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["ENTER", "W", "X", "C", "V", "B", "N", "DELETE"],
];
const KEY_LABELS = { ENTER: "Entrée", DELETE: "⌫" };

function usePhysicalKeyboard(onLetter, onDelete, onEnter) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return; //on laisse passer les raccourcis du navigateur
      if (e.key === "Enter") {
        e.preventDefault(); //sinon ça reclique sur le dernier bouton cliqué
        onEnter();
      } else if (e.key === "Backspace") {
        onDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onLetter(e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); //on enlève l'écouteur quand on quitte la page
  }, [onLetter, onDelete, onEnter]);
}

export function Tile({ letter, status, index = 0 }) { //une case de la grille, status : correct=vert present=jaune absent=gris, rien si pas validée
  let className = "tile";
  let style = {};
  if (status) {
    className += " " + status + " flip";
    style = { animationDelay: index * 0.25 + "s" }; //index = place de la case, chacune se retourne un peu après celle d'avant
  } else if (letter) {
    className += " filled";
  }
  return (
    <div className={className} style={style}>
      {letter}
    </div>
  );
}

function Row({ length, word = "", colors = [], extraClass = "" }) {
  const tiles = [];
  for (let i = 0; i < length; i++) {
    tiles.push(<Tile key={i} letter={word[i]} status={colors[i]} index={i} />);
  }
  return <div className={"row " + extraClass}>{tiles}</div>;
}

function Grid({ game }) { //game.maxAttempts lignes de game.wordLength cases
  const state = game.state;
  const length = game.wordLength;
  let currentClass = "";
  if (state.isChecking) {
    currentClass = "checking";
  } else if (state.errorMessage && state.currentGuess !== "") {
    currentClass = "invalid"; //refusée seulement s'il reste des lettres (dico en panne = mot accepté, ligne vide)
  }

  const rows = [];
  for (let i = 0; i < game.maxAttempts; i++) {
    if (i < state.guesses.length) {
      rows.push(<Row key={i} length={length} word={state.guesses[i].word} colors={state.guesses[i].colors} />);
    } else if (i === state.guesses.length) {
      rows.push(<Row key={"current-" + state.rejectCount} length={length} word={state.currentGuess} extraClass={currentClass} />); //la key change à chaque refus = la ligne retremble
    } else {
      rows.push(<Row key={i} length={length} />);
    }
  }
  return <div className="grid" style={{ "--letters": length }}>{rows}</div>; //--letters = le nombre de cases, pour leur taille dans le CSS
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
            else if (game.keyboardStatuses[value]) className += " " + game.keyboardStatuses[value];
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
  return <p className="message error">{state.errorMessage}</p>;
}

function Board({ game }) {
  usePhysicalKeyboard(game.addLetter, game.deleteLetter, game.submitGuess);
  return (
    <>
      <GameMessage state={game.state} />
      <Grid game={game} />
      {game.state.gameStatus === "IN_PROGRESS" && <Keyboard game={game} />}
    </>
  );
}
export default Board;
