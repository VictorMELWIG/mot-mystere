//les pages de jeu (partie libre, mot du jour) et l'écran de fin, toute la logique vient de useGame
import { Link } from "react-router";
import { useGame } from "../hooks/useGame.js";
import Board from "../components/Board.jsx";
// import { useState } from "react"; //pour le bouton partager, désactivé tant que la logique du mot du jour existe pas
// import { getShareText } from "../logic/share.js"; //pareil
// import { copyText } from "../services/clipboard.js"; //pareil
// import { useCountdown } from "../hooks/useCountdown.js"; //pareil

function getPseudo() {
  return localStorage.getItem("pseudo") || "Joueur";
}

function EndGameModal({ game, onNewGame, children }) { //onNewGame pas donné pour le mot du jour = pas de bouton rejouer
  const attempts = game.state.guesses.length;
  return (
    <div className="end-game-overlay">
      <div className="end-game">
        {game.state.gameStatus === "WON" ? (
          <h2>Bravo, trouvé en {attempts} essai{attempts > 1 ? "s" : ""} !</h2>
        ) : (
          <h2>Perdu...</h2>
        )}
        <p className="word">
          Le mot était <strong>{game.state.solution}</strong>
        </p>
        <a href={game.solutionUrl} target="_blank" rel="noreferrer">
          Voir la définition sur le Wiktionnaire
        </a>
        <p className="points">Points : {game.score}</p>
        {children}
        {onNewGame && <button onClick={onNewGame}>Nouvelle partie</button>}
        <Link to="/">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}

function GamePage() {
  const game = useGame(); //sans rien, useGame prend la liste des mots de 5 lettres
  return (
    <div className="game">
      <p className="player">Partie libre · Joueur : {getPseudo()}</p>
      <Board game={game} />
      {game.state.gameStatus !== "IN_PROGRESS" && <EndGameModal game={game} onNewGame={game.startNewGame} />}
    </div>
  );
}
export default GamePage;

// function ShareButton({ text }) { //mot du jour : copie le résultat et dit si ça a marché
//   const [message, setMessage] = useState("");
//   const [failed, setFailed] = useState(false);
//   function share() {
//     copyText(text)
//       .then(() => {
//         setFailed(false);
//         setMessage("Résultat copié, tu peux le coller où tu veux !");
//       })
//       .catch(() => {
//         setFailed(true);
//         setMessage("Impossible de copier le résultat, ton navigateur a refusé.");
//       });
//   }
//   return (
//     <>
//       <button type="button" onClick={share}>Partager</button>
//       {message && <p className={failed ? "error" : "share-ok"}>{message}</p>}
//     </>
//   );
// }
//
// function Countdown() { //mot du jour : le temps avant le prochain mot (minuit heure française)
//   const { hours, minutes, seconds } = useCountdown();
//   const twoDigits = (n) => String(n).padStart(2, "0"); //05 au lieu de 5
//   return (
//     <div className="countdown">
//       <span>Prochain mot dans</span>
//       <span className="countdown-time">{twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}</span>
//     </div>
//   );
// }
//
// export function DailyPage() { //désactivé tant que useGame sait pas donner le mot du jour
//   const game = useGame();
//   const won = game.state.gameStatus === "WON";
//   return (
//     <div className="game">
//       <p className="player">Mot du jour · Joueur : {getPseudo()}</p>
//       <Board game={game} />
//       {game.state.gameStatus !== "IN_PROGRESS" && (
//         <EndGameModal game={game}>
//           <ShareButton text={getShareText(game.state.guesses, won)} />
//           <Countdown />
//         </EndGameModal>
//       )}
//     </div>
//   );
// }
