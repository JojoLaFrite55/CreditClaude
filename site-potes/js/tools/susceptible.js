import { createSfx, mountSoundButton, pick, shuffle } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const KEY = "qg-susceptible";

const QUESTIONS = [
  "s'endormir pendant un film au cinéma",
  "répondre « j'arrive » en étant encore sous la douche",
  "se perdre avec un GPS",
  "pleurer devant un dessin animé",
  "oublier l'anniversaire de quelqu'un",
  "gagner au loto et tout dépenser en une semaine",
  "faire une blague au pire moment",
  "ghoster tout le groupe pendant un mois",
  "rater un train à cause d'un croissant",
  "devenir célèbre sur Internet par accident",
  "se battre avec un pigeon",
  "acheter un objet inutile en pensant que c'est utile",
  "se faire enfermer dehors en pyjama",
  "tout savoir sur un sujet que personne n'a demandé",
  "dire « je suis presque là » depuis son lit",
  "partir en vacances sans passeport",
  "commander la même chose dans tous les restos",
  "avoir 400 onglets ouverts",
  "se faire offrir un poisson rouge et lui parler tous les jours",
  "rire tout seul à un mème dans le silence",
  "gagner une dispute en ayant tort",
  "perdre ses clés dans sa propre poche",
  "finir premier d'un jeu auquel il n'a jamais joué",
  "promettre de venir et ne jamais venir",
  "se faire repérer en train de manger le dernier bout",
];

const names = document.getElementById("names");
const question = document.getElementById("question");
const result = document.getElementById("result");
const history = document.getElementById("history");
const counts = document.getElementById("counts");
let deck = [];
let tally = {};
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  names.value = saved.names || "Pote 1\nPote 2\nPote 3\nPote 4\nPote 5";
  tally = saved.tally || {};
} catch {
  names.value = "Pote 1\nPote 2\nPote 3\nPote 4\nPote 5";
}

const players = () => names.value.split("\n").map((n) => n.trim()).filter(Boolean).slice(0, 24);
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ names: names.value, tally }));
  } catch {}
};

function drawQuestion() {
  if (!deck.length) deck = shuffle([...QUESTIONS]);
  question.textContent = `Qui est le plus susceptible de ${deck.pop()} ?`;
  result.textContent = "—";
}

function renderTally() {
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  counts.innerHTML = entries.length ? entries.map(([name, n]) => `<li><span>${name.replace(/</g, "&lt;")}</span><strong>${n}</strong></li>`).join("") : '<li class="muted">Aucun choix du sort pour l\'instant.</li>';
}

document.getElementById("ask").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  drawQuestion();
});

document.getElementById("pick").addEventListener("click", () => {
  sfx.init();
  const list = players();
  if (list.length < 2) {
    result.textContent = "Ajoute au moins deux noms.";
    return;
  }
  let ticks = 0;
  const timer = setInterval(() => {
    result.textContent = pick(list);
    sfx.tick();
    ticks += 1;
    if (ticks > 14) {
      clearInterval(timer);
      const winner = pick(list);
      result.textContent = winner;
      tally[winner] = (tally[winner] || 0) + 1;
      const item = document.createElement("li");
      item.textContent = `${question.textContent.replace("Qui est le plus susceptible de ", "").replace(" ?", "")} → ${winner}`;
      history.prepend(item);
      while (history.children.length > 6) history.lastChild.remove();
      sfx.win();
      save();
      renderTally();
    }
  }, 70);
});

document.getElementById("clear").addEventListener("click", () => {
  tally = {};
  save();
  renderTally();
});
names.addEventListener("input", save);
drawQuestion();
renderTally();
