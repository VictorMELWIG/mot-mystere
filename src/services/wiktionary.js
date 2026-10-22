import { normalizeWord } from '../logic/normalize.js';

// L'adresse de l'API du Wiktionnaire (toutes les questions passent par là)
const API_URL = 'https://fr.wiktionary.org/w/api.php';

// Pose une question au Wiktionnaire et renvoie sa réponse
async function askWiktionary(question) {
  // origin=* est obligatoire, sinon le navigateur bloque la réponse
  const url = API_URL + '?' + question + '&format=json&formatversion=2&origin=*';

  const response = await fetch(url, {
    // Le Wiktionnaire demande que l'application se présente
    headers: { 'Api-User-Agent': 'LeMotMystere/1.0 (https://github.com/VictorMELWIG/mot-mystere)' },
    // Si pas de réponse au bout de 5 secondes, on abandonne
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error('Le Wiktionnaire ne répond pas');
  }

  return response.json();
}

// Vérifie qu'une proposition (ex : "ECOLE") est un vrai mot français
export async function isFrenchWord(guess) {
  // Question 1 : quelles pages ressemblent à ce mot ?
  // (la recherche ignore les accents : "ECOLE" trouve "école")
  const searchResult = await askWiktionary('action=query&list=search&srlimit=10&srsearch=' + guess);

  // On garde seulement les pages qui s'écrivent pareil une fois sans accents
  const titles = [];
  for (const page of searchResult.query.search) {
    if (normalizeWord(page.title) === guess) {
      titles.push(page.title);
    }
  }

  // Aucune page ne correspond : le mot n'existe pas
  if (titles.length === 0) {
    return false;
  }

  // Question 2 : est-ce qu'une de ces pages est un mot français ?
  // (le Wiktionnaire contient toutes les langues, on regarde la catégorie "français")
  const pagesResult = await askWiktionary(
    'action=query&prop=categories&clcategories=Catégorie:français&cllimit=max&titles=' + encodeURIComponent(titles.join('|'))
  );

  for (const page of pagesResult.query.pages) {
    if (page.categories) {
      return true;
    }
  }

  return false;
}

// Adresse de la page Wiktionnaire d'un mot (pour le lien en fin de partie)
export function getWiktionaryUrl(word) {
  return 'https://fr.wiktionary.org/wiki/' + word;
}
