//c'est le point de départ de l'appli
//ça affiche App dans la div "root" de index.html
//BrowserRouter c'est pour React Router, pour avoir plusieurs pages avec chacune son adresse
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import "./styles/index.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);