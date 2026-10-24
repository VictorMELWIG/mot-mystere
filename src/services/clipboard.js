// Copie un texte dans le presse-papiers (renvoie une promesse qui échoue si le navigateur refuse)
export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}
