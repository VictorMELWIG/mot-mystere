# L'affichage du Mot Mystère

Ma partie du projet (Victor Melwig-Maes) : tout ce qu'on voit à l'écran, donc les pages, la navigation et le style. La logique c'est mon binôme loulou733 qui l'a faite, elle est expliquée dans le [README](README.md).

## Le principe

Mes composants calculent rien. Ils récupèrent l'état de la partie et les fonctions pour jouer avec `useGame` (le hook de mon binôme), et ils les branchent sur l'écran. Même les couleurs des cases c'est la logique qui les calcule : moi je mets juste leur nom dans une classe CSS.

C'est ce que demande le sujet, la logique séparée de l'affichage. Et du coup tant que `useGame` renvoie la même chose, la logique peut changer sans que l'affichage bouge.

## Ce que j'ai fait depuis le 23/10 (paliers 3 à 5)

Mon binôme a fait la logique des paliers 3, 4 et 5, et moi j'ai fait l'affichage qui va avec, sans toucher à sa logique.

**Palier 3 : le confort de jeu**

- Le clavier à l'écran disparaît à la fin d'une partie : il s'affiche que si `gameStatus` vaut `IN_PROGRESS`.
- J'ai fait le ménage dans mes commentaires, j'ai gardé que ceux qui expliquent un pourquoi.

**Palier 4 : le mot du jour**

- La page `/jour` (`DailyPage`) appelle `useGame(true)` : tout le monde a le même mot, et si on recharge la page la partie reprend. Elle réutilise le même plateau et le même écran de fin que la partie libre.
- Sur l'écran de fin du jour y a pas de bouton « Nouvelle partie », vu que le mot du jour se rejoue pas. Et si la partie du jour est déjà finie, l'écran de fin s'affiche direct quand on ouvre la page.
- À la place, l'écran de fin reçoit en `children` le bouton « Partager » et le compte à rebours. Le bouton copie le résultat en carrés de couleur, sans les lettres, et il dit si la copie a marché ou si le navigateur l'a refusée. Le compte à rebours affiche le temps avant le prochain mot, en `hh:mm:ss`.
- Le tableau des scores commence par le classement du mot du jour : par points puis par temps, et sans afficher le mot, pour pas le donner aux autres.
- Le lien « Mot du jour » est sur l'accueil.

**Palier 5 : les variantes**

- Sur l'accueil, on choisit la longueur du mot (5, 6 ou 7 lettres) et le mode difficile. Les réglages sont gardés entre deux visites avec `useSettings`.
- La longueur est dans l'adresse : « Nouvelle partie » ouvre par exemple `/partie?longueur=6`, et on peut aussi ouvrir cette adresse direct. Je la lis avec `useSearchParams`.
- La grille s'adapte : `Grid` fait `game.maxAttempts` lignes et `Row` fait `game.wordLength` cases, au lieu des constantes 6 et 5.
- La ligne du joueur rappelle la longueur et le mode, genre « Partie libre · 6 lettres · mode difficile ».
- En mode difficile, les refus de la logique (« la 1re lettre doit être un P ») s'affichent à la même place que d'habitude, avec la ligne rouge qui tremble. J'ai rien eu à rajouter pour ça.
- Le classement général montre la longueur et le mode de chaque partie, et on peut le filtrer avec 2 menus : la longueur et le mode.
- Les règles expliquent les variantes et les bonus de points.

## Mes fichiers

| Fichier | Ce qu'il y a dedans |
|---|---|
| `src/main.jsx` | le démarrage, l'en-tête commun et la liste des pages avec leur adresse |
| `src/pages/Pages.jsx` | l'accueil avec les réglages, les règles, les scores, les stats et la page introuvable |
| `src/pages/GamePage.jsx` | la partie libre, le mot du jour, l'écran de fin, le partage et le compte à rebours |
| `src/components/Board.jsx` | le plateau : le message, la grille, le clavier à l'écran et le clavier de l'ordi |
| `src/styles/index.css` | tout le style |
| `src/constants.js` | les réglages de base, 5 lettres et 6 essais (l'affichage s'en sert plus, y a que la logique qui l'utilise) |
| `vercel.json` | les rewrites pour que les adresses marchent en ligne |

## Les écrans

| Adresse | Page | Ce qu'on y voit |
|---|---|---|
| `/` | `HomePage` | le nom du jeu, le champ pseudo, la longueur et le mode difficile, « Nouvelle partie » et les liens vers les autres pages |
| `/partie?longueur=6` | `GamePage` | le joueur et ses réglages, le message, la grille, le clavier, puis l'écran de fin |
| `/jour` | `DailyPage` | pareil avec le mot du jour, puis le partage et le compte à rebours |
| `/scores` | `ScoresPage` | le classement du mot du jour, puis le classement général avec ses filtres |
| `/stats` | `StatsPage` | les chiffres du joueur et ses victoires selon le nombre d'essais |
| `/regles` | `RulesPage` | les règles, un exemple pour chaque couleur, les variantes et les points |
| n'importe quelle autre adresse | `NotFoundPage` | « Page introuvable » et un lien vers l'accueil |

## Comment les composants s'emboîtent

```
main.jsx                l'en-tête + les routes
├── HomePage            /, avec les réglages
├── GamePage            /partie?longueur=N, lit la longueur et le mode
│   └── FreeGame        key = longueur + mode, appelle useGame
│       ├── Board           le plateau
│       │   ├── GameMessage le message
│       │   ├── Grid        une ligne par essai
│       │   │   └── Row     une case par lettre
│       │   │       └── Tile    une case
│       │   └── Keyboard    le clavier à l'écran
│       └── EndGameModal    seulement quand la partie est finie
├── DailyPage           /jour, appelle useGame(true)
│   ├── Board           le même plateau
│   └── EndGameModal    avec ShareButton et Countdown dedans
├── RulesPage           /regles, ses exemples
│   └── ExampleRow      une ligne d'exemple
├── ScoresPage          /scores, 2 classements
│   └── ScoreTable      un tableau de scores
├── StatsPage           /stats
└── NotFoundPage        les autres adresses
```

Les données descendent par les props : la partie (`FreeGame` ou `DailyPage`) donne `game` à `Board`, qui le donne à `Grid`, qui donne à chaque `Row` son mot et ses couleurs. Et les actions remontent par des fonctions : une touche appelle `game.addLetter`, l'état change dans `useGame`, et React réaffiche ce qui en dépend.

## Mes choix, et pourquoi

**Le plateau reçoit tout par les props.** Y a que les pages de jeu qui appellent `useGame`, et elles passent tout au plateau. Comme ça on sait toujours d'où l'affichage sort ses données.

**5 fichiers, rangés par écran.** Ce qui sert au même écran est dans le même fichier : tout le plateau dans `Board.jsx`, les pages de jeu dans `GamePage.jsx`, les pages sans partie dans `Pages.jsx`. Chaque composant reste petit, et pour comprendre un écran t'ouvres un seul fichier. Pour une appli de cette taille, un fichier par composant ça aurait juste fait plus de fichiers et d'imports. Si l'appli grossit, suffit de sortir une page dans son propre fichier.

**Presque pas de state chez moi.** L'état de la partie est dans `useGame`, et les réglages dans `useSettings`. Mes seuls `useState` c'est pour l'accueil (le pseudo tapé et le message d'erreur), les filtres du tableau des scores, le message du bouton « Partager », et le mot du jour pour savoir s'il était déjà fini en arrivant.

**Le pseudo dans le `localStorage`.** Le sujet demande de le garder pour les visites d'après, et sans serveur c'est le plus simple : il reste dans le navigateur même quand on le ferme.

**La longueur dans l'adresse.** Le sujet le demande, et du coup on peut recharger ou ouvrir direct une partie en 7 lettres sans repasser par l'accueil. Le mode difficile, lui, reste dans les réglages.

**Une `key` pour relancer la partie.** `useGame` prépare la partie une seule fois, au premier affichage. Donc si on passe de 6 à 7 lettres sans quitter la page, faut recréer le composant : le contenu de la page de jeu a une `key` faite avec la longueur et le mode, et quand elle change React repart de zéro. C'est la même astuce que pour la ligne qui tremble.

**Le mot du jour réutilise tout.** Même plateau, même écran de fin : y a juste le bouton « Nouvelle partie » qui disparaît, et le contenu en plus (`children` : le partage et le compte à rebours). Pas de code copié-collé.

**Un clavier AZERTY à l'écran.** C'est un jeu en français, donc le clavier ressemble à celui des joueurs. Chaque touche prend la couleur de ce qu'on sait sur la lettre (`keyboardStatuses`), et Entrée est grisée pendant la vérif, pour pas valider 2 fois.

**Le clavier de l'ordi dans un `useEffect`.** L'écoute des touches est branchée après l'affichage et enlevée dans le nettoyage de l'effet. Sinon elle s'ajouterait plusieurs fois et elle resterait active sur les autres pages. Les raccourcis du navigateur (Ctrl, Cmd, Alt) sont ignorés.

**Le message toujours à la même place.** `GameMessage` est toujours affiché, même vide, avec une hauteur minimum : comme ça la grille bouge pas quand un message apparaît.

**Les animations en CSS.** Pas de bibliothèque en plus : les cases se retournent avec une animation `flip` avec un délai différent pour chaque case, la ligne refusée tremble avec `shake`, et la ligne en cours clignote pendant la vérif.

**Les règles réutilisent la vraie case.** Les exemples des 3 couleurs sont faits avec `Tile`, la même case que dans la grille, pas une copie. Si le style d'une case change, les exemples suivent.

**Les pages préparées avant leur logique.** L'affichage avançait plus vite que la logique. En attendant, les pages scores, stats et mot du jour étaient écrites mais en commentaire, avec une ligne qui disait pourquoi : un import vers une fonction qui existe pas fait planter tout le build. Elles ont été réactivées dès que la logique est arrivée.

**Tout le style dans un seul fichier.** `index.css` c'est du CSS normal, rangé par partie (les bases, l'en-tête, les pages, la grille, le clavier, l'écran de fin), avec les règles pour les petits téléphones à la fin.

## Les galères, et comment je les ai réglées

- **La ligne refusée tremblait qu'une fois.** Au 2e mot refusé d'affilée, la classe CSS était déjà là, donc l'animation repartait pas. J'ai mis le nombre de refus (`rejectCount`) dans la `key` de la ligne en cours : à chaque refus la key change, React recrée la ligne et l'animation repart.
- **Retourner les cases une par une.** Chaque case a un `animationDelay` de `place × 0,25 s`. Mais pendant ce délai la case montrait déjà sa couleur, du coup `backwards` la garde blanche tant que c'est pas son tour.
- **L'écran de fin arrivait trop tôt.** Il cachait la dernière ligne avant qu'elle ait fini de se retourner. Maintenant il attend que la dernière case ait fini : 1,6 s en 5 lettres (elle commence à 1 s et met 0,5 s à se retourner), un peu plus en 6 ou 7 lettres.
- **Le dico en panne mettait une ligne vide en rouge.** Son message arrive au même endroit qu'un refus, alors que le mot est accepté. Maintenant la ligne est montrée refusée que s'il reste des lettres dedans.
- **Entrée recliquait le dernier bouton.** Après un clic sur une touche à l'écran, appuyer sur Entrée recliquait aussi ce bouton. `preventDefault()` sur Entrée règle ça.
- **Changer de longueur relançait pas la partie.** La partie est préparée qu'au premier affichage. Réglé avec la `key` sur le contenu de la page de jeu (voir plus haut).
- **7 lettres ça dépassait de l'écran sur téléphone.** 7 cases de 55 px plus les écarts, c'est plus large qu'un petit téléphone. Du coup les cases rétrécissent quand l'écran est étroit.
- **Brancher mon affichage sur la logique.** Les noms que renvoie `useGame` c'était pas ceux que j'avais prévus. J'ai adapté l'affichage aux vrais noms (`state`, `keyboardStatuses`, `score`, `solutionUrl`, `wordLength`, `maxAttempts`…) au lieu de toucher à la logique de mon binôme.
- **Les adresses en ligne.** Sur Vercel, ouvrir direct `/jour` ou rafraîchir une page ça donnerait une erreur 404, parce que le serveur connaît que `index.html`. `vercel.json` lui dit de toujours renvoyer `index.html`, et après c'est React Router qui affiche la bonne page.

## La sécurité côté affichage

- Le pseudo et les réglages sont enregistrés dans le navigateur du joueur, et ils partent nulle part.
- React affiche tout ce qui est entre `{}` comme du texte : un pseudo genre `<script>alert(1)</script>` s'affiche tel quel et s'exécute pas. Et le projet utilise jamais `dangerouslySetInnerHTML`.
- Le lien vers le Wiktionnaire s'ouvre dans un nouvel onglet avec `rel="noreferrer"`, pour que la page ouverte puisse pas prendre la main sur l'onglet du jeu.
- Mes deux claviers envoient que des lettres de A à Z.
- Le partage copie que des carrés de couleur, jamais le mot.

## Tester mon affichage

```bash
npm install
npm run dev      # puis ouvrir http://localhost:5173
npm run lint
npm run build
```

Pour tout voir (faut internet pour le Wiktionnaire) :

1. Valider l'accueil sans pseudo : le message rouge.
2. Choisir 6 puis 7 lettres : l'adresse change (`/partie?longueur=7`), et la grille aussi (8 lignes de 7 cases).
3. Cocher le mode difficile, trouver une lettre verte, puis proposer un mot qui la déplace : le mot est refusé avec un message précis.
4. Taper un mot qui existe pas, genre ZZZZZ : le message rouge, la ligne qui tremble, et l'essai compte pas.
5. Faire le mot du jour et recharger la page au milieu : la partie reprend. À la fin : « Partager », le compte à rebours, et pas de « Nouvelle partie ».
6. Ouvrir le tableau des scores : le classement du jour, puis le classement général et ses filtres.
7. Ouvrir une adresse qui existe pas, genre `/nimportequoi` : la page introuvable.

Pour gagner vite une partie libre : sur l'accueil, tape `Math.random = () => 0` dans la console du navigateur (F12) avant de lancer la partie. Le mot mystère sera le premier de la liste.

## Ce qui est pas fait

- Le palier 6 (les quatre grilles).
