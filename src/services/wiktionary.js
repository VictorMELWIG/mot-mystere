import { normalizeWord } from '../logic/rules.js';
import { WIKTIONARY_API_URL, WIKTIONARY_PAGE_URL, API_USER_AGENT, API_TIMEOUT_MS } from '../config.js';

async function askWiktionary(question) {
  const url = WIKTIONARY_API_URL + '?' + question + '&format=json&formatversion=2&origin=*';

  const response = await fetch(url, {
    headers: { 'Api-User-Agent': API_USER_AGENT },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error('Le Wiktionnaire ne répond pas');
  }

  return response.json();
}

export async function isFrenchWord(guess) {
  const searchResult = await askWiktionary('action=query&list=search&srlimit=10&srsearch=' + guess);

  const titles = [];
  for (const page of searchResult.query.search) {
    if (normalizeWord(page.title) === guess) {
      titles.push(page.title);
    }
  }

  if (titles.length === 0) {
    return false;
  }

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

export function getWiktionaryUrl(word) {
  return WIKTIONARY_PAGE_URL + word;
}
