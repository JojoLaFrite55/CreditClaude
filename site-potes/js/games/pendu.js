import { createSfx, getBest, mountSoundButton, pick, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const WORDS = {
  Nourriture: ["PIZZA", "RACLETTE", "CROISSANT", "BAGUETTE", "FROMAGE", "CHOCOLAT", "HAMBURGER", "SPAGHETTI", "CORNICHON", "TARTIFLETTE", "CREPE", "FONDUE", "SALADE", "BROCOLI"],
  Animaux: ["ELEPHANT", "GIRAFE", "HERISSON", "PINGOUIN", "CAMELEON", "LAPIN", "DAUPHIN", "KANGOUROU", "ESCARGOT", "PERROQUET", "CROCODILE", "HIPPOPOTAME", "OURAGAN"],
  Maison: ["CANAPE", "FRIGO", "TELEVISION", "ASPIRATEUR", "BAIGNOIRE", "COUETTE", "MICROONDES", "ARMOIRE", "CHAUSSETTE", "PARAPLUIE", "RIDEAU", "BALAI"],
  Soirée: ["KARAOKE", "BARBECUE", "ANNIVERSAIRE", "CONFETTI", "PLAYLIST", "BOWLING", "COCKTAIL", "DECALAGE", "RETARD", "TOURNEE", "GUITARE", "ENCEINTE"],
  Jeux: ["MANETTE", "CONSOLE", "MINECRAFT", "FORTNITE", "MARIO", "TRICHE", "JOYSTICK", "MULTIJOUEUR", "NIVEAU", "ARCADE", "SCORE", "BOSS"],
};
const MAX = 7;
const wordEl = document.getElementById("word");
const keysEl = document.getElementById("keys");
const statusEl = document.getElementById("status");
const catEl = document.getElementById("category");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const parts = [...document.querySelectorAll("[data-part]")];
const state = { word: "", found: new Set(), wrong: new Set(), over: false, streak: 0 };
bestEl.textContent = getBest("pendu");

const norm = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "");

function render() {
  wordEl.textContent = [...state.word].map((l) => (state.found.has(l) ? l : "_")).join(" ");
  parts.forEach((part, i) => part.classList.toggle("on", i < state.wrong.size));
  keysEl.querySelectorAll("button").forEach((button) => {
    const l = button.dataset.l;
    button.disabled = state.over || state.found.has(l) || state.wrong.has(l);
    button.classList.toggle("good", state.found.has(l));
    button.classList.toggle("bad", state.wrong.has(l));
  });
}

function guess(letter) {
  sfx.init();
  if (state.over || state.found.has(letter) || state.wrong.has(letter)) return;
  if (state.word.includes(letter)) {
    state.found.add(letter);
    sfx.pop();
  } else {
    state.wrong.add(letter);
    sfx.bonk();
  }
  render();
  if ([...state.word].every((l) => state.found.has(l))) {
    state.over = true;
    state.streak += 1;
    statusEl.textContent = "Bravo, tu l'as sauvé !";
    if (state.streak > getBest("pendu")) {
      setBest("pendu", state.streak);
      bestEl.textContent = state.streak;
    }
    sfx.win();
  } else if (state.wrong.size >= MAX) {
    state.over = true;
    state.streak = 0;
    wordEl.textContent = [...state.word].join(" ");
    statusEl.textContent = "Perdu ! Voilà le mot.";
    sfx.lose();
  } else statusEl.textContent = `${MAX - state.wrong.size} erreur${MAX - state.wrong.size > 1 ? "s" : ""} restante${MAX - state.wrong.size > 1 ? "s" : ""}`;
  streakEl.textContent = state.streak;
  render();
}

function next() {
  const category = pick(Object.keys(WORDS));
  state.word = norm(pick(WORDS[category]));
  state.found = new Set();
  state.wrong = new Set();
  state.over = false;
  catEl.textContent = category;
  statusEl.textContent = `${MAX} erreurs maximum`;
  render();
}

for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "wkey";
  button.dataset.l = letter;
  button.textContent = letter;
  button.addEventListener("click", () => guess(letter));
  keysEl.append(button);
}
addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const letter = norm(event.key).toUpperCase();
  if (/^[A-Z]$/.test(letter)) guess(letter);
});
document.getElementById("new").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  next();
});
next();
