import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const WIN = 7;
const PH = 110;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const foeEl = document.getElementById("foe");
const bestEl = document.getElementById("best");
const heads = await loadHeads();
const state = { mode: "ready", me: 0, foe: 0, py: H / 2, target: H / 2, ay: H / 2, ball: null, wins: getBest("pong"), keys: {}, serve: 0, rally: 0, ballHead: heads[0], trail: [] };
bestEl.textContent = state.wins;

function serve(dir) {
  const angle = (Math.random() - 0.5) * 0.7;
  const speed = 420;
  state.ball = { x: W / 2, y: H / 2, vx: Math.cos(angle) * speed * dir, vy: Math.sin(angle) * speed, spin: 0 };
  state.ballHead = pick(heads);
  state.rally = 0;
  state.serve = 0.8;
  state.trail = [];
}

function reset() {
  Object.assign(state, { mode: "play", me: 0, foe: 0, py: H / 2, target: H / 2, ay: H / 2 });
  scoreEl.textContent = "0";
  foeEl.textContent = "0";
  serve(Math.random() < 0.5 ? 1 : -1);
  overlay.hide();
}

function point(who) {
  if (who === "me") state.me += 1;
  else state.foe += 1;
  scoreEl.textContent = state.me;
  foeEl.textContent = state.foe;
  who === "me" ? sfx.coin() : sfx.hit();
  if (state.me >= WIN || state.foe >= WIN) {
    state.mode = "over";
    const won = state.me >= WIN;
    if (won) {
      state.wins += 1;
      setBest("pong", state.wins);
      bestEl.textContent = state.wins;
      sfx.win();
    } else sfx.lose();
    overlay.show({
      eyebrow: won ? "Victoire" : "Défaite",
      title: won ? "Tu as battu la machine" : "La machine t'a ratatiné",
      text: won ? "Pas mal pour un humain." : "Elle n'a pas fait de cadeau.",
      button: "Revanche",
      stats: statBlock([["Toi", state.me], ["Lui", state.foe]]),
    });
    return;
  }
  serve(who === "me" ? -1 : 1);
}

function bounce(paddleX, paddleY, dir) {
  const b = state.ball;
  const rel = Math.max(-1, Math.min(1, (b.y - paddleY) / (PH / 2)));
  const speed = Math.min(980, Math.hypot(b.vx, b.vy) * 1.06);
  const angle = rel * 0.95;
  b.vx = Math.cos(angle) * speed * dir;
  b.vy = Math.sin(angle) * speed;
  b.x = paddleX + dir * 22;
  state.rally += 1;
  sfx.tone("square", 520 + state.rally * 20, 520 + state.rally * 20, 0.06, 0.12);
}

function update(dt) {
  if (state.mode !== "play") return;
  if (state.keys.ArrowUp || state.keys.w || state.keys.z) state.target = Math.max(PH / 2, state.target - 620 * dt);
  if (state.keys.ArrowDown || state.keys.s) state.target = Math.min(H - PH / 2, state.target + 620 * dt);
  state.py += (state.target - state.py) * Math.min(1, dt * 18);
  const b = state.ball;
  if (state.serve > 0) {
    state.serve -= dt;
    return;
  }
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.spin += dt * 6 * Math.sign(b.vx);
  state.trail.push({ x: b.x, y: b.y });
  if (state.trail.length > 9) state.trail.shift();
  if (b.y < 26) {
    b.y = 26;
    b.vy = Math.abs(b.vy);
    sfx.tone("triangle", 300, 300, 0.04, 0.08);
  }
  if (b.y > H - 26) {
    b.y = H - 26;
    b.vy = -Math.abs(b.vy);
    sfx.tone("triangle", 300, 300, 0.04, 0.08);
  }
  const lag = Math.max(0.6, 1 - (state.me - state.foe) * -0.02);
  const aim = b.vx > 0 ? b.y : H / 2;
  const maxStep = (300 + state.rally * 22) * dt * lag;
  const delta = aim - state.ay;
  state.ay += Math.max(-maxStep, Math.min(maxStep, delta));
  state.ay = Math.max(PH / 2, Math.min(H - PH / 2, state.ay));
  if (b.vx < 0 && b.x < 52 && b.x > 20 && Math.abs(b.y - state.py) < PH / 2 + 18) bounce(34, state.py, 1);
  if (b.vx > 0 && b.x > W - 52 && b.x < W - 20 && Math.abs(b.y - state.ay) < PH / 2 + 18) bounce(W - 34, state.ay, -1);
  if (b.x < -30) point("foe");
  else if (b.x > W + 30) point("me");
}

function draw() {
  g.fillStyle = "#0c1020";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.18)";
  for (let y = 10; y < H; y += 36) g.fillRect(W / 2 - 3, y, 6, 20);
  g.fillStyle = "#5ee3ff";
  g.fillRect(24, state.py - PH / 2, 14, PH);
  g.fillStyle = "#ff7a8a";
  g.fillRect(W - 38, state.ay - PH / 2, 14, PH);
  if (state.ball && state.mode !== "ready") {
    g.globalAlpha = 0.22;
    state.trail.forEach((t, i) => drawFace(g, state.ballHead, t.x, t.y, 24 + i * 2));
    g.globalAlpha = 1;
    drawFace(g, state.ballHead, state.ball.x, state.ball.y, 54, state.ball.spin);
  }
}

canvas.addEventListener("pointermove", (event) => {
  state.target = Math.max(PH / 2, Math.min(H - PH / 2, pointer(event, canvas, W, H).y));
});
canvas.addEventListener("pointerdown", (event) => {
  sfx.init();
  state.target = Math.max(PH / 2, Math.min(H - PH / 2, pointer(event, canvas, W, H).y));
});
addEventListener("keydown", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = true;
  if (["ArrowUp", "ArrowDown"].includes(event.key) && state.mode === "play") event.preventDefault();
});
addEventListener("keyup", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = false;
});
overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Ping-pong des têtes", text: "Premier à 7 points. La balle est une tête, et elle accélère à chaque échange.", button: "Jouer" });
loop(update, draw);
