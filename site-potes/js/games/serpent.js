import { createOverlay, createSfx, drawFace, getBest, loadHeads, mountSoundButton, pick, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const CELL = 28;
const COLS = 32;
const ROWS = 20;
const W = COLS * CELL;
const H = ROWS * CELL;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
mountSoundButton(document.getElementById("sound"), sfx);

const heads = await loadHeads();
const state = { mode: "ready", snake: [], dir: { x: 1, y: 0 }, queue: [], food: null, foodHead: heads[0], score: 0, step: 0.13, acc: 0, best: getBest("serpent"), head: heads[0], bursts: [], time: 0 };
bestEl.textContent = state.best;

function place() {
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (state.snake.some((part) => part.x === cell.x && part.y === cell.y));
  state.food = cell;
  state.foodHead = pick(heads);
}

function reset() {
  state.snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
  state.dir = { x: 1, y: 0 };
  state.queue = [];
  state.score = 0;
  state.step = 0.13;
  state.acc = 0;
  state.head = pick(heads);
  state.bursts = [];
  state.mode = "play";
  scoreEl.textContent = "0";
  place();
  overlay.hide();
}

function turn(x, y) {
  sfx.init();
  const last = state.queue.length ? state.queue[state.queue.length - 1] : state.dir;
  if (last.x === -x && last.y === -y) return;
  if (last.x === x && last.y === y) return;
  if (state.queue.length < 3) state.queue.push({ x, y });
}

function die() {
  state.mode = "over";
  sfx.hit();
  setTimeout(() => sfx.lose(), 150);
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("serpent", state.best);
    bestEl.textContent = state.best;
  }
  setTimeout(
    () =>
      overlay.show({
        eyebrow: record ? "Nouveau record !" : "Crac",
        title: "Le serpent s'est mordu",
        text: "Flèches, ZQSD ou glisse le doigt pour tourner.",
        button: "Rejouer",
        stats: statBlock([["Score", state.score], ["Longueur", state.snake.length]]),
      }),
    450,
  );
}

function tick() {
  if (state.queue.length) state.dir = state.queue.shift();
  const head = state.snake[0];
  const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };
  if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS || state.snake.some((part) => part.x === next.x && part.y === next.y)) {
    die();
    return;
  }
  state.snake.unshift(next);
  if (next.x === state.food.x && next.y === state.food.y) {
    state.score += 10;
    scoreEl.textContent = state.score;
    sfx.eat();
    state.bursts.push({ x: next.x * CELL + CELL / 2, y: next.y * CELL + CELL / 2, t: 0 });
    state.step = Math.max(0.05, 0.13 - Math.floor(state.score / 50) * 0.01);
    place();
  } else {
    state.snake.pop();
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.time += dt;
  for (const burst of state.bursts) burst.t += dt;
  state.bursts = state.bursts.filter((burst) => burst.t < 0.5);
  if (state.mode === "play") {
    state.acc += dt;
    while (state.acc >= state.step && state.mode === "play") {
      state.acc -= state.step;
      tick();
    }
  }
  draw();
  requestAnimationFrame(frame);
}

function draw() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      g.fillStyle = (x + y) % 2 ? "#1a2a1d" : "#1e301f";
      g.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }
  if (state.food) {
    const pulse = 1 + Math.sin(state.time * 6) * 0.06;
    drawFace(g, state.foodHead, state.food.x * CELL + CELL / 2, state.food.y * CELL + CELL / 2, CELL * 1.25 * pulse);
  }
  state.snake.forEach((part, index) => {
    if (index === 0) return;
    const ratio = 1 - index / (state.snake.length + 4);
    g.fillStyle = `hsl(${168 - index * 2}, 70%, ${30 + ratio * 24}%)`;
    g.beginPath();
    g.roundRect(part.x * CELL + 2, part.y * CELL + 2, CELL - 4, CELL - 4, 8);
    g.fill();
  });
  const head = state.snake[0];
  if (head) drawFace(g, state.head, head.x * CELL + CELL / 2, head.y * CELL + CELL / 2, CELL * 1.7);
  for (const burst of state.bursts) {
    g.globalAlpha = 1 - burst.t / 0.5;
    g.strokeStyle = "#fff0a0";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(burst.x, burst.y, 8 + burst.t * 70, 0, Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
}

overlay.onAction(reset);
overlay.show({ eyebrow: "Arcade", title: "Serpent gourmand", text: "Mange les têtes pour grandir sans te mordre ni toucher les bords. Ça accélère à chaque palier.", button: "Jouer" });

addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const map = { arrowup: [0, -1], z: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], q: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
  if (map[key]) {
    event.preventDefault();
    if (state.mode === "play") turn(...map[key]);
  } else if (key === " " && state.mode === "play") {
    event.preventDefault();
    state.mode = "pause";
    overlay.show({ eyebrow: "Pause", title: "En pause", text: "", button: "Reprendre" });
  }
});

let touch = null;
canvas.addEventListener("pointerdown", (event) => {
  touch = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener("pointerup", (event) => {
  if (!touch || state.mode !== "play") return;
  const dx = event.clientX - touch.x;
  const dy = event.clientY - touch.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
  else turn(0, dy > 0 ? 1 : -1);
});

const baseAction = reset;
overlay.onAction(() => {
  if (state.mode === "pause") {
    state.mode = "play";
    overlay.hide();
  } else baseAction();
});

requestAnimationFrame(frame);
