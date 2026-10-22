# Le Mot Mystère

Jeu de lettres en React : trouver un mot de 5 lettres en 6 essais, avec vérification des mots par le Wiktionnaire.

## Binôme

- **[Prénom NOM] (loulou733)** : logique du jeu (`src/logic/`, `src/hooks/`, `src/services/`)
- **Victor Melwig** : affichage (pages, composants, style)

## Installer et lancer

```bash
npm install      # installer les dépendances
npm run dev      # lancer le jeu en local
npm test         # lancer les tests
npm run lint     # vérifier le code
npm run build    # construire la version de production
```

## Palier visé et état

**Palier visé :** _à compléter_

| Palier | Logique | Affichage |
|---|---|---|
| 1. Le jeu | ✅ terminé | _à compléter (Victor)_ |
| 2. Le dictionnaire | ✅ terminé | _à compléter (Victor)_ |
| 3. Le confort de jeu | ✅ terminé : couleurs du clavier, tableau des scores, statistiques | _à compléter (Victor)_ |
| 4. Le mot du jour | ❌ | ❌ |
| 5. Les variantes | 🟡 commencé : longueur du mot généralisée, points avec multiplicateurs | ❌ |
| 6. Les quatre grilles | ❌ | ❌ |

## Organisation de la logique

Toute la logique est séparée de l'affichage : les composants ne font qu'afficher ce que leur donne `useGame`.

```
src/
├── logic/
│   ├── normalize.js          met un mot en majuscules sans accents (école → ECOLE, cœur → COEUR)
│   ├── evaluateGuess.js      calcule les couleurs d'une proposition (vert, jaune, gris)
│   ├── validateGuessWord.js  vérifie qu'une proposition a le bon nombre de lettres
│   ├── randomWord.js         tire un mot mystère au hasard dans la liste
│   ├── gameReducer.js        l'état de la partie et toutes ses règles
│   ├── keyboardState.js      la couleur de chaque lettre pour le clavier à l'écran
│   ├── scoring.js            calcule les points d'une partie
│   ├── leaderboard.js        calcule le tableau des scores (les 10 meilleures parties)
│   └── stats.js              calcule les statistiques d'un joueur
├── services/
│   └── wiktionary.js         tous les appels à l'API du Wiktionnaire
├── hooks/
│   ├── useGame.js            relie le reducer, le Wiktionnaire et la page de jeu
│   └── usePhysicalKeyboard.js  écoute le clavier de l'ordinateur
└── data/
    ├── mots-solutions.json   la liste des mots mystères de 5 lettres
    └── words.js              range les listes de mots par longueur
```

## Choix techniques (logique)

### Un reducer pour l'état de la partie

Tout l'état de la partie (mot mystère, essais, ligne en cours, victoire ou défaite) est géré par un seul reducer (`useReducer`). Les règles sont donc toutes au même endroit, faciles à tester et séparées de l'affichage. La page envoie seulement des actions (`ADD_LETTER`, `SUBMIT_GUESS`…), et le reducer décide si elles sont permises.

### Les couleurs et les lettres en double

`evaluateGuess` fait deux passages :
1. il marque d'abord en vert toutes les lettres bien placées ;
2. puis il attribue les jaunes en « consommant » les lettres du mot mystère encore disponibles.

Ainsi, avec le mot ARBRE et la proposition ERRER, on n'obtient pas plus de R jaunes ou verts qu'il n'y a de R dans le mot.

### Les accents

Tous les mots sont comparés en majuscules et sans accents grâce à `normalize("NFD")`, qui sépare la lettre de son accent. La ligature œ est remplacée à la main par OE. Le mot mystère est aussi gardé avec ses accents (`solution`) pour être affiché correctement en fin de partie.

### La vérification par le Wiktionnaire

Le joueur tape sans accents (ECOLE), alors que la page du Wiktionnaire s'appelle « école ». On fait donc deux requêtes :
1. une **recherche** (`list=search`), qui ignore les accents, puis on garde les pages dont le titre sans accents est égal à la proposition ;
2. une demande des **catégories** de ces pages, pour vérifier qu'au moins une est dans la catégorie « français » (le Wiktionnaire contient des mots de toutes les langues).

Toutes les requêtes passent par `src/services/wiktionary.js`, avec le paramètre `origin=*` et l'en-tête `Api-User-Agent` demandés.

Pendant la vérification, le jeu est en état `isChecking` : le joueur voit que l'application travaille et ne peut ni valider une seconde fois ni modifier sa ligne. Un mot refusé ne compte pas comme un essai.

### Si le Wiktionnaire ne répond pas

Si l'API ne répond pas (panne, pas d'internet, ou plus de 5 secondes d'attente), **le mot est accepté sans vérification** et le joueur est prévenu par un message.

Nous avons préféré accepter plutôt que refuser : refuser bloquerait complètement la partie tant que l'API est en panne, puisque plus aucun mot ne pourrait être validé. Accepter un mot non vérifié est un moindre mal, et le joueur sait que la vérification n'a pas eu lieu.

### Le clavier de l'ordinateur

Les touches sont écoutées avec un écouteur `keydown` ajouté dans un `useEffect` et retiré dans sa fonction de nettoyage, pour ne pas accumuler les écouteurs. Les fonctions appelées sont dans la liste de dépendances de l'effet : l'écouteur utilise donc toujours l'état à jour de la partie. Les touches qui ne sont pas des lettres et les raccourcis du navigateur (Ctrl, Cmd, Alt) sont ignorés.

### Les points

Barème de base : 600 points en 1 essai, puis 100 de moins par essai, jusqu'à 100 en 6 essais, et 0 si la partie est perdue.

Pour le palier 5, les multiplicateurs (× 1,5 pour 6 lettres, × 2 pour 7 lettres, × 1,5 en mode difficile) **se multiplient entre eux** : un mot de 7 lettres en mode difficile rapporte × 3. Chaque difficulté s'ajoute à l'autre, donc il nous a paru logique que leurs bonus se cumulent.

### L'enregistrement d'une partie

À la fin de chaque partie, `useGame` prépare un résumé simple (`gameResult`) : le mot, le nombre d'essais, les points, gagné ou perdu, la date, le temps de résolution, la longueur du mot et le mode. Il suffit d'y ajouter le pseudo pour l'enregistrer dans la liste des parties.

Le temps de résolution est enregistré dès maintenant (heure de début notée au lancement de la partie, heure de fin notée quand elle se termine), pour pouvoir faire le classement du mot du jour au palier 4 sans changer le format des données.

### Le tableau des scores

On enregistre seulement la liste des parties terminées. Le classement n'est jamais enregistré : il est **recalculé à chaque affichage** par `getTopScores` :
1. on garde les parties gagnées (une partie perdue n'a pas de mot trouvé) ;
2. on trie par points, du plus grand au plus petit ;
3. on garde les 10 premières.

**Second critère de tri :** en cas d'égalité de points, **la partie la plus ancienne passe devant**. Comme pour un record, celui qui a fait le score en premier garde sa place. Deux parties à égalité apparaissent ainsi toujours dans le même ordre.

### Les statistiques

`getStats` relit toutes les parties dans l'ordre où elles ont été jouées et ne garde que celles du joueur demandé. Plusieurs joueurs peuvent donc partager le même ordinateur. Elle calcule les parties jouées, le pourcentage de victoires, la série en cours (remise à zéro à chaque défaite), la meilleure série, le total des points et la répartition des victoires selon le nombre d'essais.

### Une logique prête pour 6 et 7 lettres

Aucune longueur n'est écrite en dur dans la logique : tout se base sur la longueur du mot mystère. Les listes de mots sont rangées par longueur dans `src/data/words.js`.

## Difficultés rencontrées (logique)

- **Les lettres en double** : en comparant les lettres une par une, on risque de colorer en jaune plus de lettres qu'il n'y en a dans le mot. Les deux passages décrits plus haut règlent ce problème.
- **Retrouver un mot tapé sans accents** : une recherche exacte de « ECOLE » ne trouve pas la page « école ». Nous utilisons la recherche du Wiktionnaire, qui ignore les accents, puis nous comparons les titres sans accents.
- **Les mots étrangers** : une page qui existe sur le Wiktionnaire n'est pas forcément un mot français (« tisch » est allemand). Nous vérifions la catégorie « français » de la page.
- **Le clavier et l'état périmé** : si l'écouteur n'est branché qu'une seule fois, la touche Entrée voit toujours l'état du début de la partie (ligne vide) et refuse tous les mots. Nous avons mis les fonctions dans les dépendances du `useEffect` pour que l'écouteur utilise toujours l'état à jour.
- **Une vérification qui prend du temps** : un reducer doit répondre tout de suite et ne peut pas attendre une réponse d'internet. L'appel au Wiktionnaire se fait donc dans `useGame`, qui envoie ensuite le résultat au reducer (`START_CHECK`, puis `SUBMIT_GUESS` ou `REJECT_GUESS`).

## Bibliothèques ajoutées

_À compléter (Victor)._

## Reste à faire (logique)

- Remplacer `mots-solutions.json` par la liste fournie avec les accents
- Écrire les tests automatisés (coloration, lettres en double, normalisation, points, classement, statistiques)
