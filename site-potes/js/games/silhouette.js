import { getBest, loadHeads, setBest, shuffle } from "../arcade/kit.js";

const ROUNDS = 10;
const TIME = 10;
const heads = await loadHeads();
const cv = document.getElementById("shape");
const g = cv.getContext("2d");
const optsEl = document.getElementById("opts");
const roundEl = document.getElementById("round");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const state = { round: 0, score: 0, streak: 0, good: 0, answer: null, start: 0, raf: 0, locked: true, best: getBest("silhouette"), buttons: [] };
bestEl.textContent = state.best;

function thumb(head) {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const cx = c.getContext("2d");
  const k = Math.min(150 / head.width, 150 / head.height);
  cx.drawImage(head, (160 - head.width * k) / 2, (160 - head.height * k) / 2, head.width * k, head.height * k);
  return c;
}

function drawShape(head, light = 0) {
  g.fillStyle = "#e9edf2";
  g.fillRect(0, 0, 480, 480);
  const k = Math.min(400 / head.width, 400 / head.height);
  const w = head.width * k;
  const h = head.height * k;
  const tmp = document.createElement("canvas");
  tmp.width = 480;
  tmp.height = 480;
  const t = tmp.getContext("2d");
  t.drawImage(head, (480 - w) / 2, (480 - h) / 2, w, h);
  t.globalCompositeOperation = "source-atop";
  t.fillStyle = "#07090d";
  t.globalAlpha = Math.max(0, 1 - Math.min(1, light));
  t.fillRect(0, 0, 480, 480);
  g.drawImage(tmp, 0, 0);
}

function nextRound() {
  if (state.round >= ROUNDS) return finish();
  state.round += 1;
  roundEl.textContent = `${state.round}/${ROUNDS}`;
  const pool = shuffle(heads).slice(0, 4);
  state.answer = pool[Math.floor(Math.random() * 4)];
  drawShape(state.answer, 0.04);
  optsEl.innerHTML = "";
  state.buttons = [];
  for (const head of pool) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zq-opt";
    button.setAttribute("aria-label", "Tête");
    button.append(thumb(head));
    button.addEventListener("click", () => answer(head, button));
    optsEl.append(button);
    state.buttons.push([head, button]);
  }
  statusEl.textContent = "Qui se cache dans l'ombre ?";
  state.locked = false;
  state.start = performance.now();
  const tick = () => {
    const left = TIME - (performance.now() - state.start) / 1000;
    drawShape(state.answer, 0.04 + 0.5 * Math.pow(1 - Math.max(0, left) / TIME, 1.6));
    timerEl.style.transform = `scaleX(${Math.max(0, left / TIME)})`;
    if (left <= 0 && !state.locked) return answer(null, null);
    if (!state.locked) state.raf = requestAnimationFrame(tick);
  };
  tick();
}

function answer(head, button) {
  if (state.locked) return;
  state.locked = true;
  cancelAnimationFrame(state.raf);
  const left = Math.max(0, TIME - (performance.now() - state.start) / 1000);
  for (const [h, b] of state.buttons) {
    b.disabled = true;
    if (h === state.answer) b.classList.add("good");
  }
  if (head === state.answer) {
    state.streak += 1;
    state.good += 1;
    const gain = 60 + Math.round(left * 14) + Math.min(state.streak, 6) * 15;
    state.score += gain;
    statusEl.textContent = `Bien joué ! +${gain}`;
  } else {
    state.streak = 0;
    button?.classList.add("bad");
    statusEl.textContent = head ? "Raté, c'était l'autre." : "Trop lent !";
  }
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  let r = 0.5;
  const reveal = () => {
    r += 0.06;
    drawShape(state.answer, Math.min(1, r));
    if (r < 1) requestAnimationFrame(reveal);
  };
  reveal();
  setTimeout(nextRound, 1300);
}

function finish() {
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("silhouette", state.best);
    bestEl.textContent = state.best;
  }
  optsEl.innerHTML = "";
  g.fillStyle = "#e9edf2";
  g.fillRect(0, 0, 480, 480);
  g.fillStyle = "#111";
  g.textAlign = "center";
  g.font = "800 54px Inter, system-ui, sans-serif";
  g.fillText(`${state.good}/${ROUNDS}`, 240, 230);
  g.font = "600 24px Inter, system-ui, sans-serif";
  g.fillText(`${state.score} points`, 240, 280);
  statusEl.textContent = record ? "Nouveau record !" : "Partie terminée.";
  startBtn.textContent = "Rejouer";
  startBtn.hidden = false;
  timerEl.style.transform = "scaleX(0)";
}

g.fillStyle = "#e9edf2";
g.fillRect(0, 0, 480, 480);
g.fillStyle = "#6b7280";
g.textAlign = "center";
g.font = "700 28px Inter, system-ui, sans-serif";
g.fillText("Une silhouette apparaîtra ici", 240, 240);
startBtn.addEventListener("click", () => {
  Object.assign(state, { round: 0, score: 0, streak: 0, good: 0 });
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  startBtn.hidden = true;
  nextRound();
});
