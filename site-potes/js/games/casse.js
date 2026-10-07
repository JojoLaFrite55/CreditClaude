import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, pointer, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const livesEl = document.getElementById("lives");
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();

const COLORS = ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#457b9d", "#8e44ad", "#ef476f", "#06d6a0", "#118ab2"];
const state = { mode: "ready", paddle: { x: W / 2, w: 130, target: 130 }, balls: [], bricks: [], drops: [], score: 0, lives: 3, level: 1, best: getBest("casse"), shake: 0, particles: [], slow: 0, time: 0 };
bestEl.textContent = state.best;

function buildLevel() {
  state.bricks = [];
  const rows = Math.min(9, 4 + state.level);
  const cols = 12;
  const bw = (W - 80) / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (state.level > 2 && (r + c) % 7 === 0 && r > 1) continue;
      const special = Math.random() < 0.09;
      state.bricks.push({ x: 40 + c * bw, y: 70 + r * 30, w: bw - 4, h: 26, color: COLORS[r % COLORS.length], hp: r < 1 && state.level > 1 ? 2 : 1, head: special ? pick(heads) : null });
    }
  }
}

function serve() {
  state.balls = [{ x: state.paddle.x, y: H - 60, vx: 0, vy: 0, stuck: true, speed: 430 + state.level * 25 }];
}

function reset() {
  Object.assign(state, { mode: "play", score: 0, lives: 3, level: 1, drops: [], particles: [], slow: 0 });
  state.paddle.w = state.paddle.target = 130;
  buildLevel();
  serve();
  scoreEl.textContent = "0";
  livesEl.textContent = "3";
  overlay.hide();
}

function launch() {
  sfx.init();
  for (const ball of state.balls) {
    if (ball.stuck) {
      ball.stuck = false;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
      ball.vx = Math.cos(angle) * ball.speed;
      ball.vy = Math.sin(angle) * ball.speed;
      sfx.pop();
    }
  }
}

function burst(x, y, color) {
  for (let i = 0; i < 10; i++) state.particles.push({ x, y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240, life: 0, color });
}

function drop(x, y) {
  const kind = pick(["wide", "multi", "slow", "life"]);
  state.drops.push({ x, y, kind });
}

function applyDrop(kind) {
  sfx.coin();
  if (kind === "wide") state.paddle.target = Math.min(240, state.paddle.target + 50);
  else if (kind === "multi") {
    const source = state.balls.find((ball) => !ball.stuck) ?? state.balls[0];
    for (const dx of [-0.5, 0.5]) {
      const angle = Math.atan2(source.vy, source.vx) + dx;
      const speed = Math.hypot(source.vx, source.vy) || source.speed;
      state.balls.push({ x: source.x, y: source.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, stuck: false, speed: source.speed });
    }
  } else if (kind === "slow") state.slow = 8;
  else if (kind === "life") {
    state.lives = Math.min(5, state.lives + 1);
    livesEl.textContent = state.lives;
  }
}

function loseBall() {
  state.lives -= 1;
  livesEl.textContent = state.lives;
  sfx.hit();
  state.shake = 10;
  if (state.lives <= 0) {
    state.mode = "over";
    sfx.lose();
    const record = state.score > state.best;
    if (record) {
      state.best = state.score;
      setBest("casse", state.best);
      bestEl.textContent = state.best;
    }
    overlay.show({ eyebrow: record ? "Nouveau record !" : "Perdu", title: "Plus de balles", text: "La souris, le doigt ou les flèches déplacent la raquette.", button: "Rejouer", stats: statBlock([["Score", state.score], ["Niveau", state.level]]) });
  } else {
    state.paddle.target = Math.max(130, state.paddle.target - 40);
    serve();
  }
}

function update(dt) {
  state.time += dt;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 30);
  for (const p of state.particles) {
    p.life += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 500 * dt;
  }
  state.particles = state.particles.filter((p) => p.life < 0.5);
  if (state.mode !== "play") return;
  state.paddle.w += (state.paddle.target - state.paddle.w) * Math.min(1, dt * 8);
  if (state.slow > 0) state.slow -= dt;
  const pad = state.paddle;
  if (keys.left) pad.x -= 620 * dt;
  if (keys.right) pad.x += 620 * dt;
  pad.x = Math.max(pad.w / 2, Math.min(W - pad.w / 2, pad.x));
  for (const drop2 of state.drops) {
    drop2.y += 190 * dt;
    if (drop2.y > H - 50 && drop2.y < H - 20 && Math.abs(drop2.x - pad.x) < pad.w / 2 + 14) {
      drop2.dead = true;
      applyDrop(drop2.kind);
    }
  }
  state.drops = state.drops.filter((drop2) => !drop2.dead && drop2.y < H + 30);
  const factor = state.slow > 0 ? 0.65 : 1;
  for (const ball of state.balls) {
    if (ball.stuck) {
      ball.x = pad.x;
      ball.y = H - 60;
      continue;
    }
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      ball.x += (ball.vx * dt * factor) / steps;
      ball.y += (ball.vy * dt * factor) / steps;
      if (ball.x < 9) {
        ball.x = 9;
        ball.vx = Math.abs(ball.vx);
        sfx.tick();
      } else if (ball.x > W - 9) {
        ball.x = W - 9;
        ball.vx = -Math.abs(ball.vx);
        sfx.tick();
      }
      if (ball.y < 9) {
        ball.y = 9;
        ball.vy = Math.abs(ball.vy);
        sfx.tick();
      }
      if (ball.vy > 0 && ball.y > H - 52 && ball.y < H - 30 && Math.abs(ball.x - pad.x) < pad.w / 2 + 6) {
        const offset = (ball.x - pad.x) / (pad.w / 2);
        const angle = -Math.PI / 2 + offset * 1.05;
        const speed = Math.min(ball.speed * 1.9, Math.hypot(ball.vx, ball.vy) * 1.015);
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
        ball.y = H - 53;
        sfx.pop();
      }
      for (const brick of state.bricks) {
        if (brick.dead) continue;
        if (ball.x > brick.x - 9 && ball.x < brick.x + brick.w + 9 && ball.y > brick.y - 9 && ball.y < brick.y + brick.h + 9) {
          const overlapX = Math.min(ball.x - (brick.x - 9), brick.x + brick.w + 9 - ball.x);
          const overlapY = Math.min(ball.y - (brick.y - 9), brick.y + brick.h + 9 - ball.y);
          if (overlapX < overlapY) ball.vx = -ball.vx;
          else ball.vy = -ball.vy;
          brick.hp -= 1;
          if (brick.hp <= 0) {
            brick.dead = true;
            state.score += brick.head ? 50 : 10;
            scoreEl.textContent = state.score;
            burst(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
            sfx.tone("square", 500 + Math.random() * 300, 900, 0.07, 0.1);
            if (brick.head || Math.random() < 0.08) drop(brick.x + brick.w / 2, brick.y);
          } else sfx.tick();
          break;
        }
      }
    }
  }
  state.balls = state.balls.filter((ball) => ball.y < H + 20);
  if (!state.balls.length) loseBall();
  state.bricks = state.bricks.filter((brick) => !brick.dead);
  if (state.mode === "play" && !state.bricks.length) {
    state.level += 1;
    sfx.win();
    buildLevel();
    serve();
    state.drops = [];
  }
}

function draw() {
  g.save();
  if (state.shake > 0) g.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#101428");
  bg.addColorStop(1, "#05070f");
  g.fillStyle = bg;
  g.fillRect(-10, -10, W + 20, H + 20);
  for (const brick of state.bricks) {
    g.fillStyle = brick.color;
    g.globalAlpha = brick.hp > 1 ? 1 : 0.88;
    g.beginPath();
    g.roundRect(brick.x, brick.y, brick.w, brick.h, 5);
    g.fill();
    g.globalAlpha = 1;
    if (brick.hp > 1) {
      g.strokeStyle = "#fff";
      g.lineWidth = 2;
      g.stroke();
    }
    if (brick.head) drawFace(g, brick.head, brick.x + brick.w / 2, brick.y + brick.h / 2, brick.h + 8);
  }
  for (const drop2 of state.drops) {
    const label = { wide: "↔", multi: "x3", slow: "◔", life: "+1" }[drop2.kind];
    g.fillStyle = "#ffd54a";
    g.beginPath();
    g.roundRect(drop2.x - 20, drop2.y - 12, 40, 24, 12);
    g.fill();
    g.fillStyle = "#121212";
    g.font = '800 14px "Inter", sans-serif';
    g.textAlign = "center";
    g.fillText(label, drop2.x, drop2.y + 5);
  }
  for (const p of state.particles) {
    g.globalAlpha = 1 - p.life / 0.5;
    g.fillStyle = p.color;
    g.fillRect(p.x, p.y, 4, 4);
  }
  g.globalAlpha = 1;
  const pad = state.paddle;
  g.fillStyle = "#e6edf3";
  g.beginPath();
  g.roundRect(pad.x - pad.w / 2, H - 46, pad.w, 14, 7);
  g.fill();
  g.fillStyle = "#14b8a6";
  g.fillRect(pad.x - pad.w / 2 + 8, H - 42, pad.w - 16, 4);
  for (const ball of state.balls) {
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(ball.x, ball.y, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)";
    g.beginPath();
    g.arc(ball.x, ball.y, 15, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  if (state.mode === "play") {
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.font = '600 14px "Inter", sans-serif';
    g.textAlign = "right";
    g.fillText(`Niveau ${state.level}${state.slow > 0 ? "  ·  ralenti" : ""}`, W - 14, H - 12);
  }
  if (state.mode === "play" && state.balls.some((ball) => ball.stuck)) {
    g.fillStyle = "rgba(255,255,255,0.8)";
    g.textAlign = "center";
    g.font = '600 18px "Inter", sans-serif';
    g.fillText("Clique ou Espace pour lancer", W / 2, H - 110);
  }
}

const keys = { left: false, right: false };
addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "q" || key === "a") keys.left = true;
  else if (key === "arrowright" || key === "d") keys.right = true;
  else if (key === " " && state.mode === "play") {
    event.preventDefault();
    launch();
  }
});
addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "q" || key === "a") keys.left = false;
  else if (key === "arrowright" || key === "d") keys.right = false;
});
canvas.addEventListener("pointermove", (event) => {
  if (state.mode === "play") state.paddle.x = pointer(event, canvas, W, H).x;
});
canvas.addEventListener("pointerdown", (event) => {
  if (state.mode !== "play") return;
  state.paddle.x = pointer(event, canvas, W, H).x;
  launch();
});

overlay.onAction(reset);
overlay.show({ eyebrow: "Arcade", title: "Casse-Tête", text: "Détruis toutes les briques avec la balle. Les têtes valent 50 points et lâchent des bonus : raquette large, triple balle, ralenti, vie.", button: "Jouer" });
loop(update, draw);
