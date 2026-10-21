//ici ya la liste des pages du jeu, chaque page a son adresse
//toutes les pages sont dans le Layout, comme ça l'en-tête est partout
//pour l'instant ya que l'accueil, on rajoute "/partie" quand GamePage sera prête
import { Routes, Route } from "react-router";
import Layout from "./components/Layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}

export default App;