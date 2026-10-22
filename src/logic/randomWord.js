export function getRandomWord(wordList) {
  // 1. Générer un index aléatoire entre 0 et wordList.length - 1
  const randomIndex = Math.floor(Math.random() * wordList.length);

  // 2. Renvoyer le mot tel quel, avec ses accents (le reducer s'occupe de l'enlever pour jouer)
  return wordList[randomIndex];
}
