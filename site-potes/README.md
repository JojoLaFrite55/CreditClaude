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

`rythme.html` (menu Jeux) : jeu de rythme à flèches (← ↓ ↑ → ou tap sur les colonnes) calé sur les vidéos du QG : Tiki Tiki — 67 Man, Le Doberman (les 18 premières secondes de la vidéo envoyée) et Loup Sigma (le Micro reste accessible via le 🎤 caché). Quatre difficultés (Facile, Normal, Difficile, Hardcore : plus de notes, flèches plus rapides, fenêtres de timing plus serrées, accords en Hardcore, multiplicateur de score) et un record par morceau et par difficulté. On peut monter ou baisser d'un cran depuis l'écran de fin.

Le moteur est dans `js/rhythm/` (`engine.js`, `songs.js`). Les notes sont générées depuis le son de chaque morceau (détection des attaques) et stockées dans `assets/rythme/charts.json`.
