import { getBest, loadHeads, setBest, shuffle } from "../arcade/kit.js";

const ROUNDS = 10;
const TIME = 12;
const heads = await loadHeads();
const zoom = document.getElementById("zoom");
const zg = zoom.getContext("2d");
const optsEl = document.getElementById("opts");
const roundEl = document.getElementById("round");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const state = { round: 0, score: 0, streak: 0, best: getBest("zoomtete"), answer: null, start: 0, raf: 0, locked: true, good: 0 };
bestEl.textContent = state.best;

const alphaCache = new Map();
function opaquePoints(head) {
  if (alphaCache.has(head)) return alphaCache.get(head);
  const c = document.createElement("canvas");
  c.width = head.width;
  c.height = head.height;
  const cx = c.getContext("2d");
  cx.drawImage(head, 0, 0);
  const data = cx.getImageData(0, 0, c.width, c.height).data;
  const points = [];
  for (let y = 0; y < c.height; y += 6) {
    for (let x = 0; x < c.width; x += 6) if (data[(y * c.width + x) * 4 + 3] > 240) points.push([x, y]);
  }
  alphaCache.set(head, points);
  return points;
}

function thumb(head) {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const cx = c.getContext("2d");
  const k = Math.min(160 / head.width, 160 / head.height);
  cx.drawImage(head, (160 - head.width * k) / 2, (160 - head.height * k) / 2, head.width * k, head.height * k);
  return c;
}

function drawZoom(head, factor) {
  zg.fillStyle = "#e9edf2";
  zg.fillRect(0, 0, 480, 480);
  const side = Math.min(head.height, head.width, Math.max(150, Math.min(head.width, head.height) / factor));
  const pts = opaquePoints(head);
  const [px, py] = pts.length ? pts[Math.floor(Math.random() * pts.length)] : [head.width / 2, head.height / 2];
  const sx = Math.max(0, Math.min(head.width - side, px - side / 2));
  const sy = Math.max(0, Math.min(head.height - side, py - side / 2));
  zg.imageSmoothingQuality = "high";
  zg.drawImage(head, sx, sy, side, side, 0, 0, 480, 480);
}

function nextRound() {
  if (state.round >= ROUNDS) return finish();
  state.round += 1;
  roundEl.textContent = `${state.round}/${ROUNDS}`;
  const pool = shuffle(heads).slice(0, 4);
  state.answer = pool[Math.floor(Math.random() * 4)];
  drawZoom(state.answer, 2.2 + Math.random() * 1.4);
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
  statusEl.textContent = "C'est laquelle ?";
  state.locked = false;
  state.start = performance.now();
  cancelAnimationFrame(state.raf);
  const tick = () => {
    const left = TIME - (performance.now() - state.start) / 1000;
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
  const ok = head === state.answer;
  for (const b of optsEl.children) b.disabled = true;
  for (const [h, b] of state.buttons) if (h === state.answer) b.classList.add("good");
  if (ok) {
    state.streak += 1;
    state.good += 1;
    const gain = 100 + Math.round(left * 10) + Math.min(state.streak, 6) * 15;
    state.score += gain;
    button.classList.add("good");
    statusEl.textContent = `Bien joué ! +${gain}`;
  } else {
    state.streak = 0;
    button?.classList.add("bad");
    statusEl.textContent = head ? "Raté, c'était l'autre." : "Trop lent !";
  }
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  setTimeout(nextRound, 1100);
}

function finish() {
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("zoomtete", state.best);
    bestEl.textContent = state.best;
  }
  optsEl.innerHTML = "";
  zg.fillStyle = "#e9edf2";
  zg.fillRect(0, 0, 480, 480);
  zg.fillStyle = "#111";
  zg.textAlign = "center";
  zg.font = "800 54px Inter, system-ui, sans-serif";
  zg.fillText(`${state.good}/${ROUNDS}`, 240, 230);
  zg.font = "600 24px Inter, system-ui, sans-serif";
  zg.fillText(`${state.score} points`, 240, 280);
  statusEl.textContent = record ? "Nouveau record !" : "Partie terminée.";
  startBtn.textContent = "Rejouer";
  startBtn.hidden = false;
  timerEl.style.transform = "scaleX(0)";
}

zg.fillStyle = "#e9edf2";
zg.fillRect(0, 0, 480, 480);
zg.fillStyle = "#6b7280";
zg.textAlign = "center";
zg.font = "700 28px Inter, system-ui, sans-serif";
zg.fillText("Un détail apparaîtra ici", 240, 240);

startBtn.addEventListener("click", () => {
  Object.assign(state, { round: 0, score: 0, streak: 0, good: 0 });
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  startBtn.hidden = true;
  nextRound();
});
