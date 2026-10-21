import { normalizeWord } from './normalize.js';

export function getRandomWord(wordList) {
  // 1. Générer un index aléatoire entre 0 et wordList.length - 1
  const randomIndex = Math.floor(Math.random() * wordList.length);

  // 2. Récupérer le mot correspondant dans la liste
  const selectedWord = wordList[randomIndex];

  // 3. Le normaliser pour être sûr qu'il est en majuscules et sans accents
  return normalizeWord(selectedWord);
}