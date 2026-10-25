//les pages de jeu (partie libre avec sa longueur et son mode, mot du jour) et l'écran de fin, toute la logique vient de useGame
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useGame } from "../hooks/useGame.js";
import { useSettings } from "../hooks/useSettings.js";
import { useCountdown } from "../hooks/useCountdown.js";
import { getShareText } from "../logic/share.js";
import { copyText } from "../services/clipboard.js";
import Board from "../components/Board.jsx";

function getPseudo() { //le pseudo enregistré sur l'accueil, "Joueur" si on arrive direct sur /partie
  return localStorage.getItem("pseudo") || "Joueur";
}

function EndGameModal({ game, onNewGame, now = false, children }) { //onNewGame pas donné pour le mot du jour = pas de bouton rejouer, now = sans attendre les cases
  const attempts = game.state.guesses.length;
  return (
    <div className={"end-game-overlay" + (now ? " now" : "")} style={{ animationDelay: (game.wordLength - 1) * 0.25 + 0.6 + "s" }} /*attend la dernière case : 1,6 s en 5 lettres, plus en 6 ou 7*/>
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
        {children /*ce qu'on met entre les balises : partage et compte à rebours pour le mot du jour*/}
        {onNewGame && <button onClick={onNewGame}>Nouvelle partie</button>}
        <Link to="/">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}

function FreeGame({ wordLength, hardMode }) {
  const game = useGame(false, wordLength, hardMode);
  return (
    <div className="game">
      <p className="player">
        Partie libre · {game.wordLength} lettres · mode {hardMode ? "difficile" : "normal"} · Joueur : {getPseudo()}
      </p>
      <Board game={game} />
      {game.state.gameStatus !== "IN_PROGRESS" && <EndGameModal game={game} onNewGame={game.startNewGame} />}
    </div>
  );
}

function GamePage() {
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const wordLength = Number(searchParams.get("longueur")) || settings.wordLength; //?longueur=6 dans l'adresse, sinon celle des réglages
  const hardMode = settings.hardMode;
  return <FreeGame key={wordLength + "-" + hardMode} wordLength={wordLength} hardMode={hardMode} />; //la key change = nouvelle partie, useGame la prépare qu'une fois
}
export default GamePage;

function ShareButton({ text }) { //mot du jour : copie le résultat et dit si ça a marché
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  function share() {
    copyText(text)
      .then(() => {
        setFailed(false);
        setMessage("Résultat copié, tu peux le coller où tu veux !");
      })
      .catch(() => {
        setFailed(true);
        setMessage("Impossible de copier le résultat, ton navigateur a refusé.");
      });
  }
  return (
    <>
      <button type="button" onClick={share}>Partager</button>
      {message && <p className={failed ? "error" : "share-ok"}>{message}</p>}
    </>
  );
}

function Countdown() { //mot du jour : le temps avant le prochain mot (minuit heure française)
  const { hours, minutes, seconds } = useCountdown();
  const twoDigits = (n) => String(n).padStart(2, "0"); //05 au lieu de 5
  return (
    <div className="countdown">
      <span>Prochain mot dans</span>
      <span className="countdown-time">{twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}</span>
    </div>
  );
}

export function DailyPage() {
  const game = useGame(true); //le même mot pour tout le monde, et la partie reprend où on l'a laissée
  const [alreadyDone] = useState(game.state.gameStatus !== "IN_PROGRESS"); //déjà finie en arrivant = écran de fin direct
  const won = game.state.gameStatus === "WON";
  return (
    <div className="game">
      <p className="player">Mot du jour · Joueur : {getPseudo()}</p>
      <Board game={game} />
      {game.state.gameStatus !== "IN_PROGRESS" && (
        <EndGameModal game={game} now={alreadyDone}>
          <ShareButton text={getShareText(game.state.guesses, won)} />
          <Countdown />
        </EndGameModal>
      )}
    </div>
  );
}
