import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const ROUND = 40;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const comboEl = document.getElementById("combo");
const heads = await loadHeads();
const COLORS = ["#ef5b5b", "#f9c74f", "#4cc9f0", "#6fcf6f", "#b565d9", "#f4934a", "#ff7eb6"];
const state = { mode: "ready", balloons: [], pops: [], spawn: 0, time: ROUND, score: 0, combo: 0, best: getBest("ballons"), hits: 0, misses: 0, escaped: 0, fx: [], clouds: [], t: 0 };
bestEl.textContent = state.best;

function spawn() {
  const level = 1 - state.time / ROUND;
  const golden = Math.random() < 0.08;
  const bomb = !golden && Math.random() < 0.1 + level * 0.06;
  const r = 38 + Math.random() * 20;
  state.balloons.push({ x: 70 + Math.random() * (W - 140), y: H + r + 20, r, vy: 70 + Math.random() * 60 + level * 100, sway: Math.random() * 6, color: pick(COLORS), head: pick(heads), golden, bomb });
}

function reset() {
  Object.assign(state, { mode: "play", balloons: [], pops: [], spawn: 0.2, time: ROUND, score: 0, combo: 0, hits: 0, misses: 0, escaped: 0, fx: [], t: 0 });
  scoreEl.textContent = "0";
  comboEl.textContent = "0";
  timeEl.textContent = ROUND;
  overlay.hide();
}

function finish() {
  state.mode = "over";
  sfx.win();
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("ballons", state.best);
    bestEl.textContent = state.best;
  }
  overlay.show({ eyebrow: record ? "Nouveau record !" : "Temps écoulé", title: "Plus de ballons", text: "Évite les bombes noires, crève les dorés.", button: "Rejouer", stats: statBlock([["Score", state.score], ["Éclatés", state.hits], ["Échappés", state.escaped]]) });
}

function burst(x, y, color, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 80 + Math.random() * 260;
    state.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, t: 0, color, r: 3 + Math.random() * 4 });
  }
}

function pop(x, y) {
  sfx.init();
  if (state.mode !== "play") return;
  for (let i = state.balloons.length - 1; i >= 0; i--) {
    const b = state.balloons[i];
    if (Math.hypot(b.x - x, b.y - y) < b.r + 8) {
      state.balloons.splice(i, 1);
      if (b.bomb) {
        state.combo = 0;
        state.score = Math.max(0, state.score - 150);
        state.time = Math.max(0, state.time - 3);
        burst(b.x, b.y, "#222", 26);
        sfx.hit();
      } else {
        state.combo += 1;
        const gain = (b.golden ? 100 : 10) * (1 + Math.floor(state.combo / 5));
        state.score += gain;
        state.hits += 1;
        burst(b.x, b.y, b.color);
        state.fx.push({ x: b.x, y: b.y, vx: 0, vy: -60, t: 0, text: `+${gain}` });
        b.golden ? sfx.coin() : sfx.pop();
      }
      scoreEl.textContent = state.score;
      comboEl.textContent = state.combo;
      return;
    }
  }
  state.misses += 1;
  state.combo = 0;
  comboEl.textContent = "0";
}

function update(dt) {
  state.t += dt;
  for (const fx of state.fx) {
    fx.t += dt;
    fx.x += fx.vx * dt;
    fx.y += fx.vy * dt;
    if (!fx.text) fx.vy += 500 * dt;
  }
  state.fx = state.fx.filter((fx) => fx.t < 0.8);
  if (state.mode !== "play") return;
  state.time -= dt;
  timeEl.textContent = Math.max(0, Math.ceil(state.time));
  if (state.time <= 0) return finish();
  state.spawn -= dt;
  if (state.spawn <= 0) {
    spawn();
    state.spawn = Math.max(0.28, 0.85 - (1 - state.time / ROUND) * 0.5) * (0.6 + Math.random() * 0.8);
  }
  for (const b of state.balloons) {
    b.y -= b.vy * dt;
    b.x += Math.sin(state.t * 1.5 + b.sway) * 24 * dt;
  }
  const before = state.balloons.length;
  state.balloons = state.balloons.filter((b) => {
    if (b.y < -b.r - 30) {
      if (!b.bomb) {
        state.escaped += 1;
        state.combo = 0;
        comboEl.textContent = "0";
      }
      return false;
    }
    return true;
  });
  void before;
}

function draw() {
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#72b6f2");
  sky.addColorStop(1, "#d6efff");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  for (const b of state.balloons) {
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(b.x, b.y + b.r * 1.2);
    g.quadraticCurveTo(b.x + Math.sin(state.t * 3 + b.sway) * 10, b.y + b.r * 1.9, b.x, b.y + b.r * 2.5);
    g.stroke();
    const fill = b.bomb ? "#1d1d24" : b.golden ? "#ffd54a" : b.color;
    g.fillStyle = fill;
    g.beginPath();
    g.ellipse(b.x, b.y, b.r * 0.92, b.r * 1.15, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(b.x - 7, b.y + b.r * 1.14);
    g.lineTo(b.x + 7, b.y + b.r * 1.14);
    g.lineTo(b.x, b.y + b.r * 1.3);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.28)";
    g.beginPath();
    g.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.45, b.r * 0.2, b.r * 0.34, -0.5, 0, Math.PI * 2);
    g.fill();
    if (b.bomb) {
      g.fillStyle = "#ff5a5a";
      g.font = "800 32px Inter, system-ui, sans-serif";
      g.textAlign = "center";
      g.fillText("💣", b.x, b.y + 11);
    } else drawFace(g, b.head, b.x, b.y - 2, b.r * 1.1);
  }
  for (const fx of state.fx) {
    g.globalAlpha = Math.max(0, 1 - fx.t / 0.8);
    if (fx.text) {
      g.fillStyle = "#fff";
      g.strokeStyle = "rgba(0,0,0,0.5)";
      g.lineWidth = 4;
      g.font = "800 28px Inter, system-ui, sans-serif";
      g.textAlign = "center";
      g.strokeText(fx.text, fx.x, fx.y);
      g.fillText(fx.text, fx.x, fx.y);
    } else {
      g.fillStyle = fx.color;
      g.fillRect(fx.x, fx.y, fx.r, fx.r);
    }
    g.globalAlpha = 1;
  }
}

canvas.addEventListener("pointerdown", (event) => {
  const p = pointer(event, canvas, W, H);
  pop(p.x, p.y);
});
overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Crève-ballons", text: "Éclate les ballons à tête avant qu'ils ne s'envolent. Les dorés valent 100, les bombes noires coûtent des points et du temps.", button: "Jouer" });
loop(update, draw);
