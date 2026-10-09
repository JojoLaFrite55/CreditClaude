import { getBest, mountSoundButton, createSfx, setBest, shuffle } from "../arcade/kit.js";

const SENTENCES = [
  "J'arrive dans cinq minutes, le temps de retrouver mes clés et ma dignité.",
  "Le plan était parfait jusqu'à ce que quelqu'un ouvre la bouche.",
  "Il y a toujours une pizza qui manque quand on a vraiment très faim.",
  "Personne ne répond au groupe mais tout le monde lit les messages.",
  "Ce n'est pas du retard, c'est de l'optimisation du temps d'attente.",
  "Mon wifi a décidé de lâcher au pire moment de la partie.",
  "On dit toujours une dernière partie et il est déjà quatre heures du matin.",
  "Pourquoi marcher quand on peut dire qu'on arrive dans dix minutes ?",
  "Ce meme est tellement vrai que je ne peux pas vous le montrer.",
  "La tournée de ce soir est offerte par celui qui a perdu au morpion.",
  "Quand on dit qu'on a un plan, on veut surtout dire qu'on improvise.",
  "Chaque soirée parfaite commence par quelqu'un qui n'a pas de monnaie.",
  "Il faut toujours croire en soi, surtout quand on a tort.",
  "Un vrai pote te prévient quand tu as quelque chose entre les dents.",
];
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const textEl = document.getElementById("text");
const input = document.getElementById("input");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("acc");
const bestEl = document.getElementById("best");
const status = document.getElementById("status");
const startBtn = document.getElementById("start");
const state = { sentences: [], idx: 0, running: false, t0: 0, typed: 0, errors: 0, chars: 0, raf: 0, best: getBest("dactylo"), deck: [] };
bestEl.textContent = state.best;

function show() {
  const target = state.sentences[state.idx];
  textEl.innerHTML = [...target].map((c, i) => `<span data-i="${i}">${c.replace("<", "&lt;")}</span>`).join("");
  input.value = "";
  paint();
}

function paint() {
  const target = state.sentences[state.idx];
  const value = input.value;
  const spans = textEl.children;
  for (let i = 0; i < spans.length; i++) {
    spans[i].className = i < value.length ? (value[i] === target[i] ? "ok" : "bad") : i === value.length ? "cur" : "";
  }
}

function stats() {
  const elapsed = Math.max(1, (performance.now() - state.t0) / 1000);
  const wpm = Math.round((state.chars / 5) / (elapsed / 60));
  const acc = state.typed ? Math.max(0, Math.round(((state.typed - state.errors) / state.typed) * 100)) : 100;
  return { elapsed, wpm, acc };
}

function tick() {
  if (!state.running) return;
  const s = stats();
  timeEl.textContent = s.elapsed.toFixed(1);
  wpmEl.textContent = s.wpm;
  accEl.textContent = `${s.acc} %`;
  state.raf = requestAnimationFrame(tick);
}

function finish() {
  state.running = false;
  cancelAnimationFrame(state.raf);
  const s = stats();
  input.disabled = true;
  const record = s.wpm * (s.acc / 100) > state.best;
  const score = Math.round(s.wpm * (s.acc / 100));
  if (score > state.best) {
    state.best = score;
    setBest("dactylo", score);
    bestEl.textContent = score;
  }
  status.textContent = `${s.wpm} mots/min · ${s.acc} % de précision · score ${score}${record ? " : nouveau record !" : ""}`;
  startBtn.textContent = "Rejouer";
  startBtn.hidden = false;
  sfx.win();
  timeEl.textContent = s.elapsed.toFixed(1);
  wpmEl.textContent = s.wpm;
  accEl.textContent = `${s.acc} %`;
}

input.addEventListener("input", () => {
  sfx.init();
  if (!state.running) return;
  const target = state.sentences[state.idx];
  const value = input.value;
  if (value.length > state.typedLen) {
    for (let i = state.typedLen; i < value.length; i++) {
      state.typed += 1;
      if (value[i] !== target[i]) state.errors += 1;
    }
    sfx.tick();
  }
  state.typedLen = value.length;
  paint();
  if (value === target) {
    state.chars += target.length;
    state.idx += 1;
    state.typedLen = 0;
    if (state.idx >= state.sentences.length) return finish();
    show();
  }
});
startBtn.addEventListener("click", () => {
  sfx.init();
  state.sentences = shuffle(SENTENCES).slice(0, 3);
  Object.assign(state, { idx: 0, typed: 0, errors: 0, chars: 0, running: true, typedLen: 0 });
  state.t0 = performance.now();
  input.disabled = false;
  startBtn.hidden = true;
  status.textContent = "Tape la phrase affichée, sans te tromper.";
  show();
  input.focus();
  tick();
});
input.disabled = true;
textEl.textContent = "Appuie sur Commencer, puis tape les trois phrases le plus vite possible.";
