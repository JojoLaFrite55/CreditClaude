import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 540;
const H = 750;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const heads = await loadHeads();
const state = { mode: "ready", x: W / 2, y: 0, vy: 0, vx: 0, cam: 0, plats: [], best: getBest("saute"), head: heads[0], target: W / 2, keys: {}, maxH: 0, fx: [], t: 0, face: 1 };
bestEl.textContent = state.best;

function makePlat(y) {
  const level = Math.min(1, state.maxH / 9000);
  const r = Math.random();
  let type = "normal";
  if (r < 0.12 + level * 0.12) type = "move";
  else if (r < 0.2 + level * 0.2) type = "break";
  else if (r < 0.26) type = "spring";
  return { x: 20 + Math.random() * (W - 120), y, w: 90, type, dir: Math.random() < 0.5 ? 1 : -1, dead: false };
}

function reset() {
  state.plats = [{ x: W / 2 - 60, y: H - 60, w: 120, type: "normal", dir: 1, dead: false }];
  let y = H - 60;
  while (y > -200) {
    y -= 60 + Math.random() * 40;
    state.plats.push(makePlat(y));
  }
  Object.assign(state, { mode: "play", x: W / 2, y: H - 110, vy: -820, vx: 0, cam: 0, maxH: 0, head: pick(heads), target: W / 2, fx: [], t: 0 });
  scoreEl.textContent = "0";
  overlay.hide();
}

function end() {
  state.mode = "over";
  sfx.lose();
  const score = Math.floor(state.maxH / 10);
  const record = score > state.best;
  if (record) {
    state.best = score;
    setBest("saute", score);
    bestEl.textContent = score;
  }
  overlay.show({ eyebrow: record ? "Nouveau record !" : "Chute", title: "Tu es tombé", text: "Rebondis sur les plateformes, évite le vide.", button: "Rejouer", stats: statBlock([["Hauteur", `${score} m`]]) });
}

function update(dt) {
  state.t += dt;
  for (const fx of state.fx) {
    fx.t += dt;
    fx.y += fx.vy * dt;
  }
  state.fx = state.fx.filter((fx) => fx.t < 0.6);
  if (state.mode !== "play") return;
  const left = state.keys.ArrowLeft || state.keys.q || state.keys.a;
  const right = state.keys.ArrowRight || state.keys.d;
  if (left) state.target = state.x - 500 * dt;
  if (right) state.target = state.x + 500 * dt;
  if (left || right) state.x = state.target;
  else state.x += (state.target - state.x) * Math.min(1, dt * 9);
  state.face = Math.sign(state.target - state.x) || state.face;
  if (state.x < -20) state.x = W + 20;
  if (state.x > W + 20) state.x = -20;
  state.target = Math.max(-20, Math.min(W + 20, state.target));
  state.vy += 1900 * dt;
  state.y += state.vy * dt;
  for (const p of state.plats) {
    if (p.type === "move") {
      p.x += p.dir * 90 * dt;
      if (p.x < 10 || p.x + p.w > W - 10) p.dir *= -1;
    }
  }
  if (state.vy > 0) {
    for (const p of state.plats) {
      if (p.dead) continue;
      if (state.x > p.x - 18 && state.x < p.x + p.w + 18 && state.y + 40 >= p.y && state.y + 40 - state.vy * dt <= p.y + 14) {
        if (p.type === "break") {
          p.dead = true;
          sfx.tone("sawtooth", 200, 80, 0.15, 0.1);
          continue;
        }
        state.vy = p.type === "spring" ? -1350 : -840;
        state.y = p.y - 40;
        p.type === "spring" ? sfx.boing() : sfx.tone("triangle", 380, 560, 0.07, 0.1);
        state.fx.push({ x: state.x, y: p.y, vy: 60, t: 0 });
        break;
      }
    }
  }
  const target = state.y - H * 0.42;
  if (target < state.cam) state.cam = target;
  const climbed = H - 110 - state.y;
  if (climbed > state.maxH) {
    state.maxH = climbed;
    scoreEl.textContent = Math.floor(state.maxH / 10);
  }
  const top = Math.min(...state.plats.map((p) => p.y));
  if (top > state.cam - 80) {
    let y = top;
    while (y > state.cam - 300) {
      y -= 56 + Math.random() * 40 + Math.min(40, state.maxH / 300);
      state.plats.push(makePlat(y));
    }
  }
  state.plats = state.plats.filter((p) => p.y < state.cam + H + 100 && !(p.dead && p.y > state.cam + H));
  if (state.y - state.cam > H + 80) end();
}

function draw() {
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#fdf1c9");
  sky.addColorStop(1, "#bfe6ff");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.save();
  g.translate(0, -state.cam);
  for (const p of state.plats) {
    if (p.dead) {
      g.globalAlpha = 0.4;
    }
    g.fillStyle = p.type === "move" ? "#4e7bff" : p.type === "break" ? "#b6794a" : "#3fae56";
    g.beginPath();
    g.roundRect(p.x, p.y, p.w, 16, 8);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(p.x + 6, p.y + 3, p.w - 12, 3);
    if (p.type === "spring") {
      g.fillStyle = "#e5e5ea";
      g.fillRect(p.x + p.w / 2 - 12, p.y - 12, 24, 12);
      g.fillStyle = "#ef5b5b";
      g.fillRect(p.x + p.w / 2 - 14, p.y - 18, 28, 8);
    }
    g.globalAlpha = 1;
  }
  for (const fx of state.fx) {
    g.globalAlpha = 1 - fx.t / 0.6;
    g.strokeStyle = "#fff";
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(fx.x, fx.y + 6, 24 + fx.t * 60, 6 + fx.t * 12, 0, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }
  if (state.mode !== "ready") {
    const squash = state.vy < 0 ? 1.06 : 0.96;
    g.save();
    g.translate(state.x, state.y);
    g.scale(1 / squash, squash);
    g.restore();
    drawFace(g, state.head, state.x, state.y, 78, Math.max(-0.3, Math.min(0.3, state.vy / 3000)) * state.face);
    if (state.x < 40) drawFace(g, state.head, state.x + W, state.y, 78);
    if (state.x > W - 40) drawFace(g, state.head, state.x - W, state.y, 78);
  }
  g.restore();
}

canvas.addEventListener("pointermove", (event) => {
  state.target = pointer(event, canvas, W, H).x;
});
canvas.addEventListener("pointerdown", (event) => {
  sfx.init();
  state.target = pointer(event, canvas, W, H).x;
});
addEventListener("keydown", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = true;
  if (["ArrowLeft", "ArrowRight"].includes(event.key) && state.mode === "play") event.preventDefault();
});
addEventListener("keyup", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = false;
});
overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Saute-Tête", text: "Rebondis de plateforme en plateforme le plus haut possible. Souris, doigt ou flèches pour te déplacer. Les marron cassent, les bleues bougent, le ressort te propulse.", button: "Sauter" });
loop(update, draw);
