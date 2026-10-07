import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const ROUND = 30;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const timeEl = document.getElementById("time");
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const state = { mode: "ready", time: ROUND, score: 0, hits: 0, shots: 0, targets: [], spawn: 0, fx: [], best: getBest("aim"), elapsed: 0 };
bestEl.textContent = state.best;
timeEl.textContent = ROUND;

function reset() {
  Object.assign(state, { mode: "play", time: ROUND, score: 0, hits: 0, shots: 0, targets: [], spawn: 0.2, fx: [], elapsed: 0 });
  scoreEl.textContent = "0";
  overlay.hide();
}

function spawn() {
  const level = Math.min(1, state.elapsed / ROUND);
  const size = 110 - level * 50 + Math.random() * 10;
  state.targets.push({ x: 80 + Math.random() * (W - 160), y: 100 + Math.random() * (H - 180), size, head: pick(heads), age: 0, life: 1.7 - level * 0.8 });
}

function finish() {
  state.mode = "over";
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("aim", state.score);
    bestEl.textContent = state.score;
  }
  sfx.win();
  const accuracy = state.shots ? Math.round((state.hits / state.shots) * 100) : 0;
  overlay.show({ eyebrow: record ? "Nouveau record !" : "Temps écoulé", title: "Fin de l'entraînement", text: "Les cibles rétrécissent et partent plus vite au fil de la partie.", button: "Rejouer", stats: statBlock([["Score", state.score], ["Touchées", state.hits], ["Précision", `${accuracy} %`]]) });
}

function shoot(x, y) {
  sfx.init();
  if (state.mode !== "play") return;
  state.shots += 1;
  for (let i = state.targets.length - 1; i >= 0; i--) {
    const t = state.targets[i];
    if (Math.hypot(x - t.x, y - t.y) < t.size * 0.55) {
      const quick = Math.max(0, 1 - t.age / t.life);
      const gain = Math.round(10 + quick * 20 + (110 - t.size) / 4);
      state.score += gain;
      state.hits += 1;
      scoreEl.textContent = state.score;
      state.fx.push({ x: t.x, y: t.y, text: `+${gain}`, t: 0 });
      state.targets.splice(i, 1);
      sfx.pop();
      return;
    }
  }
  state.score = Math.max(0, state.score - 5);
  scoreEl.textContent = state.score;
  sfx.tone("sawtooth", 160, 100, 0.08, 0.08);
}

function update(dt) {
  for (const fx of state.fx) fx.t += dt;
  state.fx = state.fx.filter((fx) => fx.t < 0.7);
  if (state.mode !== "play") return;
  state.time -= dt;
  state.elapsed += dt;
  timeEl.textContent = Math.max(0, Math.ceil(state.time));
  if (state.time <= 0) return finish();
  state.spawn -= dt;
  if (state.spawn <= 0) {
    spawn();
    state.spawn = 0.75 - Math.min(1, state.elapsed / ROUND) * 0.35;
  }
  for (const t of state.targets) t.age += dt;
  state.targets = state.targets.filter((t) => t.age < t.life);
}

function draw() {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#161b2e");
  bg.addColorStop(1, "#0b0e14");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.05)";
  g.lineWidth = 1;
  for (let x = 0; x < W; x += 60) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  for (const t of state.targets) {
    const grow = Math.min(1, t.age / 0.12);
    const left = 1 - t.age / t.life;
    g.strokeStyle = left < 0.3 ? "#ff5a5a" : "#7fe3ff";
    g.lineWidth = 5;
    g.beginPath();
    g.arc(t.x, t.y, t.size * 0.6 * grow, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.1)";
    g.beginPath();
    g.arc(t.x, t.y, t.size * 0.55 * grow, 0, Math.PI * 2);
    g.fill();
    drawFace(g, t.head, t.x, t.y, t.size * 0.9 * grow);
  }
  g.textAlign = "center";
  for (const fx of state.fx) {
    g.globalAlpha = Math.max(0, 1 - fx.t / 0.7);
    g.font = '800 28px "Inter", sans-serif';
    g.fillStyle = "#ffe066";
    g.fillText(fx.text, fx.x, fx.y - fx.t * 60);
  }
  g.globalAlpha = 1;
}

overlay.onAction(reset);
overlay.show({ eyebrow: "Précision", title: "Tire-Tête", text: "Clique sur les têtes avant qu'elles ne disparaissent. Plus c'est rapide et petit, plus ça rapporte. 30 secondes.", button: "Jouer" });
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  const p = pointer(event, canvas, W, H);
  shoot(p.x, p.y);
});
loop(update, draw);
