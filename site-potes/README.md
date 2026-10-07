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

## Personnaliser

- Têtes des intrus : `assets/heads/tete-1.png` à `tete-4.png` (PNG à fond transparent).
- Têtes du policier : dossier `assets/police/` + tableau `POLICE` dans `js/data.js`.
- Memes de la galerie, jeux listés, nom du site : `js/data.js`.
- Réglages de difficulté : `js/game/waves.js`.

## Déployer sur Vercel

Importer le dépôt, puis dans les réglages du projet : **Root Directory** = `site-potes`, **Framework Preset** = `Other`, aucune commande de build.
