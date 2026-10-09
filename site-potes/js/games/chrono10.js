import { createSfx, getBest, loadHeads, mountSoundButton, pick, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const display = document.getElementById("display");
const button = document.getElementById("go");
const status = document.getElementById("status");
const bestEl = document.getElementById("best");
const roundEl = document.getElementById("round");
const avgEl = document.getElementById("avg");
const list = document.getElementById("history");
const hideToggle = document.getElementById("hide");
const face = document.getElementById("face");
const TARGET = 10;
const ROUNDS = 5;
const state = { running: false, t0: 0, raf: 0, results: [], best: Number(localStorage.getItem("qg-best-chrono10") || 0) || null };
function renderBest() {
  bestEl.textContent = state.best === null ? "—" : `${state.best.toFixed(2)} s d'écart`;
}
renderBest();

function setFace() {
  face.innerHTML = "";
  const head = pick(heads);
  const c = document.createElement("canvas");
  c.width = 120;
  c.height = 120;
  const cx = c.getContext("2d");
  const k = Math.min(110 / head.width, 110 / head.height);
  cx.drawImage(head, (120 - head.width * k) / 2, (120 - head.height * k) / 2, head.width * k, head.height * k);
  face.append(c);
}
setFace();

function tick() {
  const t = (performance.now() - state.t0) / 1000;
  const hidden = hideToggle.checked && t > 2;
  display.textContent = hidden ? "?.??" : t.toFixed(2);
  display.classList.toggle("hidden-time", hidden);
  state.raf = requestAnimationFrame(tick);
}

function summary() {
  const avg = state.results.reduce((a, r) => a + Math.abs(r - TARGET), 0) / state.results.length;
  avgEl.textContent = `${avg.toFixed(3)} s`;
  return avg;
}

button.addEventListener("click", () => {
  sfx.init();
  if (!state.running) {
    if (state.results.length >= ROUNDS) {
      state.results = [];
      list.innerHTML = "";
      avgEl.textContent = "—";
    }
    state.running = true;
    state.t0 = performance.now();
    button.textContent = "STOP";
    status.textContent = "Arrête à 10,00 secondes.";
    tick();
    sfx.click();
    roundEl.textContent = `${state.results.length + 1}/${ROUNDS}`;
  } else {
    cancelAnimationFrame(state.raf);
    const t = (performance.now() - state.t0) / 1000;
    state.running = false;
    display.textContent = t.toFixed(2);
    display.classList.remove("hidden-time");
    state.results.push(t);
    const diff = t - TARGET;
    const li = document.createElement("li");
    li.textContent = `Essai ${state.results.length} : ${t.toFixed(2)} s (${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(2)})`;
    if (Math.abs(diff) < 0.05) li.className = "good";
    list.append(li);
    status.textContent = Math.abs(diff) < 0.02 ? "Parfait !" : Math.abs(diff) < 0.1 ? "Très proche." : Math.abs(diff) < 0.5 ? "Pas mal." : diff > 0 ? "Trop tard." : "Trop tôt.";
    Math.abs(diff) < 0.1 ? sfx.win() : sfx.pop();
    setFace();
    if (state.results.length >= ROUNDS) {
      const avg = summary();
      if (state.best === null || avg < state.best) {
        state.best = avg;
        try {
          localStorage.setItem("qg-best-chrono10", String(avg));
        } catch {
          state.best = avg;
        }
        renderBest();
        status.textContent += " Nouveau record !";
      }
      button.textContent = "Recommencer";
      roundEl.textContent = `${ROUNDS}/${ROUNDS}`;
    } else {
      button.textContent = "Lancer";
      summary();
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === " " && document.activeElement !== button && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    button.click();
  }
});
void getBest;
void setBest;
