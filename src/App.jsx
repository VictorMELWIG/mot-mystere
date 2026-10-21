//ici ya la liste des pages du jeu, chaque page a son adresse
//pour l'instant ya que l'accueil, on rajoute "/partie" quand GamePage sera prête
import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;