import { createSfx, mountSoundButton, shuffle } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const KEY = "qg-tupreferes";

const PAIRS = [
  ["Ne plus jamais manger de pizza", "Ne plus jamais manger de pâtes"],
  ["Toujours arriver 1 h en avance", "Toujours arriver 1 h en retard"],
  ["Parler à tous les animaux", "Parler toutes les langues"],
  ["Avoir un doigt en plus", "Avoir un orteil en moins"],
  ["Ne jamais pouvoir dormir tard", "Ne jamais pouvoir se coucher tôt"],
  ["Vivre sans musique", "Vivre sans films"],
  ["Un canapé magique qui vole", "Un frigo qui se remplit tout seul"],
  ["Être le plus drôle du groupe", "Être le plus intelligent du groupe"],
  ["Avoir toujours 1 % de batterie", "Avoir toujours un mauvais réseau"],
  ["Voyager dans le passé", "Voyager dans le futur"],
  ["Manger un oignon cru", "Boire un verre de cornichons"],
  ["Avoir la voix d'un dessin animé", "Marcher comme un robot"],
  ["Gagner 1 000 € maintenant", "Gagner 1 € par minute pendant 24 h"],
  ["Un week-end sans écran", "Un week-end sans manger chaud"],
  ["Se faire appeler par un surnom nul à vie", "Ne jamais avoir de surnom"],
  ["Toujours dire ce que tu penses", "Ne jamais pouvoir mentir"],
  ["Une soirée karaoké obligatoire", "Une soirée jeux de société de 6 h"],
  ["Rencontrer ton double", "Rencontrer ton futur toi"],
];

const a = document.getElementById("a");
const b = document.getElementById("b");
const note = document.getElementById("note");
const next = document.getElementById("next");
const stats = document.getElementById("stats");
let deck = [];
let current = null;
let locked = false;
let tally = {};
try {
  tally = JSON.parse(localStorage.getItem(KEY) || "{}");
} catch {}

function show() {
  if (!deck.length) deck = shuffle([...PAIRS]);
  current = deck.pop();
  locked = false;
  a.textContent = current[0];
  b.textContent = current[1];
  a.className = b.className = "choice";
  note.textContent = "";
  next.classList.add("hidden");
}

function vote(index) {
  if (locked) return;
  locked = true;
  sfx.init();
  sfx.pop();
  const key = current[index];
  tally[key] = (tally[key] || 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(tally));
  } catch {}
  (index === 0 ? a : b).classList.add("picked");
  const other = current[1 - index];
  note.textContent = `« ${key} » a été choisi ${tally[key]} fois sur cet appareil, « ${other} » ${tally[other] || 0} fois.`;
  next.classList.remove("hidden");
  stats.textContent = `${Object.values(tally).reduce((x, y) => x + y, 0)} choix faits`;
}

a.addEventListener("click", () => vote(0));
b.addEventListener("click", () => vote(1));
next.addEventListener("click", () => {
  sfx.init();
  sfx.click();
  show();
});
stats.textContent = `${Object.values(tally).reduce((x, y) => x + y, 0)} choix faits`;
show();
