# LE QG — site entre potes

Site statique (HTML, CSS, JavaScript) : design inspiré des boutiques Shopify, avec des jeux et des memes.

## Lancer en local

Depuis le dossier du projet :

```powershell
cd site-potes
npx serve
```

Puis ouvre l'adresse affichée (généralement http://localhost:3000). Le site utilise des modules JavaScript :
il ne fonctionne pas en double-cliquant sur `index.html`, il faut passer par un petit serveur.

## Contenu

| Page | Fichier |
|---|---|
| Accueil | `index.html` |
| Jeux | `jeux.html` |
| Kill all the Jules | `jeu.html` + `js/game/` |
| Memes (galerie + générateur) | `memes.html` |
| Jeux (18) : Flappy Tête, Tape-Tête, Serpent, Memory, Clicker, Casse-Tête, 2048, Mot-Tête, Puissance 4, Course, Réflexes, Démineur, Simon, Pierre-feuille-ciseaux, Pendu, Tire-Tête, Taquin | `*.html` + `js/games/` |
| Outils (14) : Roulette, Soundboard, Affiches, Tier list (22 thèmes), Excuses, Textes, Équipes, Scores, Dés, Action ou vérité, Susceptible, Tu préfères, Minuteur, Le grand random | `outils.html` + `js/tools/` |

## Personnaliser

- Têtes des intrus : `assets/heads/tete-1.png` à `tete-4.png` (PNG à fond transparent).
- Têtes du policier : dossier `assets/police/` + tableau `POLICE` dans `js/data.js`.
- Memes de la galerie, jeux et outils listés, nom du site : `js/data.js`.
- Les records et sauvegardes sont stockés dans le navigateur de chaque joueur.
- Réglages de difficulté et boss : `js/game/waves.js`.
- Armes, prix, tourelles et améliorations de mines : `js/game/weapons.js`.
- Véhicules et ennemis : `js/game/vehicle.js` et `js/game/waves.js`.
- Sauvegarde (argent, armes débloquées) : stockée dans le navigateur, effaçable avec `localStorage.removeItem("qg-jules-save")`.

## Déployer sur Vercel

Importer le dépôt, puis dans les réglages du projet : **Root Directory** = `site-potes`, **Framework Preset** = `Other`, aucune commande de build.

## Easter egg

Konami code (haut haut bas bas gauche droite gauche droite B A) ou six clics sur le logo du pied de page. Échap pour fuir. Le code est dans `js/enfer.js`, la vidéo dans `assets/enfer/`.

La chèvre 🐐 en bas à gauche de l'accueil mène à `sacrifice.html` : tuer la chèvre, tracer le pentagramme avec son sang, puis le rituel s'ouvre (`js/sacrifice.js`, rendu dans `js/gore/`, images libres de droits dans `assets/gore/`, crédits dans `assets/gore/CREDITS.md`).

Le petit 🚗 presque invisible dans le pied de page (survole-le) ouvre la vidéo du trajet (`js/voiture.js`).
Le "67" presque invisible tout à droite de la barre noire en haut (survole-le) ouvre la vidéo du 67 man (`js/soixantesept.js`).
Le 🐺 gris presque invisible dans le pied de page, à gauche de la 🚗 (survole-le), ouvre la vidéo du loup sigma (`js/soixantesept.js`, `assets/secret/loup.*`).
Le 🎤 gris presque invisible du pied de page ouvre le même jeu de rythme sur la vidéo du micro.

Les sons du sacrifice sont de vrais échantillons CC0 (`assets/sfx/`, crédits dans `assets/sfx/CREDITS.md`).

Le 🚗 du pied de page lance maintenant la vidéo avec le son « Stadium Rave » (`assets/secret/stadium-rave.mp3`, en boucle, bouton pour le couper) et des effets (spectre, lasers, têtes qui rebondissent). Les photos complètes des potes sont dans `assets/photos/`, les têtes détourées dans `assets/heads/`.

## Rythme des potes

`rythme.html` (menu Jeux) : jeu de rythme à flèches (← ↓ ↑ → ou tap sur les colonnes) calé sur les vidéos du QG : Tiki Tiki — 67 Man, Le Doberman (les 18 premières secondes de la vidéo envoyée), Loup Sigma, La Visite du Duplex (coupée avant la fin), Les Danseurs, Propriété en Égypte, Les Bonbonnes, Le Circuit et Le Casse-Croûte (le Micro reste accessible via le 🎤 caché). Quatre difficultés (Facile, Normal, Difficile, Hardcore : plus de notes, flèches plus rapides, fenêtres de timing plus serrées, accords en Hardcore, multiplicateur de score) et un record par morceau et par difficulté. On peut monter ou baisser d'un cran depuis l'écran de fin.

Le moteur est dans `js/rhythm/` (`engine.js`, `songs.js`). Les notes sont générées depuis le son de chaque morceau (détection des attaques) et stockées dans `assets/rythme/charts.json`.

## Nouvelles photos

Cinq nouvelles têtes détourées (`assets/heads/tete-14` à `tete-18`) sont dans tous les jeux et outils qui piochent dans la liste des têtes. Les photos complètes (`assets/photos/gros-caca`, `chapeau`, `cri`, `webcam`, `moustache`) servent aussi de fonds de photo dans le générateur de memes.

Encore quatre têtes détourées (`tete-19` à `tete-22`, dont les trois potes aux lunettes de nuit), les photos `cri-noir`, `lunettes`, `concombres` et `oasis` en fonds photo pour les memes, et le morceau « Le Casse-Croûte » dans le jeu de rythme.

Quatre morceaux de plus dans le jeu de rythme (Le Manège, Disco Flash, Disco Couloir, Le Grand Disco), la tête `tete-23` et la photo `chemise-rose` (fond photo des memes).

Cinq morceaux de plus dans le jeu de rythme : Le Café, Fond Turquoise, Les Backup Dancers, Danse à Trois et Le Matelas.

Quatre morceaux de plus dans le jeu de rythme : Rendez-vous Tour Eiffel, Le Biscuit, Les Deux Visages et L'Aquarium.

Quatre morceaux de plus dans le jeu de rythme : Marché de Noël, Le Petit-Déj de Koda, Spaghetti et Disco et Attends !

Cinq morceaux de plus dans le jeu de rythme : La Dédicace, C'est Jason, Noooon !, Le Sourire et Le Pilote. « Noooon ! » est presque silencieux jusqu'au cri final : ses notes suivent donc une grille régulière puis le cri.

Trois morceaux de plus dans le jeu de rythme : Le Visage Étiré, Un Homme sur la Lune et Le Cri de Kirby.

« Le Filtre Muet » est une vidéo sans piste son : ses notes suivent une grille régulière.

Un morceau de plus dans le jeu de rythme : Les Grands Champions.

Un morceau de plus dans le jeu de rythme : Monténégro (vidéo recadrée sur le visage et les épaules).

## Nouveautés jeux et outils

Jeux : `invasion.html` (shoot'em up de têtes), `pong.html` (contre la machine), `slots.html` (machine à sous, jetons fictifs), `zoomtete.html` (retrouver une tête depuis un détail zoomé), `erreurs.html` (cinq erreurs sur les photos des potes, généré à chaque manche) et `blindtest.html` (retrouver la vidéo d'après un extrait sonore des morceaux du jeu de rythme).

Outils : `diplome.html` (diplôme téléchargeable en PNG), `boule.html` (boule magique).

Le jeu de rythme a maintenant une recherche et un filtre par durée pour s'y retrouver parmi les morceaux.

## Nouvelle vague de jeux et d'outils

Jeux : `tetris.html` (Tétris, avec écran tactile), `runner.html` (runner sans fin), `ballons.html` (crève-ballons, bombes et ballons dorés), `morpion.html` (contre la machine ou à deux, jusqu'au niveau « impossible »), `blackjack.html` (jetons fictifs), `chrono10.html` (arrêter à 10,00 s), `dactylo.html`, `silhouette.html` (une tête dans le noir qui s'éclaire), `videodevine.html` (image de vidéo pixelisée qui se précise), `saute.html` (type Doodle Jump), `tour.html` (empiler des étages) et `calcul.html`.

Outils : `addition.html` (partage de l'addition par article ou à parts égales, avec pourboire, sauvegardé sur l'appareil), `bingo.html` (grille partageable par lien), `compatibilite.html`, `quelpote.html` (quiz de personnalité) et `stickers.html` (atelier de montage : têtes, texte, photo de fond ou image importée, téléchargement PNG).

Corrections : chèvre de l'accueil intégrée au bloc d'accueil (elle ne recouvre plus rien), HUD et fenêtres de départ des jeux repensés pour le mobile, jeux qui tiennent dans la hauteur de l'écran, vignettes régénérées à partir de vraies captures, badges « Nouveau » réservés aux ajouts récents, têtes détourées avec des bords rectangulaires reprises.

Les pages Jeux et Outils ont une recherche et des filtres par thème (avec « Nouveautés »).

## Mode Flow (jeu de rythme)

Cinquième difficulté « Flow », placée entre Facile et Normal : elle garde toutes les notes du Hardcore (même tempo), mais sans accords et avec des enchaînements simples (une flèche répétée, deux flèches voisines en alternance, ou un escalier de flèches voisines, jamais de saut d'une extrémité à l'autre). Fenêtres de timing un peu plus larges que Normal, multiplicateur ×1,2. Les notes sont générées à partir du chart Hardcore dans `assets/rythme/charts.json` (clé `flow`).

« Le Filtre Muet » a été raccourci à 7 s : les 2 secondes qui montraient des fesses nues ont été coupées.

Quatre têtes de plus (`tete-24` à `tete-27`), détourées à partir de captures d'appel vocal : seule la vignette de la personne a été gardée, sans l'interface (ni le chat avatar ni le bandeau « Connexion Internet instable »).

Sept têtes de plus (`tete-28` à `tete-34`) : le filtre violet, le masque « 329 », les trois potes du canapé (une tête chacun), la tête du BeReal et le selfie en treillis (avec le téléphone). Les interfaces (noms d'utilisateur, bandeaux, vignettes) ont été écartées. Trois photos complètes (`canape`, `treillis`, `filtre-violet`) servent de fonds dans le générateur de memes, l'atelier montage et le jeu des cinq erreurs.
