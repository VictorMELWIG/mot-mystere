//ce fichier c'est le cadre autour de toutes les pages du jeu
//en haut ya l'en-tête avec le nom du jeu (on clique dessus pour revenir à l'accueil)
//et en dessous ya la page où on est (accueil, partie...)
//children = la page à afficher dans le cadre
import { Link } from "react-router";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          Le Mot Mystère
        </Link>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;