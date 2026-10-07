import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const ROUND = 45;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const timeEl = document.getElementById("time");
mountSoundButton(document.getElementById("sound"), sfx);

const heads = await loadHeads();
const holes = [];
for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) holes.push({ x: 210 + col * 270, y: 230 + row * 150, mole: null });

const state = { mode: "ready", time: ROUND, score: 0, hits: 0, misses: 0, combo: 0, spawn: 0, best: getBest("taupe"), mouse: { x: W / 2, y: H / 2 }, swing: 0, fx: [], elapsed: 0 };
bestEl.textContent = state.best;

function reset() {
  Object.assign(state, { mode: "play", time: ROUND, score: 0, hits: 0, misses: 0, combo: 0, spawn: 0.4, swing: 0, fx: [], elapsed: 0 });
  holes.forEach((hole) => (hole.mole = null));
  scoreEl.textContent = "0";
  overlay.hide();
}

function spawnMole() {
  const free = holes.filter((hole) => !hole.mole);
  if (!free.length) return;
  const hole = pick(free);
  const golden = Math.random() < 0.12;
  const level = Math.min(1, state.elapsed / ROUND);
  hole.mole = { head: pick(heads), age: 0, life: (golden ? 0.7 : 1.5 - level * 0.7) + Math.random() * 0.4, golden, hit: false, hitTime: 0 };
}

function finish() {
  state.mode = "over";
  sfx.win();
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("taupe", state.best);
    bestEl.textContent = state.best;
  }
  overlay.show({
    eyebrow: record ? "Nouveau record !" : "Temps écoulé",
    title: "Bonk terminé",
    text: "Plus tu enchaînes, plus ça rapporte. Les têtes dorées valent 50 points.",
    button: "Rejouer",
    stats: statBlock([["Score", state.score], ["Touchées", state.hits], ["Ratées", state.misses]]),
  });
}

function bonk(x, y) {
  sfx.init();
  if (state.mode !== "play") return;
  state.swing = 1;
  let hitAny = false;
  for (const hole of holes) {
    const mole = hole.mole;
    if (!mole || mole.hit) continue;
    const lift = Math.min(1, mole.age / 0.15, (mole.life - mole.age) / 0.15 + 0.2);
    const top = hole.y - 118 * Math.max(0, lift);
    if (x > hole.x - 62 && x < hole.x + 62 && y > top - 10 && y < hole.y + 10) {
      mole.hit = true;
      mole.hitTime = 0;
      hitAny = true;
      state.combo += 1;
      const gain = (mole.golden ? 50 : 10) * (1 + Math.floor(state.combo / 4));
      state.score += gain;
      state.hits += 1;
      scoreEl.textContent = state.score;
      state.fx.push({ x: hole.x, y: top, text: `+${gain}`, t: 0 }, { x: hole.x, y: top + 20, text: "BONK!", t: 0, big: true });
      mole.golden ? sfx.coin() : null;
      sfx.bonk();
      break;
    }
  }
  if (!hitAny) {
    state.misses += 1;
    state.combo = 0;
    sfx.tone("sawtooth", 160, 100, 0.08, 0.08);
  }
}

function update(dt) {
  if (state.swing > 0) state.swing = Math.max(0, state.swing - dt * 6);
  for (const fx of state.fx) fx.t += dt;
  state.fx = state.fx.filter((fx) => fx.t < 0.8);
  if (state.mode !== "play") return;
  state.time -= dt;
  state.elapsed += dt;
  timeEl.textContent = Math.max(0, Math.ceil(state.time));
  if (state.time <= 0) {
    finish();
    return;
  }
  state.spawn -= dt;
  const level = Math.min(1, state.elapsed / ROUND);
  if (state.spawn <= 0) {
    spawnMole();
    if (level > 0.5 && Math.random() < 0.4) spawnMole();
    state.spawn = 0.75 - level * 0.4 + Math.random() * 0.3;
  }
  for (const hole of holes) {
    const mole = hole.mole;
    if (!mole) continue;
    mole.age += dt;
    if (mole.hit) mole.hitTime += dt;
    if (mole.hit ? mole.hitTime > 0.35 : mole.age > mole.life) {
      if (!mole.hit) state.combo = 0;
      hole.mole = null;
    }
  }
}

function hammer() {
  const { x, y } = state.mouse;
  g.save();
  g.translate(x + 8, y + 8);
  g.rotate(-0.9 + state.swing * 1.2);
  g.fillStyle = "#8a5a2b";
  g.fillRect(-6, -10, 12, 90);
  g.fillStyle = "#d0463c";
  g.beginPath();
  g.roundRect(-32, -50, 64, 44, 8);
  g.fill();
  g.fillStyle = "#e86b5f";
  g.fillRect(-32, -50, 64, 10);
  g.restore();
}

function draw() {
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#6cc3f0");
  sky.addColorStop(0.35, "#c8ecfb");
  sky.addColorStop(0.36, "#6bbf4a");
  sky.addColorStop(1, "#3f8f2f");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.8)";
  for (const [cx, cy] of [[150, 80], [520, 60], [820, 110]]) {
    g.beginPath();
    g.ellipse(cx, cy, 70, 24, 0, 0, Math.PI * 2);
    g.ellipse(cx + 40, cy - 12, 44, 26, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (const hole of holes) {
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.beginPath();
    g.ellipse(hole.x, hole.y + 14, 84, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#4b2e16";
    g.beginPath();
    g.ellipse(hole.x, hole.y, 76, 22, 0, 0, Math.PI * 2);
    g.fill();
    const mole = hole.mole;
    if (mole) {
      const lift = mole.hit ? Math.max(0, 1 - mole.hitTime / 0.35) : Math.max(0, Math.min(1, mole.age / 0.15, (mole.life - mole.age) / 0.15 + 0.2));
      g.save();
      g.beginPath();
      g.rect(hole.x - 90, hole.y - 160, 180, 160);
      g.clip();
      const bodyTop = hole.y - 118 * lift;
      g.fillStyle = mole.golden ? "#e8b923" : "#5b6dbf";
      g.beginPath();
      g.roundRect(hole.x - 34, bodyTop + 50, 68, 90, 16);
      g.fill();
      drawFace(g, mole.head, hole.x, bodyTop + 36, 84, mole.hit ? Math.sin(mole.hitTime * 40) * 0.25 : 0);
      if (mole.golden) {
        g.strokeStyle = "rgba(255, 224, 80, 0.9)";
        g.lineWidth = 5;
        g.beginPath();
        g.ellipse(hole.x, bodyTop + 36, 54, 52, 0, 0, Math.PI * 2);
        g.stroke();
      }
      g.restore();
    }
    g.fillStyle = "#6a4222";
    g.beginPath();
    g.ellipse(hole.x, hole.y + 4, 80, 18, 0, 0, Math.PI);
    g.fill();
    g.fillStyle = "#7b4f2a";
    g.beginPath();
    g.ellipse(hole.x, hole.y + 6, 84, 14, 0, 0, Math.PI);
    g.fill();
  }
  g.textAlign = "center";
  for (const fx of state.fx) {
    g.globalAlpha = Math.max(0, 1 - fx.t / 0.8);
    g.font = `800 ${fx.big ? 34 : 26}px "Inter", system-ui, sans-serif`;
    g.lineWidth = 5;
    g.strokeStyle = "rgba(0,0,0,0.7)";
    g.fillStyle = fx.big ? "#ffe066" : "#fff";
    g.strokeText(fx.text, fx.x, fx.y - fx.t * 60);
    g.fillText(fx.text, fx.x, fx.y - fx.t * 60);
  }
  g.globalAlpha = 1;
  if (state.combo > 1 && state.mode === "play") {
    g.font = '800 22px "Inter", system-ui, sans-serif';
    g.fillStyle = "#fff";
    g.strokeStyle = "rgba(0,0,0,0.6)";
    g.lineWidth = 4;
    g.strokeText(`Combo x${1 + Math.floor(state.combo / 4)}  (${state.combo})`, W / 2, H - 24);
    g.fillText(`Combo x${1 + Math.floor(state.combo / 4)}  (${state.combo})`, W / 2, H - 24);
  }
  if (state.mode === "play") hammer();
}

overlay.onAction(reset);
overlay.show({ eyebrow: "Arcade", title: "Tape-Tête", text: "Des têtes sortent des trous. Tape-les avec le marteau en mousse avant qu'elles ne disparaissent. 45 secondes.", button: "Jouer" });
timeEl.textContent = ROUND;

canvas.addEventListener("pointermove", (event) => {
  state.mouse = pointer(event, canvas, W, H);
});
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  state.mouse = pointer(event, canvas, W, H);
  bonk(state.mouse.x, state.mouse.y);
});

loop(update, draw);
