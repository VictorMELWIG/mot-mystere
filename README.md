## Partie logique (loulou733)

Je me suis occupé de toute la logique du jeu : les règles, l'état de la partie, la sauvegarde
dans le navigateur, les appels au Wiktionnaire et les tests. Victor s'est occupé de l'affichage.
Voici tout ce que j'ai fait depuis le 23/10.

### Réorganisation du code
- J'ai regroupé la logique dans quelques fichiers seulement, pour que ce soit plus simple à suivre :
  `rules.js` (accents, couleurs, points, mode difficile), `scores.js` (classements et statistiques)
  et `gameReducer.js` (état de la partie).
- J'ai sorti les réglages de l'API du Wiktionnaire
  dans `config.js`, pour les avoir à un seul endroit.
- J'ai supprimé les anciens petits fichiers qui ne servaient plus.

### Palier 3 : sauvegarde des parties
- Chaque partie terminée est enregistrée dans le `localStorage` (`gamesStorage.js`) avec le pseudo,
  le mot, le nombre d'essais, les points, la date, la durée, la longueur et le mode.
- Si la valeur enregistrée est absente ou illisible, le jeu repart d'une liste vide au lieu de planter.
- Une même partie ne peut pas être enregistrée deux fois.
- Le tableau des scores et les statistiques sont calculés à partir de cette liste au moment de l'affichage.

### Palier 4 : le mot du jour
- Le mot du jour dépend du nombre de jours écoulés depuis le 01/01/2025 (`dailyWord.js`), donc
  tout le monde a le même mot, sur tous les ordinateurs.
- La date est calculée à l'heure de Paris : le mot change à minuit, heure française, pour tout le monde.
- La partie du jour est sauvegardée à chaque coup et pour chaque pseudo : si on recharge la page,
  elle reprend où elle en était, et une fois terminée, on ne peut pas la rejouer. Plusieurs joueurs
  du même ordinateur peuvent chacun faire le mot du jour.
- Un compte à rebours indique le temps restant avant minuit (`useCountdown.js`).
- Le classement du jour trie les joueurs par points, puis par temps de résolution (`getDailyScores`).
- Le résultat se partage sous forme de texte avec les couleurs 🟩🟨⬛, sans les lettres, copié dans
  le presse-papiers (`share.js`, `clipboard.js`). Si le navigateur refuse la copie, l'erreur est renvoyée
  pour qu'un message puisse s'afficher.

### Palier 5 : les variantes
- Mots de 6 et 7 lettres : le nombre d'essais est égal à la longueur + 1 (6 essais pour 5 lettres,
  7 pour 6, 8 pour 7). Si la longueur dans l'adresse n'existe pas, la partie se joue en 5 lettres.
- Mode difficile (`checkHardMode`) : une lettre verte doit rester à sa place et une lettre jaune doit
  être réutilisée. Sinon, le mot est refusé avec un message précis (par exemple « la 1re lettre doit
  être un P »). Je fais cette vérification avant d'appeler le Wiktionnaire : le mot refusé ne compte pas
  comme un essai, et on n'appelle pas l'API pour rien.
- Points : ×1,5 pour 6 lettres, ×2 pour 7 lettres, ×1,5 en mode difficile, et les bonus se cumulent.
- Le classement général peut être filtré par longueur et par mode.
- Les réglages (longueur, mode difficile) sont gardés entre deux visites (`useSettings.js`).
- Les statistiques acceptent les victoires en 7 ou 8 essais pour les mots longs.

### Simplification du code
- J'ai enlevé une vérification faite en double et une erreur qui ne pouvait jamais arriver.
