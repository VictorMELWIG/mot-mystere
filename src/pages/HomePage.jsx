//ce fichier c'est la page d'accueil du jeu
//ya le nom du jeu, une phrase pour expliquer, un champ pour le pseudo et un bouton pour jouer
//le pseudo est gardé dans le localStorage pour qu'on l'ait encore à la prochaine visite

import { useState } from "react";
import { useNavigate } from "react-router";

function HomePage() {
  //on reprend le pseudo de la dernière fois s'il y en a un
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function startGame(e) {
    //sinon le formulaire recharge la page
    e.preventDefault();

    if (pseudo.trim() === "") {
      setError("Mets un pseudo pour jouer");
      return;
    }

    //on garde le pseudo pour la prochaine fois
    localStorage.setItem("pseudo", pseudo.trim());

    //et on va sur la page de jeu
    navigate("/partie");
  }

  return (
    <div className="home">
      <h1>Le Mot Mystère</h1>
      <p>Trouve le mot de 5 lettres en 6 essais max !</p>

      <form onSubmit={startGame}>
        <input
          type="text"
          placeholder="Ton pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />
        <button type="submit">Jouer</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default HomePage;