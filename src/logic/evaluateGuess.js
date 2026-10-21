export function evaluateGuess(guess, targetWord) {
  if (guess.length !== 5 ) {
    throw new Error("Les mots doivent contenir exactement 5 lettres.");
  }
  
  const result = Array(5).fill('absent'); // Par défaut, tout est gris
  const targetLetters = targetWord.split(''); // Transforme le mot mystère en tableau de lettres
  const guessLetters = guess.split('');

  // 1. PREMIER PASSAGE : Vérifier les VERT (bien placés)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
    }
  }

  // 2. SECOND PASSAGE : Vérifier les JAUNE (mal placés) et laisser le reste GRIS
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue; // Ignorer les lettres déjà marquées comme correctes

    for (let j = 0; j < 5; j++) {
      if (result[j] === 'correct') continue; // Ignorer les lettres déjà marquées comme correctes

      if (guessLetters[i] === targetLetters[j]) {
        result[i] = 'present';
        targetLetters[j] = null; // Marquer cette lettre comme utilisée
        break; // Sortir de la boucle interne après avoir trouvé une correspondance
      }
    }
  }

  return result;
}