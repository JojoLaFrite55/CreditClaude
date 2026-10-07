import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 540;
const H = 750;
const GROUND = 70;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
mountSoundButton(document.getElementById("sound"), sfx);

const heads = await loadHeads();
const state = { mode: "ready", head: pick(heads), y: H / 2, vy: 0, pipes: [], score: 0, time: 0, best: getBest("flappy"), shake: 0, clouds: [] };
bestEl.textContent = state.best;
for (let i = 0; i < 6; i++) state.clouds.push({ x: Math.random() * W, y: 40 + Math.random() * 300, s: 0.6 + Math.random() * 0.9 });

const speed = () => 180 + Math.min(120, state.score * 4);
const gap = () => Math.max(158, 205 - state.score * 2);

function reset() {
  Object.assign(state, { mode: "ready", y: H / 2, vy: 0, pipes: [], score: 0, time: 0, head: pick(heads) });
  scoreEl.textContent = "0";
}

function flap() {
  sfx.init();
  if (state.mode === "over") return;
  if (state.mode === "ready") {
    state.mode = "play";
    overlay.hide();
    addPipe(W + 80);
  }
  state.vy = -470;
  sfx.flap();
}

function addPipe(x) {
  const g2 = gap();
  state.pipes.push({ x, top: 90 + Math.random() * (H - GROUND - g2 - 180), gap: g2, passed: false });
}

function die() {
  state.mode = "over";
  state.shake = 14;
  sfx.hit();
  setTimeout(() => sfx.lose(), 150);
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("flappy", state.best);
    bestEl.textContent = state.best;
  }
  setTimeout(
    () =>
      overlay.show({
        eyebrow: record ? "Nouveau record !" : "Aïe",
        title: "Écrasé par un tuyau",
        text: "Appuie sur Espace ou touche l'écran pour réessayer.",
        button: "Rejouer",
        stats: statBlock([["Score", state.score], ["Record", state.best]]),
      }),
    600,
  );
}

function update(dt) {
  state.time += dt;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 40);
  for (const cloud of state.clouds) {
    cloud.x -= 12 * cloud.s * dt;
    if (cloud.x < -120) cloud.x = W + 100;
  }
  if (state.mode === "ready") {
    state.y = H / 2 + Math.sin(state.time * 4) * 10;
    return;
  }
  if (state.mode === "over") {
    state.vy += 1700 * dt;
    state.y = Math.min(H - GROUND - 22, state.y + state.vy * dt);
    return;
  }
  state.vy += 1500 * dt;
  state.y += state.vy * dt;
  for (const pipe of state.pipes) {
    pipe.x -= speed() * dt;
    if (!pipe.passed && pipe.x + 36 < W * 0.28) {
      pipe.passed = true;
      state.score += 1;
      scoreEl.textContent = state.score;
      sfx.coin();
    }
    const px = W * 0.28;
    if (px + 20 > pipe.x && px - 20 < pipe.x + 72 && (state.y - 20 < pipe.top || state.y + 20 > pipe.top + pipe.gap)) die();
  }
  state.pipes = state.pipes.filter((pipe) => pipe.x > -100);
  const last = state.pipes[state.pipes.length - 1];
  if (!last || last.x < W - 270) addPipe(W + 40);
  if (state.y + 22 > H - GROUND || state.y < -40) die();
}

function pipeShape(x, y, w, h, capTop) {
  const grad = g.createLinearGradient(x, 0, x + w, 0);
  grad.addColorStop(0, "#2f8f46");
  grad.addColorStop(0.4, "#58c96e");
  grad.addColorStop(1, "#216c33");
  g.fillStyle = grad;
  g.fillRect(x, y, w, h);
  const capY = capTop ? y + h - 30 : y;
  g.fillRect(x - 6, capY, w + 12, 30);
  g.strokeStyle = "#16401f";
  g.lineWidth = 3;
  g.strokeRect(x, y, w, h);
  g.strokeRect(x - 6, capY, w + 12, 30);
}

function draw() {
  g.save();
  if (state.shake > 0) g.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#4fa8e8");
  sky.addColorStop(1, "#bfe6fb");
  g.fillStyle = sky;
  g.fillRect(-20, -20, W + 40, H + 40);
  g.fillStyle = "rgba(255,255,255,0.85)";
  for (const cloud of state.clouds) {
    g.beginPath();
    g.ellipse(cloud.x, cloud.y, 60 * cloud.s, 22 * cloud.s, 0, 0, Math.PI * 2);
    g.ellipse(cloud.x + 34 * cloud.s, cloud.y - 12 * cloud.s, 40 * cloud.s, 24 * cloud.s, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (const pipe of state.pipes) {
    pipeShape(pipe.x, -10, 72, pipe.top + 10, true);
    pipeShape(pipe.x, pipe.top + pipe.gap, 72, H, false);
  }
  const scroll = (state.time * speed()) % 40;
  g.fillStyle = "#d9c987";
  g.fillRect(-20, H - GROUND, W + 40, GROUND + 20);
  g.fillStyle = "#6ab04c";
  g.fillRect(-20, H - GROUND, W + 40, 16);
  g.fillStyle = "#4e8f36";
  for (let x = -scroll; x < W + 40; x += 40) g.fillRect(x, H - GROUND + 16, 20, 8);
  drawFace(g, state.head, W * 0.28, state.y, 54, Math.max(-0.5, Math.min(1, state.vy / 700)));
  g.restore();
  g.font = '800 64px "Inter", system-ui, sans-serif';
  g.textAlign = "center";
  g.lineWidth = 8;
  g.strokeStyle = "rgba(0,0,0,0.55)";
  g.fillStyle = "#fff";
  if (state.mode !== "ready") {
    g.strokeText(state.score, W / 2, 130);
    g.fillText(state.score, W / 2, 130);
  }
}

overlay.onAction(() => {
  reset();
  flap();
});
overlay.show({ eyebrow: "Arcade", title: "Flappy Tête", text: "Appuie sur Espace, clique ou touche l'écran pour battre des ailes. Évite les tuyaux.", button: "Jouer" });

addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.key === "ArrowUp") {
    event.preventDefault();
    if (state.mode === "over" && !document.getElementById("ov").classList.contains("hidden")) {
      reset();
      flap();
      return;
    }
    if (state.mode === "ready" && !document.getElementById("ov").classList.contains("hidden")) return;
    flap();
  }
});
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (state.mode === "over") return;
  if (state.mode === "ready" && !document.getElementById("ov").classList.contains("hidden")) return;
  flap();
});

loop(update, draw);
