//ce fichier c'est la grille entiere du jeu  6 lignes de 5 cases
//chaque ligne c'est un Row
//la page de jeu lui donne les essais déjà faits + ce que le joueur est en train de taper et la grille affiche tout ca elle calcule rien non plus
import Row from "./Row.jsx";
import { MAX_ATTEMPTS } from "../../constants.js";
import "./Grid.css";
//guesses=les mots déjà validés genre [{ word: "ARBRE", colors: [...] }]
//currentGuess=la ligne en cours (genre "PO")
function Grid({ guesses, currentGuess }) {
  const rows = [];
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i < guesses.length) {
      //ligne déjà validée on a les lettres + les couleurs
      rows.push(<Row key={i} word={guesses[i].word} colors={guesses[i].colors} />);
    } else if (i === guesses.length) {
      //la ligne où le joueur est en train d'écrire
      rows.push(<Row key={i} word={currentGuess} />);
    } else {
      //les lignes vides en dessous
      rows.push(<Row key={i} />);
    }
  }
  return <div className="grid">{rows}</div>;
}
export default Grid;