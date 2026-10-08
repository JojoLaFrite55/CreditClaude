const secret = (name) => new URL(`../../assets/secret/${name}`, import.meta.url).href;

export const CHARTS_URL = new URL("../../assets/rythme/charts.json", import.meta.url).href;

export const MICRO_SONG = { id: "micro", title: "Le Micro", sub: "La voix du micro, syllabe par syllabe", mp4: secret("micro.mp4"), webm: secret("micro.webm"), duration: "0:33", color: "#c24b99" };

export const SONGS = [
  { id: "67", title: "Tiki Tiki — 67 Man", sub: "Ultra slowed, ballon argenté", mp4: secret("67.mp4"), webm: secret("67.webm"), duration: "0:16", color: "#f2c230" },
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
