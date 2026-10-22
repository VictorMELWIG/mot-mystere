# Le Mot Mystère

Un jeu de mots en React : trouver un mot de 5 lettres en 6 essais, avec les couleurs vert / jaune / gris après chaque essai. Les mots proposés sont vérifiés avec l'API du Wiktionnaire.

Site en ligne : pas encore déployé (à partir du palier 4).

## Le binôme

- **Victor Melwig-Maes** : l'affichage (pages, composants, CSS, navigation)
- **[Prénom NOM] (loulou733)** : la logique du jeu (`src/logic/`, `src/hooks/useGame.js`, `src/services/`, `src/data/`, les tests)

## Palier visé

Palier 4 (le mot du jour).

## État des paliers

| Palier | Logique | Affichage | État |
|---|---|---|---|
| 1 - le jeu | faite | fait | le build passe, à vérifier en jouant |
| 2 - le dictionnaire | faite (Wiktionnaire, mot refusé, API en panne) | fait (message, ligne refusée, vérification en cours) | le build passe, à vérifier en jouant |
| 3 - le confort de jeu | faite (couleurs du clavier, calcul du tableau des scores et des stats) | fait (clavier à l'écran, animations, règles, pages scores et stats) | commencé : les parties finies sont pas encore enregistrées, donc les pages scores et stats sont pas encore branchées |
| 4 - le mot du jour | pas commencée | fait (page du jour, partage, compte à rebours), vercel.json écrit | pas fait, pas déployé |

Les pages d'un palier dont la logique est pas prête sont mises en commentaire (dans main.jsx, Pages.jsx et GamePage.jsx), avec une ligne qui dit pourquoi. Comme ça le build marche toujours avec les paliers d'avant.

## Installer et lancer

Il faut Node.js (testé avec Node 24).

```bash
npm install      # installer les dépendances
npm run dev      # lancer le jeu en local sur http://localhost:5173
npm run lint     # vérifier le code avec oxlint
npm run build    # construire la version en ligne dans dist/
npm test         # lancer les tests (vitest)
```

## Structure du projet

```
src/
├── main.jsx                  point de départ : l'en-tête commun et la liste des pages avec leur adresse
├── constants.js              les réglages du jeu (longueur du mot, nombre d'essais), utilisés par l'affichage et la logique
├── components/
│   └── Board.jsx             le plateau : message, grille (lignes, cases), clavier AZERTY à l'écran et clavier de l'ordi
├── pages/
│   ├── GamePage.jsx          la partie libre et l'écran de fin (+ mot du jour, partage, compte à rebours : palier 4)
│   └── Pages.jsx             l'accueil, les règles, la page introuvable (+ scores et stats : palier 3)
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
│   └── useGame.js            relie le reducer, le Wiktionnaire et la page de jeu
├── data/
│   ├── mots-solutions.json   la liste des mots mystères de 5 lettres
│   └── words.js              range les listes de mots par longueur
└── styles/index.css          tout le style du jeu
tests/                        les tests vitest de la logique
vercel.json                   les rewrites pour que toutes les adresses marchent en ligne
```

Les adresses : `/` accueil, `/partie` partie libre, `/regles` règles, et plus tard `/scores`, `/stats` et `/jour`. Une adresse qui existe pas affiche la page introuvable.

## Choix techniques

### La logique est séparée de l'affichage

Tout ce qui calcule (couleurs, points, classement, stats) est dans `src/logic`, en fonctions simples sans React. Les pages prennent ce que leur donne `useGame` (`state`, `keyboardStatuses`, `score`, `solutionUrl`...) et l'affichent, elles calculent rien.

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

Pendant la vérification, le jeu est en état `isChecking` : le joueur voit « Vérification du mot... », la ligne clignote, et il peut ni valider une seconde fois ni modifier sa ligne. Un mot refusé compte pas comme un essai : le message s'affiche en rouge et la ligne tremble.

### Si le Wiktionnaire ne répond pas

Si l'API ne répond pas (panne, pas d'internet, ou plus de 5 secondes d'attente), **le mot est accepté sans vérification** et le joueur est prévenu par un message.

Nous avons préféré accepter plutôt que refuser : refuser bloquerait complètement la partie tant que l'API est en panne, puisque plus aucun mot ne pourrait être validé. Accepter un mot non vérifié est un moindre mal, et le joueur sait que la vérification n'a pas eu lieu.

Côté affichage, ce message arrive dans le même champ que les refus (`errorMessage`). La ligne est montrée comme refusée seulement si elle a encore des lettres dedans : quand le mot a été accepté, la nouvelle ligne vide reste normale.

### Le clavier de l'ordinateur

Les touches sont écoutées avec un écouteur `keydown` ajouté dans un `useEffect` et retiré dans sa fonction de nettoyage, pour ne pas accumuler les écouteurs. Les fonctions appelées sont dans la liste de dépendances de l'effet : l'écouteur utilise donc toujours l'état à jour de la partie. Les touches qui ne sont pas des lettres et les raccourcis du navigateur (Ctrl, Cmd, Alt) sont ignorés.

### Le clavier à l'écran

Il est en AZERTY et fait exactement pareil que le clavier de l'ordi. Chaque touche prend la couleur de ce qu'on sait sur la lettre (`keyboardStatuses`, calculé par `keyboardState.js`) : si une lettre a eu plusieurs couleurs, on garde la meilleure (vert, puis jaune, puis gris).

### Les animations

Elles sont en CSS. Le retournement des cases c'est une animation avec un délai différent pour chaque case (index × 0,25 s). Pour faire trembler la ligne à chaque refus, la ligne en cours a comme `key` le nombre de refus (`rejectCount`) : quand il change, React refait la ligne et l'animation repart.

### Les points

600 points en 1 essai, puis 100 de moins par essai, jusqu'à 100 en 6 essais, et 0 si la partie est perdue.

| Mot trouvé en | 1 essai | 2 essais | 3 essais | 4 essais | 5 essais | 6 essais | Perdu |
|---|---|---|---|---|---|---|---|
| Points | 600 | 500 | 400 | 300 | 200 | 100 | 0 |

### L'enregistrement d'une partie

À la fin de chaque partie, `useGame` prépare un résumé simple (`gameResult`) : le mot, le nombre d'essais, les points, gagné ou perdu, la date et le temps de résolution. Il suffit d'y ajouter le pseudo pour l'enregistrer dans la liste des parties.

Le temps de résolution est enregistré dès maintenant (heure de début notée au lancement de la partie, heure de fin notée quand elle se termine), pour pouvoir faire le classement du mot du jour au palier 4 sans changer le format des données.

### Le tableau des scores

On enregistre seulement la liste des parties terminées. Le classement n'est jamais enregistré : il est **recalculé à chaque affichage** par `getTopScores` :
1. on garde les parties gagnées (une partie perdue n'a pas de mot trouvé) ;
2. on trie par points, du plus grand au plus petit ;
3. on garde les 10 premières.

**Second critère de tri :** en cas d'égalité de points, **la partie la plus ancienne passe devant**. Comme pour un record, celui qui a fait le score en premier garde sa place. Deux parties à égalité apparaissent ainsi toujours dans le même ordre.

### Les statistiques

`getStats` relit toutes les parties dans l'ordre où elles ont été jouées et ne garde que celles du joueur demandé. Plusieurs joueurs peuvent donc partager le même ordinateur. Elle calcule les parties jouées, le pourcentage de victoires, la série en cours (remise à zéro à chaque défaite), la meilleure série, le total des points et la répartition des victoires selon le nombre d'essais.

### Les paliers branchés un par un

L'affichage a avancé plus vite que la logique. Un import vers une fonction qui existe pas fait échouer tout le build, et un build cassé casse aussi les paliers d'avant. Donc tant que la logique d'un palier est pas prête, ses routes, ses liens et ses imports sont en commentaire, avec une ligne `//palier N` qui dit pourquoi.

## Bibliothèques en plus

En plus de React et React Router (demandés dans le sujet) :

- **oxlint** : le linter. Il est beaucoup plus rapide qu'ESLint et il a déjà les règles React (rules-of-hooks).
- **vitest** : pour les tests de la logique. Il marche directement avec Vite, sans configuration en plus.

Tailwind CSS, PostCSS et autoprefixer sont encore dans le package.json mais ils servent à rien : tout le style est en CSS normal. Ils seront désinstallés avant le rendu.

## Difficultés rencontrées

Côté logique (loulou733) :

- **Les lettres en double** : en comparant les lettres une par une, on risque de colorer en jaune plus de lettres qu'il n'y en a dans le mot. Les deux passages décrits plus haut règlent ce problème.
- **Retrouver un mot tapé sans accents** : une recherche exacte de « ECOLE » ne trouve pas la page « école ». Nous utilisons la recherche du Wiktionnaire, qui ignore les accents, puis nous comparons les titres sans accents.
- **Les mots étrangers** : une page qui existe sur le Wiktionnaire n'est pas forcément un mot français (« tisch » est allemand). Nous vérifions la catégorie « français » de la page.
- **Le clavier et l'état périmé** : si l'écouteur n'est branché qu'une seule fois, la touche Entrée voit toujours l'état du début de la partie (ligne vide) et refuse tous les mots. Nous avons mis les fonctions dans les dépendances du `useEffect` pour que l'écouteur utilise toujours l'état à jour.
- **Une vérification qui prend du temps** : un reducer doit répondre tout de suite et ne peut pas attendre une réponse d'internet. L'appel au Wiktionnaire se fait donc dans `useGame`, qui envoie ensuite le résultat au reducer (`START_CHECK`, puis `SUBMIT_GUESS` ou `REJECT_GUESS`).

Côté affichage (Victor) :

- **Faire trembler la ligne à chaque refus.** Au deuxième mot refusé de suite, la classe CSS était déjà là donc l'animation repartait pas. On a réglé ça avec le nombre de refus comme `key` de la ligne.
- **Retourner les cases une par une.** Chaque case a son propre `animationDelay` selon sa place dans la ligne.
- **Le message du dictionnaire en panne.** Il arrive dans `errorMessage` comme un refus, alors que le mot est accepté : la nouvelle ligne vide devenait rouge et tremblait. Maintenant la ligne est montrée refusée seulement si elle a des lettres dedans.
- **Le build qui casse quand la logique est pas encore là.** On a mis les paliers pas prêts en commentaire (voir plus haut).

## Reste à faire

- Enregistrer les parties finies (pseudo + `gameResult`) pour brancher les pages scores et stats (palier 3)
- Remplacer `mots-solutions.json` par la liste fournie avec les accents
- Écrire les tests automatisés (coloration, lettres en double, normalisation, points, classement, statistiques)
- Le mot du jour, le partage, le compte à rebours et la mise en ligne sur Vercel (palier 4)
- Désinstaller Tailwind, PostCSS et autoprefixer

## À COMPLÉTER PAR LOULOU733

- Ton prénom et ton nom en haut, dans « Le binôme ».
- **Comment le mot du jour est choisi** pour être le même pour tout le monde et changer à minuit heure française (palier 4).
- **Les tests** : ce qu'ils vérifient.
