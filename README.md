# Portfolio — Joan Trichard Clermont

Portfolio interactif d'un technicien système & réseau (BTS SIO SISR), orienté cybersécurité et infrastructures.

**Stack** : Next.js 16 (App Router, SSG) · TypeScript strict · Tailwind CSS 4 · Framer Motion · Lucide · Vercel

## Démarrage

```bash
npm install
npm run dev
```

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement sur http://localhost:3000 |
| `npm run build` | Build de production (pages statiques) |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Génération des types de routes + `tsc` |

## Structure

```
src/
├── app/                  Routes (/, /a-propos, /parcours, /projets, /contact), SEO, OG image
├── components/
│   ├── layout/           Navbar, Footer, fond animé
│   ├── sections/         Hero, terminal, timeline, compétences, projets, contact
│   ├── transition/       Transitions de page (rideau + template)
│   ├── providers/        MotionConfig + contexte de transition
│   └── ui/               Logo SVG, bouton magnétique, carte 3D, reveal, stagger…
├── config/
│   ├── site.ts           Métadonnées et navigation
│   └── ui.ts             Palette, durées, easings, springs, variants d'animation
├── content/              Tout le contenu éditable (profil, expériences, compétences, projets)
├── lib/                  Utilitaires (cn, validation du formulaire)
└── types/                Types du contenu
```

## Déploiement

Voir [TUTO_DEPLOIEMENT.md](./TUTO_DEPLOIEMENT.md).
