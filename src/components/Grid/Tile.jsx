//ce fichier c'est une case de la grille avec une lettre dedans
//la couleur change selon le statut : vert, jaune ou gris
//status = correct=vert present=jaune absent=gris ou rien si la ligne est pas encore validée
function Tile({ letter, status }) {
  let className = "tile";
  if (status) {
    className = className + " " + status;
  } else if (letter) {
    //case remplie mais pas encore validée on met juste la bordure plus claire
    className = className + " filled";
  }
  return <div className={className}>{letter}</div>;
}
export default Tile;