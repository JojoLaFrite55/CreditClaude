export const SITE = {
  name: "LE QG",
  tagline: "Des jeux, des memes et de la mauvaise foi. Rien à acheter.",
  announce: "Site privé entre potes — réservé à la bande",
};

export const NAV = [
  { label: "Accueil", href: "index.html", page: "home" },
  { label: "Jeux", href: "jeux.html", page: "jeux" },
  { label: "Outils", href: "outils.html", page: "outils" },
  { label: "Memes", href: "memes.html", page: "memes" },
];

const PHOTOS = [
  "assets/heads/tete-1.png",
  "assets/heads/tete-2.png",
  "assets/heads/tete-3.png",
  "assets/heads/tete-4.png",
  "assets/police/policier-1.png",
  "assets/police/policier-2.png",
  "assets/police/policier-3.png",
  "assets/heads/tete-5.png",
  "assets/heads/tete-6.png",
];

export const MEME_EXTRAS = ["assets/memes/soixante-sept.png"];

export const HEADS = PHOTOS;

export const POLICE = PHOTOS;

export const BACKGROUNDS = [
  { id: "ocean", label: "Océan", a: "#0f4c75", b: "#3282b8" },
  { id: "sunset", label: "Coucher", a: "#c0392b", b: "#f39c12" },
  { id: "lime", label: "Citron", a: "#1e8449", b: "#b7e44a" },
  { id: "violet", label: "Violet", a: "#4a235a", b: "#af7ac5" },
  { id: "graphite", label: "Graphite", a: "#17202a", b: "#566573" },
  { id: "sand", label: "Sable", a: "#b9770e", b: "#f5cba7" },
];

export const MEMES = [
  { head: 0, bg: "ocean", top: "Moi quand je dis", bottom: "J'arrive dans 5 minutes" },
  { head: 1, bg: "graphite", top: "Le groupe quand quelqu'un", bottom: "propose un plan" },
  { head: 2, bg: "sunset", top: "Ma tête quand", bottom: "le wifi coupe en pleine partie" },
  { head: 3, bg: "lime", top: "POV : t'as perdu", bottom: "à ton propre jeu" },
  { head: 0, bg: "violet", top: "Tout le monde dort", bottom: "moi à 4h du mat sur Discord" },
  { head: 2, bg: "sand", top: "Quand tu dis \"c'est ma tournée\"", bottom: "et que t'as plus de sous" },
  { head: 1, bg: "ocean", top: "Le mec qui lit le message", bottom: "et répond jamais" },
  { head: 3, bg: "sunset", top: "Moi après une victoire", bottom: "contre un débutant" },
];

export const GAMES = [
  {
    slug: "kill-all-the-jules",
    title: "Kill all the Jules",
    text: "Défends la frontière entre la Zone A et la Zone B. Vagues d'intrus, boss géant, véhicules, arsenal, tourelles et mines.",
    href: "jeu.html",
    image: "assets/jeu-apercu.jpg",
    badge: "Star",
    tags: ["Action", "Boss", "Arsenal"],
  },
  {
    slug: "flappy",
    title: "Flappy Tête",
    text: "Une tête qui bat des ailes entre des tuyaux. Simple, cruel, addictif.",
    href: "flappy.html",
    image: "assets/previews/flappy.jpg",
    badge: "Nouveau",
    tags: ["Arcade", "Record"],
  },
  {
    slug: "taupe",
    title: "Tape-Tête",
    text: "Des têtes sortent des trous, tu les bonkes au marteau. Têtes dorées et combos.",
    href: "taupe.html",
    image: "assets/previews/taupe.jpg",
    badge: "Nouveau",
    tags: ["Réflexes", "45 secondes"],
  },
  {
    slug: "serpent",
    title: "Serpent gourmand",
    text: "Le classique serpent, mais il mange des têtes. Il accélère à chaque palier.",
    href: "serpent.html",
    image: "assets/previews/serpent.jpg",
    badge: "Nouveau",
    tags: ["Classique", "Record"],
  },
  {
    slug: "memory",
    title: "Memory de la bande",
    text: "Retrouve les paires de têtes en un minimum de coups. Trois niveaux.",
    href: "memory.html",
    image: "assets/previews/memory.jpg",
    badge: "Nouveau",
    tags: ["Réflexion", "3 niveaux"],
  },
  {
    slug: "clicker",
    title: "Tête Clicker",
    text: "Clique sur la tête, gagne des likes, achète des chaînes YouTube et des concerts.",
    href: "clicker.html",
    image: "assets/previews/clicker.jpg",
    badge: "Nouveau",
    tags: ["Idle", "Sauvegarde auto"],
  },
];

export const TOOLS = [
  {
    slug: "roulette",
    title: "Roulette de la bande",
    text: "Qui paie la tournée ? Qui choisit le film ? La roue tranche.",
    href: "roulette.html",
    image: "assets/previews/roulette.jpg",
    badge: "Outil",
    tags: ["Décision", "Personnalisable"],
  },
  {
    slug: "soundboard",
    title: "Soundboard",
    text: "Vingt bruitages à balancer au pire moment : trombone triste, vine boom, sirène…",
    href: "soundboard.html",
    image: "assets/previews/soundboard.jpg",
    badge: "Outil",
    tags: ["Son", "Raccourcis clavier"],
  },
  {
    slug: "affiches",
    title: "Affiches",
    text: "Avis de recherche, employé du mois, certificat de nullité : télécharge l'affiche.",
    href: "affiches.html",
    image: "assets/previews/affiches.jpg",
    badge: "Outil",
    tags: ["Image", "Téléchargement"],
  },
  {
    slug: "tierlist",
    title: "Tier list",
    text: "Classe la bande de S à D en glissant les têtes, puis exporte l'image.",
    href: "tierlist.html",
    image: "assets/previews/tierlist.jpg",
    badge: "Outil",
    tags: ["Glisser-déposer", "Export"],
  },
  {
    slug: "excuses",
    title: "Excuses et horoscope",
    text: "Le générateur d'excuses de mauvaise foi et l'horoscope du jour.",
    href: "excuses.html",
    image: "assets/previews/excuses.jpg",
    badge: "Outil",
    tags: ["Humour", "Copier-coller"],
  },
];
