//ce fichier c'est une ligne de la grille un essai du joueur
//une ligne=5 cases Tile et la Grid l'utilise 6 fois pour faire les 6 lignes
//ca calcule rien ca affiche juste les lettres et les couleurs qu'on lui donne
import Tile from "./Tile.jsx";
import { WORD_LENGTH } from "../../constants.js";
//word=les lettres de la ligne (genre "ARB" ou "ARBRE")
//colors = les couleurs si la ligne est validée, sinon c'est vide
function Row({ word = "", colors = [] }) {
  const tiles = [];
  //on fait les 5 cases une par une
  for (let i = 0; i < WORD_LENGTH; i++) {
    tiles.push(<Tile key={i} letter={word[i]} status={colors[i]} />);
  }
  return <div className="row">{tiles}</div>;
}
export default Row;