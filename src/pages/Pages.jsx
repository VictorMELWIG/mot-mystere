//les pages sans partie : accueil, règles, page introuvable (+ scores et stats, pas encore branchées)
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Tile } from "../components/Board.jsx";
// import { getTopScores } from "../logic/leaderboard.js"; //désactivé tant que personne enregistre les parties (+ getDailyScores pour le mot du jour)
// import { getStats } from "../logic/stats.js"; //désactivé tant que personne enregistre les parties

function HomeLink() {
  return <Link to="/" className="button-link">Retour à l&apos;accueil</Link>;
}

export function HomePage() {
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || ""); //le pseudo de la dernière fois
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function startGame(e) {
    e.preventDefault(); //sinon le formulaire recharge la page
    if (pseudo.trim() === "") {
      setError("Mets un pseudo pour jouer");
      return;
    }
    localStorage.setItem("pseudo", pseudo.trim()); //gardé pour la prochaine visite
    navigate("/partie");
  }

  return (
    <div className="home">
      <h1>Le Mot Mystère</h1>
      <p>Trouve le mot mystère en quelques essais, les couleurs t&apos;aident à chaque fois !</p>
      <form onSubmit={startGame}>
        <input type="text" placeholder="Ton pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
        <button type="submit">Nouvelle partie</button>
      </form>
      {error && <p className="error">{error}</p>}
      <nav className="home-menu">
        {/* <Link to="/jour" className="button-link">Mot du jour</Link> désactivé tant que la logique du mot du jour existe pas */}
        {/* <Link to="/scores" className="button-link">Tableau des scores</Link> désactivé tant que personne enregistre les parties */}
        {/* <Link to="/stats" className="button-link">Statistiques</Link> désactivé tant que personne enregistre les parties */}
        <Link to="/regles" className="button-link">Règles du jeu</Link>
      </nav>
    </div>
  );
}

function ExampleRow({ word, colorIndex, color }) { //une ligne d'exemple avec une seule case colorée
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

// const games = []; //la liste des parties enregistrées, à brancher quand quelqu'un les enregistre
//
// function formatDuration(seconds) { //pour le mot du jour : "2 min 05 s"
//   return Math.floor(seconds / 60) + " min " + String(seconds % 60).padStart(2, "0") + " s";
// }
//
// function ScoreTable({ scores, daily = false }) { //daily=mot du jour : le temps en plus et le mot caché
//   if (scores.length === 0) return <p>Aucune partie pour l&apos;instant, va jouer !</p>;
//   return (
//     <div className="table-scroll">
//       <table className="table">
//         <thead>
//           <tr>
//             <th>#</th><th>Pseudo</th>{!daily && <th>Mot</th>}<th>Essais</th><th>Points</th>{daily && <th>Temps</th>}<th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {scores.map((score, i) => (
//             <tr key={i}>
//               <td>{i + 1}</td>
//               <td>{score.pseudo}</td>
//               {!daily && <td>{score.word}</td>}
//               <td>{score.attempts}</td>
//               <td>{score.points}</td>
//               {daily && <td>{formatDuration(score.duration)}</td>}
//               <td>{new Date(score.date).toLocaleDateString("fr-FR")}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
//
// export function ScoresPage() { //désactivé tant que personne enregistre les parties
//   return (
//     <div className="page">
//       <h1>Tableau des scores</h1>
//       {/* <h2>Mot du jour</h2> <ScoreTable scores={getDailyScores(games)} daily /> désactivé tant que la logique du mot du jour existe pas */}
//       <h2>Classement général</h2>
//       <ScoreTable scores={getTopScores(games)} />
//       <HomeLink />
//     </div>
//   );
// }
//
// export function StatsPage() { //désactivé tant que personne enregistre les parties
//   const pseudo = localStorage.getItem("pseudo") || "Joueur";
//   const stats = getStats(games, pseudo);
//   const counts = Object.entries(stats.distribution); //[["1", 0], ["2", 3]...] nombre d'essais -> victoires
//   const biggest = Math.max(1, ...Object.values(stats.distribution)); //la barre la plus longue prend toute la largeur
//   const numbers = [
//     [stats.played, "Parties jouées"],
//     [stats.winPercent + "%", "Victoires"],
//     [stats.currentStreak, "Série en cours"],
//     [stats.bestStreak, "Meilleure série"],
//     [stats.totalPoints, "Points au total"],
//   ];
//   return (
//     <div className="page">
//       <h1>Statistiques de {pseudo}</h1>
//       <div className="stats">
//         {numbers.map(([number, label]) => (
//           <div className="stat" key={label}>
//             <span className="stat-number">{number}</span>
//             <span>{label}</span>
//           </div>
//         ))}
//       </div>
//       <h2>Victoires selon le nombre d&apos;essais</h2>
//       <div className="distribution">
//         {counts.map(([attempts, count]) => (
//           <div className="distribution-row" key={attempts}>
//             <span className="distribution-label">{attempts}</span>
//             <div className="distribution-bar" style={{ width: Math.max((count / biggest) * 100, 8) + "%" }}>{count}</div>
//           </div>
//         ))}
//       </div>
//       <HomeLink />
//     </div>
//   );
// }
