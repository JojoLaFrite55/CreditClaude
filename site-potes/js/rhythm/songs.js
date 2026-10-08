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
  { id: "cafe", title: "Le Café", sub: "Le pantalon qui fait danser", mp4: secret("cafe.mp4"), webm: secret("cafe.webm"), duration: "0:19", color: "#a0522d" },
  { id: "turquoise", title: "Fond Turquoise", sub: "Un pas de danse, un fond bleu", mp4: secret("turquoise.mp4"), webm: secret("turquoise.webm"), duration: "0:10", color: "#1abc9c" },
  { id: "backup", title: "Les Backup Dancers", sub: "Une équipe derrière toi", mp4: secret("backup.mp4"), webm: secret("backup.webm"), duration: "0:11", color: "#a64ca6" },
  { id: "trois", title: "Danse à Trois", sub: "Deux invités surprise dans le salon", mp4: secret("trois.mp4"), webm: secret("trois.webm"), duration: "0:20", color: "#5d6d7e" },
  { id: "matelas", title: "Le Matelas", sub: "Danse sur le lit", mp4: secret("matelas.mp4"), webm: secret("matelas.webm"), duration: "0:14", color: "#b565a7" },
  { id: "eiffel", title: "Rendez-vous Tour Eiffel", sub: "Un chanteur en uniforme devant la tour", mp4: secret("eiffel.mp4"), webm: secret("eiffel.webm"), duration: "0:33", color: "#6c7a89" },
  { id: "biscuit", title: "Le Biscuit", sub: "Un paquet de biscuits qui sourit", mp4: secret("biscuit.mp4"), webm: secret("biscuit.webm"), duration: "0:12", color: "#d4a05a" },
  { id: "deux-visages", title: "Les Deux Visages", sub: "Gentil d'un côté, diable de l'autre", mp4: secret("deux-visages.mp4"), webm: secret("deux-visages.webm"), duration: "0:25", color: "#e25822" },
  { id: "aquarium", title: "L'Aquarium", sub: "Ça va Mathis ? Court mais intense", mp4: secret("aquarium.mp4"), webm: secret("aquarium.webm"), duration: "0:05", color: "#2e86c1" },
  { id: "marche-noel", title: "Marché de Noël", sub: "Une balade de nuit entre les stands", mp4: secret("marche-noel.mp4"), webm: secret("marche-noel.webm"), duration: "0:11", color: "#c0392b" },
  { id: "koda", title: "Le Petit-Déj de Koda", sub: "L'ourson et son bol de céréales", mp4: secret("koda.mp4"), webm: secret("koda.webm"), duration: "0:54", color: "#a0522d" },
  { id: "spaghetti", title: "Spaghetti et Disco", sub: "Des grimaces, des pâtes, du mouvement", mp4: secret("spaghetti.mp4"), webm: secret("spaghetti.webm"), duration: "0:16", color: "#d4a017" },
  { id: "attends", title: "Attends !", sub: "Cinq secondes de chaos", mp4: secret("attends.mp4"), webm: secret("attends.webm"), duration: "0:05", color: "#7f8c8d" },
  { id: "dedicace", title: "La Dédicace", sub: "Une dédicace face caméra", mp4: secret("dedicace.mp4"), webm: secret("dedicace.webm"), duration: "0:11", color: "#16a085" },
  { id: "jason", title: "C'est Jason", sub: "Melissa ? Non, c'est Jason", mp4: secret("jason.mp4"), webm: secret("jason.webm"), duration: "0:07", color: "#8e44ad" },
  { id: "non", title: "Noooon !", sub: "Le calme avant le cri", mp4: secret("non.mp4"), webm: secret("non.webm"), duration: "0:13", color: "#c0392b" },
  { id: "sourire", title: "Le Sourire", sub: "Un sourire dans le noir", mp4: secret("sourire.mp4"), webm: secret("sourire.webm"), duration: "0:15", color: "#566573" },
  { id: "pilote", title: "Le Pilote", sub: "Vol en piqué au-dessus des vagues", mp4: secret("pilote.mp4"), webm: secret("pilote.webm"), duration: "0:20", color: "#1f8fcf" },
  { id: "filtre", title: "Le Visage Étiré", sub: "Un filtre qui change tout", mp4: secret("filtre.mp4"), webm: secret("filtre.webm"), duration: "0:06", color: "#d35400" },
  { id: "lune", title: "Un Homme sur la Lune", sub: "Astronaute, la Terre en fond", mp4: secret("lune.mp4"), webm: secret("lune.webm"), duration: "0:15", color: "#2c3e50" },
  { id: "kirby", title: "Le Cri de Kirby", sub: "Bouche grande ouverte, Kirby en coin", mp4: secret("kirby.mp4"), webm: secret("kirby.webm"), duration: "0:15", color: "#ff7eb6" },
  { id: "filtre-muet", title: "Le Filtre Muet", sub: "Aucun son : tape en rythme à l'instinct", mp4: secret("filtre-muet.mp4"), webm: secret("filtre-muet.webm"), duration: "0:09", color: "#7f8fa6" },
  { id: "champions", title: "Les Grands Champions", sub: "L'hymne et un visage étiré", mp4: secret("champions.mp4"), webm: secret("champions.webm"), duration: "0:15", color: "#1e3a8a" },
  { id: "montenegro", title: "Monténégro", sub: "Monténégro, escargots, et un crâne lisse", mp4: secret("montenegro.mp4"), webm: secret("montenegro.webm"), duration: "0:10", color: "#b03a2e" },
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
