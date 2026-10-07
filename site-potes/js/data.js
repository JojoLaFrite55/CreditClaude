export const SITE = {
  name: "LE QG",
  tagline: "Des jeux, des memes et de la mauvaise foi. Rien à acheter.",
  announce: "Site privé entre potes — réservé à la bande",
};

export const NAV = [
  { label: "Accueil", href: "index.html", page: "home" },
  { label: "Jeux", href: "jeux.html", page: "jeux" },
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
];

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
    text: "Défends la frontière entre la Zone A et la Zone B. Vagues d'intrus, boss géant, arsenal et tourelles à débloquer.",
    href: "jeu.html",
    image: "assets/jeu-apercu.jpg",
    badge: "Nouveau",
    tags: ["Arcade", "Solo", "Gratuit"],
  },
];
