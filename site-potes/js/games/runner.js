import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const GROUND = 470;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const heads = await loadHeads();
const state = { mode: "ready", y: 0, vy: 0, duck: false, speed: 380, dist: 0, obs: [], spawn: 1, best: getBest("runner"), head: heads[0], clouds: [], t: 0, hits: 0, jumps: 0 };
bestEl.textContent = state.best;
state.clouds = Array.from({ length: 5 }, (_, i) => ({ x: i * 220, y: 60 + Math.random() * 140, s: 0.6 + Math.random() * 0.8 }));

function reset() {
  Object.assign(state, { mode: "play", y: 0, vy: 0, duck: false, speed: 380, dist: 0, obs: [], spawn: 1, head: pick(heads), t: 0, jumps: 0 });
  scoreEl.textContent = "0";
  overlay.hide();
}

function jump() {
  if (state.mode !== "play") return;
  if (state.y === 0) {
    state.vy = 880;
    state.jumps += 1;
    sfx.tone("triangle", 320, 640, 0.14, 0.12);
  }
}

function end() {
  state.mode = "over";
  sfx.hit();
  const score = Math.floor(state.dist / 10);
  const record = score > state.best;
  if (record) {
    state.best = score;
    setBest("runner", score);
    bestEl.textContent = score;
  }
  overlay.show({ eyebrow: record ? "Nouveau record !" : "Aïe", title: "Tu t'es pris un obstacle", text: "Saute les cactus, baisse-toi sous les oiseaux.", button: "Rejouer", stats: statBlock([["Distance", `${score} m`], ["Sauts", state.jumps]]) });
}

function update(dt) {
  state.t += dt;
  for (const c of state.clouds) {
    c.x -= (state.mode === "play" ? state.speed : 60) * 0.2 * dt;
    if (c.x < -120) c.x = W + 60;
  }
  if (state.mode !== "play") return;
  state.speed = 380 + Math.min(420, state.dist / 25);
  state.dist += state.speed * dt;
  scoreEl.textContent = Math.floor(state.dist / 10);
  if (state.y > 0 || state.vy > 0) {
    state.vy -= 2300 * dt * (state.duck ? 1.6 : 1);
    state.y += state.vy * dt;
    if (state.y <= 0) {
      state.y = 0;
      state.vy = 0;
    }
  }
  state.spawn -= dt;
  if (state.spawn <= 0) {
    const bird = state.dist > 1500 && Math.random() < 0.3;
    state.obs.push(bird ? { type: "bird", x: W + 40, w: 60, h: 44, alt: Math.random() < 0.5 ? 60 : 24, f: 0 } : { type: "cactus", x: W + 40, w: 28 + Math.random() * 30, h: 56 + Math.random() * 38 });
    state.spawn = Math.max(0.55, 1.45 - state.dist / 9000) * (0.7 + Math.random() * 0.6) * (400 / state.speed) * 1.2;
  }
  for (const o of state.obs) o.x -= state.speed * dt;
  state.obs = state.obs.filter((o) => o.x > -100);
  const hx = 150;
  const hh = state.duck && state.y === 0 ? 46 : 80;
  const hy = state.y;
  for (const o of state.obs) {
    const oy = o.type === "bird" ? o.alt : 0;
    const overlapX = hx + 26 > o.x + 6 && hx - 26 < o.x + o.w - 6;
    const overlapY = hy < oy + o.h - 6 && hy + hh > oy + 6;
    if (overlapX && overlapY) {
      end();
      return;
    }
  }
}

function draw() {
  const sky = g.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, "#9fd4f5");
  sky.addColorStop(1, "#e9f6ff");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.9)";
  for (const c of state.clouds) {
    g.beginPath();
    g.ellipse(c.x, c.y, 50 * c.s, 20 * c.s, 0, 0, Math.PI * 2);
    g.ellipse(c.x + 30 * c.s, c.y + 6 * c.s, 40 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#d9c9a3";
  g.fillRect(0, GROUND, W, H - GROUND);
  g.fillStyle = "#b8a77f";
  g.fillRect(0, GROUND, W, 4);
  g.fillStyle = "rgba(0,0,0,0.12)";
  for (let i = 0; i < 24; i++) g.fillRect(((i * 97 - state.dist * 0.9) % (W + 60) + W + 60) % (W + 60) - 30, GROUND + 22 + (i % 4) * 22, 22 + (i % 3) * 10, 4);
  for (const o of state.obs) {
    if (o.type === "cactus") {
      g.fillStyle = "#2f8a3c";
      g.fillRect(o.x + o.w / 2 - 7, GROUND - o.h, 14, o.h);
      g.fillRect(o.x, GROUND - o.h * 0.65, 12, 10);
      g.fillRect(o.x, GROUND - o.h * 0.65 - 18, 10, 20);
      g.fillRect(o.x + o.w - 12, GROUND - o.h * 0.5, 12, 10);
      g.fillRect(o.x + o.w - 10, GROUND - o.h * 0.5 - 22, 10, 24);
    } else {
      o.f += 0.2;
      const by = GROUND - o.alt - o.h;
      g.fillStyle = "#4b4f6b";
      g.beginPath();
      g.ellipse(o.x + 30, by + 24, 24, 12, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(o.x + 20, by + 22);
      g.lineTo(o.x + 36, by + 22 + Math.sin(o.f) * 26);
      g.lineTo(o.x + 44, by + 22);
      g.fill();
      g.fillStyle = "#f4b94a";
      g.beginPath();
      g.moveTo(o.x + 54, by + 22);
      g.lineTo(o.x + 68, by + 26);
      g.lineTo(o.x + 54, by + 30);
      g.fill();
    }
  }
  const duckNow = state.duck && state.y === 0;
  const hy = GROUND - state.y;
  g.fillStyle = "rgba(0,0,0,0.18)";
  g.beginPath();
  g.ellipse(150, GROUND + 4, 30 - Math.min(14, state.y / 12), 7, 0, 0, Math.PI * 2);
  g.fill();
  const run = state.mode === "play" && state.y === 0 ? Math.sin(state.t * 18) * 3 : 0;
  g.fillStyle = "#33405f";
  const legs = state.mode === "play" && state.y === 0 ? Math.sin(state.t * 18) * 10 : 6;
  g.fillRect(138 + legs, hy - (duckNow ? 14 : 24), 9, duckNow ? 14 : 24);
  g.fillRect(156 - legs, hy - (duckNow ? 14 : 24), 9, duckNow ? 14 : 24);
  drawFace(g, state.head, 150, hy - (duckNow ? 36 : 56) + run, duckNow ? 62 : 74, state.mode === "play" ? Math.sin(state.t * 12) * 0.05 : 0);
}

const setDuck = (value) => {
  state.duck = value;
};
addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", " "].includes(event.key) && state.mode === "play") event.preventDefault();
  if (event.repeat) return;
  if (event.key === " " || event.key === "ArrowUp" || event.key === "z" || event.key === "w") jump();
  if (event.key === "ArrowDown" || event.key === "s") setDuck(true);
});
addEventListener("keyup", (event) => {
  if (event.key === "ArrowDown" || event.key === "s") setDuck(false);
});
canvas.addEventListener("pointerdown", (event) => {
  sfx.init();
  const rect = canvas.getBoundingClientRect();
  if (event.clientY - rect.top > rect.height * 0.7) setDuck(true);
  else jump();
});
addEventListener("pointerup", () => setDuck(false));

overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Cours, Tête !", text: "Saute les cactus (Espace ou ↑), baisse-toi sous les oiseaux (↓). Au doigt : touche en haut pour sauter, maintiens en bas pour te baisser.", button: "Courir" });
loop(update, draw);
