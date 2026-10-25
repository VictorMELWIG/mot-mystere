//les pages sans partie : accueil (avec les réglages), règles, scores, stats et page introuvable
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Tile } from "../components/Board.jsx";
import { getTopScores, getDailyScores, getStats } from "../logic/scores.js";
import { loadGames } from "../services/gamesStorage.js";
import { useSettings } from "../hooks/useSettings.js";

function HomeLink() {
  return <Link to="/" className="button-link">Retour à l&apos;accueil</Link>;
}

export function HomePage() {
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || ""); //le pseudo de la dernière fois
  const [error, setError] = useState("");
  const { settings, changeSettings } = useSettings(); //longueur et mode, gardés pour la prochaine fois
  const navigate = useNavigate();

  function startGame(e) {
    e.preventDefault(); //sinon le formulaire recharge la page
    if (pseudo.trim() === "") {
      setError("Mets un pseudo pour jouer");
      return;
    }
    localStorage.setItem("pseudo", pseudo.trim()); //gardé pour la prochaine visite
    navigate("/partie?longueur=" + settings.wordLength);
  }

  return (
    <div className="home">
      <h1>Le Mot Mystère</h1>
      <p>Trouve le mot mystère en quelques essais, les couleurs t&apos;aident à chaque fois !</p>
      <form onSubmit={startGame}>
        <input type="text" placeholder="Ton pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
        <div className="settings">
          <label>
            Longueur{" "}
            <select value={settings.wordLength} onChange={(e) => changeSettings({ wordLength: Number(e.target.value) })}>
              <option value={5}>5 lettres</option>
              <option value={6}>6 lettres</option>
              <option value={7}>7 lettres</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={settings.hardMode} onChange={(e) => changeSettings({ hardMode: e.target.checked })} />
            Mode difficile
          </label>
        </div>
        <button type="submit">Nouvelle partie</button>
      </form>
      {error && <p className="error">{error}</p>}
      <nav className="home-menu">
        <Link to="/jour" className="button-link">Mot du jour</Link>
        <Link to="/scores" className="button-link">Tableau des scores</Link>
        <Link to="/stats" className="button-link">Statistiques</Link>
        <Link to="/regles" className="button-link">Règles du jeu</Link>
      </nav>
    </div>
  );
}

function ExampleRow({ word, colorIndex, color }) {
  return (
    <div className="row">
      {[...word].map((letter, i) => (
        <Tile key={i} letter={letter} status={i === colorIndex ? color : undefined} />
      ))}
    </div>
  );
}

export function RulesPage() {
  return (
    <div className="page rules">
      <h1>Les règles</h1>
      <p>Trouve le mot mystère de 5 lettres en 6 essais maximum.</p>
      <ul>
        <li>Chaque essai doit être un vrai mot français, il est vérifié dans le Wiktionnaire.</li>
        <li>Un mot refusé ne compte pas comme un essai.</li>
        <li>Les accents ne comptent pas : « école » se tape ECOLE.</li>
        <li>Après chaque essai, les cases changent de couleur pour t&apos;aider.</li>
      </ul>

      <h2>Exemples</h2>
      <ExampleRow word="ARBRE" colorIndex={0} color="correct" />
      <p>
        Le <strong>A</strong> est dans le mot et à la bonne place : <span className="green">vert</span>.
      </p>
      <ExampleRow word="LIVRE" colorIndex={1} color="present" />
      <p>
        Le <strong>I</strong> est dans le mot mais pas à cette place : <span className="yellow">jaune</span>.
      </p>
      <ExampleRow word="POMME" colorIndex={2} color="absent" />
      <p>
        Le <strong>M</strong> n&apos;est pas dans le mot (ou pas autant de fois) : <span className="grey">gris</span>.
      </p>

      <h2>Les points</h2>
      <table className="table">
        <thead>
          <tr><th>Trouvé en</th><th>Points</th></tr>
        </thead>
        <tbody>
          <tr><td>1 essai</td><td>600</td></tr>
          <tr><td>2 essais</td><td>500</td></tr>
          <tr><td>3 essais</td><td>400</td></tr>
          <tr><td>4 essais</td><td>300</td></tr>
          <tr><td>5 essais</td><td>200</td></tr>
          <tr><td>6 essais</td><td>100</td></tr>
          <tr><td>Perdu</td><td>0</td></tr>
        </tbody>
      </table>

      <h2>Les variantes</h2>
      <p>Sur l&apos;accueil, tu peux changer la partie libre (le mot du jour reste en 5 lettres, mode normal).</p>
      <ul>
        <li>
          Mots de 6 ou 7 lettres : tu as un essai de plus que de lettres, donc 7 essais pour 6 lettres et 8 pour 7.
          Les points montent pareil : 100 par essai, jusqu&apos;à 700 en 6 lettres et 800 en 7.
        </li>
        <li>
          Mode difficile : tu dois te servir de ce que tu as trouvé. Une lettre <span className="green">verte</span> reste
          à sa place, une lettre <span className="yellow">jaune</span> doit être dans le mot suivant.
        </li>
        <li>
          Les bonus : ×1,5 pour 6 lettres, ×2 pour 7 lettres et ×1,5 en mode difficile. Ils se cumulent : 7 lettres en
          mode difficile = ×3.
        </li>
      </ul>
      <HomeLink />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="page">
      <h1>Page introuvable</h1>
      <p>Cette adresse n&apos;existe pas.</p>
      <HomeLink />
    </div>
  );
}

function formatDuration(seconds) { //pour le mot du jour : "2 min 05 s"
  return Math.floor(seconds / 60) + " min " + String(seconds % 60).padStart(2, "0") + " s";
}

function ScoreTable({ scores, daily = false }) { //daily=mot du jour : le temps en plus, le mot, la longueur et le mode cachés
  if (scores.length === 0) return <p>Aucune partie pour l&apos;instant, va jouer !</p>;
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>#</th><th>Pseudo</th>
            {!daily && <><th>Mot</th><th>Longueur</th><th>Mode</th></>}
            <th>Essais</th><th>Points</th>{daily && <th>Temps</th>}<th>Date</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{score.pseudo}</td>
              {!daily && (
                <>
                  <td>{score.word}</td>
                  <td>{score.wordLength}</td>
                  <td>{score.hardMode ? "difficile" : "normal"}</td>
                </>
              )}
              <td>{score.attempts}</td>
              <td>{score.points}</td>
              {daily && <td>{formatDuration(score.duration)}</td>}
              <td>{new Date(score.date).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScoresPage() {
  const games = loadGames(); //toutes les parties enregistrées sur cet ordinateur
  const [lengthFilter, setLengthFilter] = useState(""); //"" = pas de filtre
  const [modeFilter, setModeFilter] = useState("");
  const wordLength = lengthFilter === "" ? null : Number(lengthFilter); //null = toutes les longueurs pour getTopScores
  const hardMode = modeFilter === "" ? null : modeFilter === "difficile";
  return (
    <div className="page">
      <h1>Tableau des scores</h1>
      <h2>Mot du jour</h2>
      <ScoreTable scores={getDailyScores(games)} daily />
      <h2>Classement général</h2>
      <div className="filters">
        <label>
          Longueur{" "}
          <select value={lengthFilter} onChange={(e) => setLengthFilter(e.target.value)}>
            <option value="">toutes</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
        </label>
        <label>
          Mode{" "}
          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
            <option value="">tous</option>
            <option value="normal">normal</option>
            <option value="difficile">difficile</option>
          </select>
        </label>
      </div>
      <ScoreTable scores={getTopScores(games, wordLength, hardMode)} />
      <HomeLink />
    </div>
  );
}

export function StatsPage() {
  const pseudo = localStorage.getItem("pseudo") || "Joueur";
  const stats = getStats(loadGames(), pseudo); //parties jouées, % de victoires, séries, points... calculés à partir des parties
  const counts = Object.entries(stats.distribution); //[["1", 0], ["2", 3]...] nombre d'essais -> victoires
  const biggest = Math.max(1, ...Object.values(stats.distribution)); //la barre la plus longue prend toute la largeur
  const numbers = [
    [stats.played, "Parties jouées"],
    [stats.winPercent + "%", "Victoires"],
    [stats.currentStreak, "Série en cours"],
    [stats.bestStreak, "Meilleure série"],
    [stats.totalPoints, "Points au total"],
  ];
  return (
    <div className="page">
      <h1>Statistiques de {pseudo}</h1>
      <div className="stats">
        {numbers.map(([number, label]) => (
          <div className="stat" key={label}>
            <span className="stat-number">{number}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <h2>Victoires selon le nombre d&apos;essais</h2>
      <div className="distribution">
        {counts.map(([attempts, count]) => (
          <div className="distribution-row" key={attempts}>
            <span className="distribution-label">{attempts}</span>
            <div className="distribution-bar" style={{ width: Math.max((count / biggest) * 100, 8) + "%" }}>{count}</div>
          </div>
        ))}
      </div>
      <HomeLink />
    </div>
  );
}
