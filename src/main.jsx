//le point de départ de l'appli : l'en-tête commun et la liste des pages avec leur adresse
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import { HomePage, RulesPage, NotFoundPage, ScoresPage, StatsPage } from "./pages/Pages.jsx";
import GamePage from "./pages/GamePage.jsx";
// import { DailyPage } from "./pages/GamePage.jsx"; //désactivé tant que useGame sait pas faire le mot du jour
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <header className="header">
        <Link to="/" className="logo">Le Mot Mystère</Link>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/partie" element={<GamePage />} />
          <Route path="/regles" element={<RulesPage />} />
          <Route path="/scores" element={<ScoresPage />} />
          <Route path="/stats" element={<StatsPage />} />
          {/* <Route path="/jour" element={<DailyPage />} /> désactivé, voir en haut */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  </StrictMode>
);
