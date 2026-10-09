import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 540;
const H = 750;
const BH = 46;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const perfEl = document.getElementById("perfect");
const heads = await loadHeads();
const HUES = [350, 20, 45, 90, 150, 190, 220, 260, 300];
const state = { mode: "ready", stack: [], cur: null, dir: 1, speed: 230, cam: 0, best: getBest("tour"), fall: [], perfect: 0, combo: 0, camTarget: 0, t: 0 };
bestEl.textContent = state.best;

function color(i) {
  return `hsl(${HUES[i % HUES.length]} 70% 58%)`;
}

function reset() {
  const base = { x: W / 2 - 110, w: 220, y: H - 90, head: pick(heads), c: color(0) };
  Object.assign(state, { mode: "play", stack: [base], fall: [], speed: 230, cam: 0, camTarget: 0, perfect: 0, combo: 0, dir: 1 });
  scoreEl.textContent = "0";
  perfEl.textContent = "0";
  spawn();
  overlay.hide();
}

function spawn() {
  const top = state.stack[state.stack.length - 1];
  const fromLeft = state.stack.length % 2 === 0;
  state.cur = { x: fromLeft ? -top.w : W, w: top.w, y: top.y - BH, head: pick(heads), c: color(state.stack.length) };
  state.dir = fromLeft ? 1 : -1;
}

function end() {
  state.mode = "over";
  sfx.lose();
  const score = state.stack.length - 1;
  const record = score > state.best;
  if (record) {
    state.best = score;
    setBest("tour", score);
    bestEl.textContent = score;
  }
  overlay.show({ eyebrow: record ? "Nouveau record !" : "Tour terminée", title: "Plus rien à poser", text: "Cale chaque étage pile sur le précédent.", button: "Rejouer", stats: statBlock([["Étages", score], ["Parfaits", state.perfect]]) });
}

function drop() {
  sfx.init();
  if (state.mode !== "play" || !state.cur) return;
  const top = state.stack[state.stack.length - 1];
  const cur = state.cur;
  const left = Math.max(top.x, cur.x);
  const right = Math.min(top.x + top.w, cur.x + cur.w);
  const overlap = right - left;
  if (overlap <= 4) {
    state.fall.push({ ...cur, vy: 0, rot: 0 });
    state.cur = null;
    return end();
  }
  const perfect = Math.abs(cur.x - top.x) < 6;
  if (perfect) {
    cur.x = top.x;
    state.perfect += 1;
    state.combo += 1;
    cur.w = Math.min(top.w + (state.combo >= 3 ? 8 : 0), 260);
    cur.x = top.x - (cur.w - top.w) / 2;
    perfEl.textContent = state.perfect;
    sfx.coin();
  } else {
    state.combo = 0;
    if (cur.x < top.x) state.fall.push({ x: cur.x, w: top.x - cur.x, y: cur.y, head: cur.head, c: cur.c, vy: 0, rot: 0 });
    else state.fall.push({ x: top.x + top.w, w: cur.x + cur.w - (top.x + top.w), y: cur.y, head: cur.head, c: cur.c, vy: 0, rot: 0 });
    cur.x = left;
    cur.w = overlap;
    sfx.tone("square", 220, 150, 0.08, 0.1);
  }
  state.stack.push(cur);
  scoreEl.textContent = state.stack.length - 1;
  state.speed = Math.min(520, 230 + state.stack.length * 8);
  const topY = cur.y;
  state.camTarget = Math.min(0, topY - (H - 260) + 0) - 0;
  state.camTarget = topY < 380 ? topY - 380 : 0;
  spawn();
}

function update(dt) {
  state.t += dt;
  for (const f of state.fall) {
    f.vy += 1600 * dt;
    f.y += f.vy * dt;
    f.rot += dt * (f.x < W / 2 ? -1 : 1);
  }
  state.fall = state.fall.filter((f) => f.y < state.cam + H + 200);
  state.cam += (state.camTarget - state.cam) * Math.min(1, dt * 5);
  if (state.mode !== "play" || !state.cur) return;
  const cur = state.cur;
  cur.x += state.dir * state.speed * dt;
  if (cur.x + cur.w > W + 20 && state.dir > 0) state.dir = -1;
  if (cur.x < -20 && state.dir < 0) state.dir = 1;
}

function block(b, alpha = 1) {
  g.globalAlpha = alpha;
  g.fillStyle = b.c;
  g.fillRect(b.x, b.y, b.w, BH - 2);
  g.fillStyle = "rgba(255,255,255,0.25)";
  g.fillRect(b.x, b.y, b.w, 6);
  g.fillStyle = "rgba(0,0,0,0.15)";
  g.fillRect(b.x, b.y + BH - 10, b.w, 8);
  g.save();
  g.beginPath();
  g.rect(b.x, b.y, b.w, BH - 2);
  g.clip();
  for (let x = b.x + 24; x < b.x + b.w; x += 54) drawFace(g, b.head, x, b.y + BH / 2 - 1, BH - 8);
  g.restore();
  g.globalAlpha = 1;
}

function draw() {
  const k = Math.min(1, state.stack.length / 40);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, `hsl(${210 + k * 60} 60% ${72 - k * 45}%)`);
  sky.addColorStop(1, `hsl(${190 + k * 40} 70% ${88 - k * 40}%)`);
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.save();
  g.translate(0, -state.cam);
  g.fillStyle = "#6b5a46";
  g.fillRect(-10, H - 44, W + 20, 200);
  for (const b of state.stack) block(b);
  if (state.cur) block(state.cur);
  for (const f of state.fall) {
    g.save();
    g.translate(f.x + f.w / 2, f.y + BH / 2);
    g.rotate(f.rot);
    g.translate(-(f.x + f.w / 2), -(f.y + BH / 2));
    block(f, 0.85);
    g.restore();
  }
  g.restore();
}

canvas.addEventListener("pointerdown", () => drop());
addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "ArrowDown" || event.key === "Enter") {
    if (state.mode === "play") {
      event.preventDefault();
      if (!event.repeat) drop();
    }
  }
});
overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Tour de têtes", text: "Pose chaque étage pile sur le précédent : ce qui dépasse tombe. Espace, clic ou touche l'écran pour lâcher.", button: "Empiler" });
loop(update, draw);
