const secret = (name) => new URL(`../../assets/secret/${name}`, import.meta.url).href;

export const CHARTS_URL = new URL("../../assets/rythme/charts.json", import.meta.url).href;

export const MICRO_SONG = { id: "micro", title: "Le Micro", sub: "La voix du micro, syllabe par syllabe", mp4: secret("micro.mp4"), webm: secret("micro.webm"), duration: "0:33", color: "#c24b99" };

export const SONGS = [
  { id: "67", title: "Tiki Tiki — 67 Man", sub: "Ultra slowed, ballon argenté", mp4: secret("67.mp4"), webm: secret("67.webm"), duration: "0:16", color: "#f2c230" },
  { id: "doberman", title: "Le Doberman", sub: "Pipi, caca, dobermans et bergers allemands", mp4: secret("doberman.mp4"), webm: secret("doberman.webm"), duration: "0:18", color: "#d9782b" },
  { id: "duplex", title: "La Visite du Duplex", sub: "Le duplex le plus branché du quartier", mp4: secret("duplex.mp4"), webm: secret("duplex.webm"), duration: "0:49", color: "#2f9e8f" },
  { id: "danse", title: "Les Danseurs", sub: "Chorégraphie sur fond rouge", mp4: secret("danse.mp4"), webm: secret("danse.webm"), duration: "0:09", color: "#e0245e" },
  { id: "egypte", title: "Propriété en Égypte", sub: "I bought a property in Egypt", mp4: secret("egypte.mp4"), webm: secret("egypte.webm"), duration: "0:07", color: "#d4a017" },
  { id: "bonbonnes", title: "Les Bonbonnes", sub: "Gymnastique entre les bouteilles de gaz", mp4: secret("bonbonnes.mp4"), webm: secret("bonbonnes.webm"), duration: "0:13", color: "#e85d9b" },
  { id: "circuit", title: "Le Circuit", sub: "Course de karts, version chaos", mp4: secret("circuit.mp4"), webm: secret("circuit.webm"), duration: "0:27", color: "#4a7bd0" },
  { id: "pain", title: "Le Casse-Croûte", sub: "Mâcher en rythme", mp4: secret("pain.mp4"), webm: secret("pain.webm"), duration: "0:14", color: "#c9792b" },
  { id: "manege", title: "Le Manège", sub: "Tour de fête foraine", mp4: secret("manege.mp4"), webm: secret("manege.webm"), duration: "0:07", color: "#e0a030" },
  { id: "disco-flash", title: "Disco Flash", sub: "Les lumières changent de couleur", mp4: secret("disco-flash.mp4"), webm: secret("disco-flash.webm"), duration: "0:11", color: "#8e44ad" },
  { id: "disco-couloir", title: "Disco Couloir", sub: "La suite, avec la porte", mp4: secret("disco-couloir.mp4"), webm: secret("disco-couloir.webm"), duration: "0:22", color: "#27ae60" },
  { id: "grand-disco", title: "Le Grand Disco", sub: "Plus d'une minute de lumières", mp4: secret("grand-disco.mp4"), webm: secret("grand-disco.webm"), duration: "1:09", color: "#2980b9" },
  { id: "loup", title: "Loup Sigma", sub: "Le hurlement de la meute", mp4: secret("loup.mp4"), webm: secret("loup.webm"), duration: "0:14", color: "#9aa3b2" },
];

export const DIFFS = [
  { key: "facile", label: "Facile", lead: 2.1, win: [0.09, 0.16, 0.24], mult: 0.7 },
  { key: "normal", label: "Normal", lead: 1.5, win: [0.065, 0.115, 0.17], mult: 1 },
  { key: "difficile", label: "Difficile", lead: 1.25, win: [0.055, 0.1, 0.14], mult: 1.4 },
  { key: "hardcore", label: "Hardcore", lead: 1.0, win: [0.045, 0.085, 0.12], mult: 2 },
];

export const bestKey = (songId, diffKey) => `qg-best-rythme-${songId}-${diffKey}`;

export const readBest = (songId, diffKey) => {
  try {
    return Number(localStorage.getItem(bestKey(songId, diffKey))) || 0;
  } catch {
    return 0;
  }
};

export const saveBest = (songId, diffKey, value) => {
  try {
    localStorage.setItem(bestKey(songId, diffKey), String(value));
  } catch {
    return;
  }
};

let chartsPromise = null;
export const loadCharts = () => {
  chartsPromise ||= fetch(CHARTS_URL).then((response) => response.json());
  return chartsPromise;
};
