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
| Jeux : Flappy Tête, Tape-Tête, Serpent, Memory, Tête Clicker | `flappy.html`, `taupe.html`, `serpent.html`, `memory.html`, `clicker.html` + `js/games/` |
| Outils : Roulette, Soundboard, Affiches, Tier list, Excuses et horoscope | `outils.html` + `js/tools/` |

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
