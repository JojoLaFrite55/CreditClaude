import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const COLS = 9;
const ROWS = 4;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const waveEl = document.getElementById("wave");
const livesEl = document.getElementById("lives");
const bestEl = document.getElementById("best");
const heads = await loadHeads();
const stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + 0.4 }));

const state = { mode: "ready", score: 0, wave: 1, lives: 3, enemies: [], dir: 1, shots: [], bombs: [], fx: [], px: W / 2, target: W / 2, cooldown: 0, firing: false, bombTimer: 1, safe: 0, best: getBest("invasion"), keys: {}, shake: 0, hits: 0, shotsFired: 0 };
bestEl.textContent = state.best;

function spawnWave() {
  state.enemies = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      state.enemies.push({ x: 150 + c * 82, y: 70 + r * 66, head: pick(heads), hp: r === 0 && state.wave > 1 ? 2 : 1, alive: true });
    }
  }
  state.dir = 1;
  state.shots = [];
  state.bombs = [];
}

function reset() {
  Object.assign(state, { mode: "play", score: 0, wave: 1, lives: 3, px: W / 2, target: W / 2, cooldown: 0, bombTimer: 1, safe: 0, fx: [], shake: 0, hits: 0, shotsFired: 0 });
  spawnWave();
  scoreEl.textContent = "0";
  waveEl.textContent = "1";
  livesEl.textContent = "3";
  overlay.hide();
}

function end() {
  state.mode = "over";
  sfx.lose();
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("invasion", state.best);
    bestEl.textContent = state.best;
  }
  overlay.show({
    eyebrow: record ? "Nouveau record !" : "Invasion réussie",
    title: "Elles ont gagné",
    text: "Les têtes ont atteint ton canon. Une dernière vague ?",
    button: "Rejouer",
    stats: statBlock([["Score", state.score], ["Vague", state.wave], ["Précision", `${state.shotsFired ? Math.round((state.hits / state.shotsFired) * 100) : 0} %`]]),
  });
}

function fire() {
  if (state.mode !== "play" || state.cooldown > 0) return;
  state.shots.push({ x: state.px, y: H - 76 });
  state.cooldown = 0.28;
  state.shotsFired += 1;
  sfx.tone("square", 900, 300, 0.09, 0.07);
}

function burst(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 60 + Math.random() * 200;
    state.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, color });
  }
}

function update(dt) {
  for (const fx of state.fx) {
    fx.t += dt;
    fx.x += fx.vx * dt;
    fx.y += fx.vy * dt;
  }
  state.fx = state.fx.filter((fx) => fx.t < 0.6);
  state.shake = Math.max(0, state.shake - dt * 4);
  if (state.mode !== "play") return;
  const left = state.keys.ArrowLeft || state.keys.a || state.keys.q;
  const right = state.keys.ArrowRight || state.keys.d;
  if (left) state.target = Math.max(40, state.px - 520 * dt);
  if (right) state.target = Math.min(W - 40, state.px + 520 * dt);
  if (left || right) state.px = state.target;
  else state.px += (state.target - state.px) * Math.min(1, dt * 14);
  state.cooldown -= dt;
  state.safe = Math.max(0, state.safe - dt);
  if (state.firing || state.keys[" "]) fire();

  const alive = state.enemies.filter((e) => e.alive);
  if (!alive.length) {
    state.wave += 1;
    state.score += 200;
    waveEl.textContent = state.wave;
    scoreEl.textContent = state.score;
    sfx.win();
    spawnWave();
    return;
  }
  const ratio = 1 - alive.length / (COLS * ROWS);
  const speed = (46 + state.wave * 10 + ratio * 140) * state.dir;
  let edge = false;
  for (const e of alive) {
    e.x += speed * dt;
    if (e.x < 36 || e.x > W - 36) edge = true;
  }
  if (edge) {
    state.dir *= -1;
    for (const e of alive) {
      e.x = Math.max(36, Math.min(W - 36, e.x));
      e.y += 22;
    }
  }
  if (alive.some((e) => e.y > H - 120)) {
    end();
    return;
  }

  state.bombTimer -= dt;
  if (state.bombTimer <= 0) {
    const cols = new Map();
    for (const e of alive) {
      const key = Math.round(e.x / 10);
      if (!cols.has(key) || cols.get(key).y < e.y) cols.set(key, e);
    }
    const shooter = pick([...cols.values()]);
    state.bombs.push({ x: shooter.x, y: shooter.y + 20, head: pick(heads) });
    state.bombTimer = Math.max(0.35, 1.3 - state.wave * 0.1) * (0.6 + Math.random() * 0.8);
  }

  for (const s of state.shots) s.y -= 640 * dt;
  state.shots = state.shots.filter((s) => s.y > -20);
  for (const s of state.shots) {
    for (const e of alive) {
      if (e.alive && Math.abs(s.x - e.x) < 30 && Math.abs(s.y - e.y) < 30) {
        s.y = -100;
        e.hp -= 1;
        if (e.hp <= 0) {
          e.alive = false;
          state.score += 10 * state.wave;
          scoreEl.textContent = state.score;
          burst(e.x, e.y, "#ffd24a");
          sfx.bonk();
        } else sfx.pop();
        state.hits += 1;
        break;
      }
    }
  }
  for (const b of state.bombs) b.y += (210 + state.wave * 14) * dt;
  state.bombs = state.bombs.filter((b) => b.y < H + 30);
  if (state.safe <= 0) {
    for (const b of state.bombs) {
      if (Math.abs(b.x - state.px) < 32 && Math.abs(b.y - (H - 60)) < 34) {
        b.y = H + 100;
        state.lives -= 1;
        livesEl.textContent = state.lives;
        state.safe = 1.4;
        state.shake = 1;
        burst(state.px, H - 60, "#ff5a5a");
        sfx.hit();
        if (state.lives <= 0) end();
        break;
      }
    }
  }
}

function draw() {
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#050816");
  sky.addColorStop(1, "#1a1040");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff";
  for (const s of stars) {
    g.globalAlpha = 0.4 + 0.4 * Math.sin(performance.now() / 700 + s.x);
    g.fillRect(s.x, s.y, s.s, s.s);
  }
  g.globalAlpha = 1;
  g.save();
  if (state.shake > 0) g.translate((Math.random() - 0.5) * 10 * state.shake, (Math.random() - 0.5) * 10 * state.shake);
  for (const e of state.enemies) if (e.alive) drawFace(g, e.head, e.x, e.y, e.hp > 1 ? 62 : 54);
  for (const b of state.bombs) drawFace(g, b.head, b.x, b.y, 26, performance.now() / 200);
  g.fillStyle = "#ffe45e";
  for (const s of state.shots) g.fillRect(s.x - 2, s.y - 12, 4, 20);
  if (state.mode !== "ready" && (state.safe <= 0 || Math.floor(performance.now() / 90) % 2)) {
    g.fillStyle = "#e8edf5";
    g.beginPath();
    g.moveTo(state.px, H - 100);
    g.lineTo(state.px + 34, H - 38);
    g.lineTo(state.px - 34, H - 38);
    g.closePath();
    g.fill();
    g.fillStyle = "#5ee3ff";
    g.fillRect(state.px - 7, H - 76, 14, 26);
    g.fillStyle = "#ff7a3a";
    g.fillRect(state.px - 20, H - 38, 40, 8);
  }
  for (const fx of state.fx) {
    g.globalAlpha = 1 - fx.t / 0.6;
    g.fillStyle = fx.color;
    g.fillRect(fx.x, fx.y, 5, 5);
  }
  g.globalAlpha = 1;
  g.restore();
}

canvas.addEventListener("pointermove", (event) => {
  state.target = Math.max(40, Math.min(W - 40, pointer(event, canvas, W, H).x));
});
canvas.addEventListener("pointerdown", (event) => {
  sfx.init();
  state.target = Math.max(40, Math.min(W - 40, pointer(event, canvas, W, H).x));
  state.firing = true;
  fire();
});
addEventListener("pointerup", () => (state.firing = false));
addEventListener("keydown", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = true;
  if ([" ", "ArrowLeft", "ArrowRight"].includes(event.key) && state.mode === "play") event.preventDefault();
});
addEventListener("keyup", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = false;
});

overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Invasion des têtes", text: "Abats les têtes avant qu'elles n'atteignent ton canon. Les bombes-têtes qui tombent te coûtent une vie.", button: "Jouer" });
loop(update, draw);
