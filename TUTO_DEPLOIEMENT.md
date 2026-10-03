# Tutoriel de déploiement : GitHub + Vercel

Ce guide explique, étape par étape, comment mettre le portfolio en ligne gratuitement sur Vercel, avec un déploiement automatique à chaque `git push`.

---

## 0. Ce que tu obtiens à la fin

- Une URL publique du type `https://joan-trichard-clermont.vercel.app` (HTTPS automatique).
- Toutes les pages pré-générées au build (SSG) et servies depuis le **CDN mondial de Vercel**, au plus près du visiteur.
- **CI/CD** :
  - chaque push sur `main` met à jour la production ;
  - chaque pull request reçoit une URL de prévisualisation ;
  - GitHub Actions vérifie le lint, les types et le build avant le merge.
- Les en-têtes de sécurité (HSTS, X-Frame-Options, etc.) appliqués sur toutes les pages.

---

## 1. Prérequis

| Outil | Version | Vérification |
|---|---|---|
| Node.js | 20.9 ou plus (22 LTS recommandé) | `node -v` |
| npm | fourni avec Node | `npm -v` |
| Git | n'importe quelle version récente | `git --version` |
| Compte GitHub | gratuit | https://github.com |
| Compte Vercel | offre **Hobby** gratuite | https://vercel.com/signup |

> L'offre Hobby de Vercel est réservée à un **usage personnel et non commercial**. Un portfolio personnel y a parfaitement sa place. Si un jour le site sert à vendre des prestations freelance, il faudra passer à l'offre Pro.

---

## 2. Tester le projet en local

```bash
git clone https://github.com/jojolafrite55/creditclaude.git
cd creditclaude
git checkout claude/dreamy-curie-awmrqq

npm install
npm run dev
```

Ouvre http://localhost:3000. Les modifications sont rechargées à chaud.

Avant de pousser, vérifie que tout compile exactement comme sur Vercel :

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm run build` doit afficher toutes les routes avec le symbole `○ (Static)` : elles sont pré-générées et seront servies depuis le CDN.

---

## 3. Mettre le code sur la branche `main` de GitHub

Le code se trouve actuellement sur la branche `claude/dreamy-curie-awmrqq` du dépôt `jojolafrite55/creditclaude`. Vercel déploie la production depuis `main`. Deux options :

### Option A : garder ce dépôt (le plus simple)

1. Sur GitHub, ouvre le dépôt `creditclaude`.
2. Un bandeau propose **Compare & pull request** pour la branche `claude/dreamy-curie-awmrqq`. Clique dessus.
3. Crée la pull request, puis **Merge pull request**.

Le dépôt étant vide avant cette branche, tu peux aussi faire en ligne de commande :

```bash
git checkout -b main
git push -u origin main
```

Ensuite, dans GitHub, va dans **Settings → General → Default branch** et choisis `main`.

### Option B : un dépôt dédié avec un nom propre (recommandé pour le CV)

Un nom comme `portfolio` fait plus pro dans une candidature.

1. Sur GitHub : **New repository**, nom `portfolio`, visibilité **Public**, **sans** README ni `.gitignore` (le projet les contient déjà).
2. Dans ton dossier local :

```bash
git remote rename origin old-origin
git remote add origin https://github.com/jojolafrite55/portfolio.git
git checkout -b main
git push -u origin main
```

---

## 4. Brancher le dépôt à Vercel

1. Va sur https://vercel.com/signup et choisis **Continue with GitHub**. Choisis l'offre **Hobby**.
2. Autorise l'application Vercel sur GitHub. Tu peux la limiter au seul dépôt du portfolio : c'est plus sûr.
3. Sur le tableau de bord Vercel : **Add New… → Project**.
4. Dans **Import Git Repository**, sélectionne ton dépôt puis **Import**.
5. Écran de configuration :
   - **Framework Preset** : `Next.js` (détecté automatiquement).
   - **Root Directory** : `./`
   - **Build Command** / **Output Directory** / **Install Command** : laisse les valeurs par défaut.
   - **Environment Variables** : rien d'obligatoire (voir étape 6).
6. Clique sur **Deploy**.

Environ une minute plus tard, Vercel affiche l'aperçu du site et son URL `*.vercel.app`.

---

## 5. Comment fonctionne le CI/CD

```
git push sur une branche ──► GitHub Actions : lint + typecheck + build
           │
           └──► Vercel : déploiement de prévisualisation (URL unique)

merge dans main ──────────► GitHub Actions : mêmes vérifications
           │
           └──► Vercel : déploiement en production
```

- Le workflow `.github/workflows/ci.yml` fait échouer la pull request si le code ne compile pas. Tu le vois dans l'onglet **Actions** de GitHub.
- Vercel commente chaque pull request avec un lien de prévisualisation : pratique pour vérifier une modification avant de la publier.
- Pour revenir en arrière : dans Vercel, onglet **Deployments**, ouvre le menu « … » d'un ancien déploiement puis **Promote to Production** (ou **Instant Rollback**).

Workflow quotidien pour modifier le site :

```bash
git checkout -b maj-projets
git add .
git commit -m "Ajout du projet homelab"
git push -u origin maj-projets
```

Ouvre ensuite la pull request, vérifie la prévisualisation et merge.

---

## 6. Variables d'environnement (optionnel)

| Variable | Rôle | Valeur |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canonique pour le SEO, le sitemap et les images Open Graph | `https://ton-domaine.fr` |

Sans cette variable, le site utilise automatiquement `VERCEL_PROJECT_PRODUCTION_URL`, fourni par Vercel. Ne l'ajoute que si tu branches un nom de domaine personnalisé.

Pour l'ajouter : **Project → Settings → Environment Variables**, puis redéploie (**Deployments → … → Redeploy**).

---

## 7. CDN, cache et fonctions « Edge » : ce qui se passe réellement

- **Pages statiques sur le CDN** : toutes les pages (`/`, `/a-propos`, `/parcours`, `/projets`, `/contact`), le `sitemap.xml`, le `robots.txt` et l'image Open Graph sont générés une seule fois au build. Vercel les réplique sur son réseau mondial : un visiteur à Montpellier ou à Montréal est servi depuis le point de présence le plus proche, sans aucun calcul serveur.
- **Assets** : JS, CSS, polices (auto-hébergées par `next/font`, donc aucun appel à Google côté visiteur) et le CV PDF sont servis par le CDN avec des en-têtes de cache longue durée.
- **En-têtes de sécurité** : définis dans `next.config.ts` et appliqués à chaque réponse par la plateforme.
- **À propos des Edge Functions** : depuis Next.js 16, le runtime `edge` est **déprécié**. Vercel exécute désormais les fonctions serveur sur **Fluid Compute** (Node.js), qui offre des démarrages rapides et peut être exécuté dans plusieurs régions. Ce portfolio étant 100 % statique, il ne consomme aucune exécution de fonction. Si tu ajoutes plus tard une API (par exemple l'envoi d'e-mails), elle tournera sur Fluid Compute sans configuration particulière. Pour la rapprocher des visiteurs européens : **Settings → Functions → Function Region** → `Paris (cdg1)`.

Vérifie que le cache fonctionne :

```bash
curl -I https://ton-site.vercel.app
```

L'en-tête `x-vercel-cache: HIT` indique que la page vient directement du CDN.

---

## 8. Nom de domaine personnalisé (optionnel)

1. Achète un domaine (par exemple `joan-trichard.fr` chez OVH, Gandi ou Cloudflare, environ 7 à 12 € par an).
2. Dans Vercel : **Project → Settings → Domains → Add**, puis saisis le domaine.
3. Vercel indique les enregistrements DNS à créer chez ton registrar :
   - domaine racine : enregistrement `A` vers l'IP donnée par Vercel ;
   - `www` : enregistrement `CNAME` vers la cible donnée par Vercel.
4. Le certificat HTTPS est généré automatiquement.
5. Ajoute `NEXT_PUBLIC_SITE_URL=https://joan-trichard.fr` (voir étape 6) et redéploie.

> Une fois le domaine définitif branché, garde le HSTS (`Strict-Transport-Security`) présent dans `next.config.ts` : il force le HTTPS. Retire seulement le mot-clé `preload` si tu ne comptes pas inscrire le domaine sur la liste de préchargement des navigateurs.

---

## 9. Contrôles qualité après la mise en ligne

| Outil | Ce qu'il vérifie |
|---|---|
| https://pagespeed.web.dev | Performances, accessibilité, SEO (vise 95 ou plus partout) |
| https://securityheaders.com | En-têtes de sécurité (note attendue : A) |
| https://www.opengraph.xyz | Aperçu du lien partagé sur LinkedIn ou Discord |
| Onglet **Analytics** de Vercel | Visites (gratuit, à activer en un clic) |

---

## 10. Modifier le contenu

Tout le texte est centralisé dans `src/content/` : il n'y a jamais besoin de toucher aux composants.

| Fichier | Contenu |
|---|---|
| `src/content/profile.ts` | Nom, titre, accroche, coordonnées, disponibilité (`availability.open`), lignes du terminal, textes « À propos » |
| `src/content/experience.ts` | Expériences professionnelles |
| `src/content/skills.ts` | Compétences, langues, diplômes |
| `src/content/projects.ts` | Projets et catégories de filtre |
| `src/content/home.ts` | Chiffres clés et cartes de l'accueil |
| `src/config/ui.ts` | Palette, durées, courbes et presets d'animation |
| `src/config/site.ts` | Métadonnées SEO et navigation |

> Les projets fournis sont des **exemples** (badge « Exemple » sur chaque carte). Remplace-les par tes vrais projets et supprime `placeholder: true` pour retirer le badge.

---

## 11. Aller plus loin : un vrai envoi d'e-mails

Aujourd'hui, le formulaire valide les champs côté client puis ouvre la messagerie du visiteur (`mailto:`), sans backend. Pour recevoir les messages directement :

1. Crée un compte gratuit sur https://resend.com et récupère une clé API.
2. Ajoute `RESEND_API_KEY` dans les variables d'environnement Vercel. Ne la commite jamais : `.env*` est déjà ignoré par Git.
3. Crée une Server Action (`"use server"`) qui revalide les champs avec `validateContact` (`src/lib/validation.ts`) puis appelle l'API Resend.
4. Dans `ContactForm.tsx`, remplace la redirection `mailto:` par l'appel à cette action.

---

## 12. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Le build Vercel échoue sur « Node version » | Version de Node trop ancienne | **Settings → Build and Deployment → Node.js Version** → `22.x` |
| La GitHub Action échoue mais le build local passe | Fichier non commité ou `package-lock.json` désynchronisé | `npm install`, puis commite `package-lock.json` |
| Le bouton « Télécharger mon CV » renvoie une 404 | PDF renommé | Le fichier doit être dans `public/` et correspondre à `cvPath` dans `profile.ts` |
| Les animations ne se lancent pas | Option « réduire les animations » activée dans le système | Comportement voulu pour l'accessibilité (`MotionConfig reducedMotion="user"`) |
| Le lien partagé n'affiche pas d'aperçu | Cache du réseau social | Force le rafraîchissement avec le Post Inspector de LinkedIn |
