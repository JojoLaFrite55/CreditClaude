import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const COLS = 10;
const ROWS = 20;
const CELL = 34;
const W = 540;
const H = 750;
const OX = 20;
const OY = 35;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");
const heads = await loadHeads();

const SHAPES = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]],
  O: [[1, 0], [2, 0], [1, 1], [2, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};
const KINDS = Object.keys(SHAPES);
const COLORS = { I: "#4cc9f0", O: "#f9c74f", T: "#b565d9", S: "#6fcf6f", Z: "#ef5b5b", J: "#4e7bff", L: "#f4934a" };
const state = { mode: "ready", grid: [], piece: null, next: null, bag: [], score: 0, lines: 0, level: 1, drop: 0, lock: 0, best: getBest("tetris"), skins: {}, clear: null, keys: {}, repeat: 0, fx: [] };
bestEl.textContent = state.best;
KINDS.forEach((kind) => (state.skins[kind] = pick(heads)));

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function nextKind() {
  if (!state.bag.length) {
    state.bag = [...KINDS];
    for (let i = state.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.bag[i], state.bag[j]] = [state.bag[j], state.bag[i]];
    }
  }
  return state.bag.pop();
}

function spawn() {
  const kind = state.next || nextKind();
  state.next = nextKind();
  state.piece = { kind, cells: SHAPES[kind].map(([x, y]) => [x, y]), x: 3, y: kind === "I" ? -1 : 0 };
  state.lock = 0;
  if (collides(state.piece.cells, state.piece.x, state.piece.y)) end();
}

function collides(cells, px, py) {
  return cells.some(([x, y]) => {
    const gx = x + px;
    const gy = y + py;
    return gx < 0 || gx >= COLS || gy >= ROWS || (gy >= 0 && state.grid[gy][gx]);
  });
}

function rotated(cells, kind) {
  if (kind === "O") return cells;
  const size = kind === "I" ? 4 : 3;
  return cells.map(([x, y]) => [size - 1 - y, x]);
}

function rotate() {
  if (state.mode !== "play") return;
  const p = state.piece;
  const cells = rotated(p.cells, p.kind);
  for (const kick of [0, -1, 1, -2, 2]) {
    if (!collides(cells, p.x + kick, p.y)) {
      p.cells = cells;
      p.x += kick;
      sfx.tone("triangle", 520, 640, 0.05, 0.08);
      return;
    }
  }
}

function move(dx) {
  if (state.mode !== "play") return;
  const p = state.piece;
  if (!collides(p.cells, p.x + dx, p.y)) {
    p.x += dx;
    sfx.tick();
  }
}

function lockPiece() {
  const p = state.piece;
  for (const [x, y] of p.cells) {
    if (p.y + y >= 0) state.grid[p.y + y][p.x + x] = { kind: p.kind };
  }
  sfx.tone("square", 180, 120, 0.08, 0.1);
  const full = [];
  state.grid.forEach((row, y) => {
    if (row.every(Boolean)) full.push(y);
  });
  if (full.length) {
    state.clear = { rows: full, t: 0 };
    sfx.coin();
  } else spawn();
}

function finishClear() {
  const { rows } = state.clear;
  state.grid = state.grid.filter((_, y) => !rows.includes(y));
  while (state.grid.length < ROWS) state.grid.unshift(Array(COLS).fill(null));
  const gain = [0, 100, 300, 500, 800][rows.length] * state.level;
  state.score += gain;
  state.lines += rows.length;
  state.level = 1 + Math.floor(state.lines / 10);
  scoreEl.textContent = state.score;
  linesEl.textContent = state.lines;
  levelEl.textContent = state.level;
  if (rows.length === 4) sfx.win();
  state.clear = null;
  spawn();
}

function hardDrop() {
  if (state.mode !== "play" || state.clear) return;
  const p = state.piece;
  let n = 0;
  while (!collides(p.cells, p.x, p.y + 1)) {
    p.y += 1;
    n += 1;
  }
  state.score += n * 2;
  scoreEl.textContent = state.score;
  lockPiece();
}

function softDrop() {
  const p = state.piece;
  if (!collides(p.cells, p.x, p.y + 1)) {
    p.y += 1;
    state.score += 1;
    scoreEl.textContent = state.score;
    state.drop = 0;
  }
}

function reset() {
  Object.assign(state, { mode: "play", grid: emptyGrid(), bag: [], next: null, score: 0, lines: 0, level: 1, drop: 0, clear: null, fx: [] });
  scoreEl.textContent = "0";
  linesEl.textContent = "0";
  levelEl.textContent = "1";
  spawn();
  overlay.hide();
}

function end() {
  state.mode = "over";
  sfx.lose();
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("tetris", state.best);
    bestEl.textContent = state.best;
  }
  overlay.show({ eyebrow: record ? "Nouveau record !" : "Fin de partie", title: "Plus de place", text: "La pile a atteint le haut.", button: "Rejouer", stats: statBlock([["Score", state.score], ["Lignes", state.lines], ["Niveau", state.level]]) });
}

function update(dt) {
  if (state.mode !== "play") return;
  if (state.clear) {
    state.clear.t += dt;
    if (state.clear.t > 0.35) finishClear();
    return;
  }
  const p = state.piece;
  if (state.keys.ArrowDown || state.keys.s) {
    state.repeat -= dt;
    if (state.repeat <= 0) {
      softDrop();
      state.repeat = 0.04;
    }
  }
  state.drop += dt;
  const interval = Math.max(0.07, 0.8 - (state.level - 1) * 0.07);
  if (state.drop >= interval) {
    state.drop = 0;
    if (!collides(p.cells, p.x, p.y + 1)) p.y += 1;
  }
  if (collides(p.cells, p.x, p.y + 1)) {
    state.lock += dt;
    if (state.lock > 0.45) lockPiece();
  } else state.lock = 0;
}

function drawBlock(kind, gx, gy, alpha = 1) {
  const x = OX + gx * CELL;
  const y = OY + gy * CELL;
  g.globalAlpha = alpha;
  g.fillStyle = COLORS[kind];
  g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
  g.globalAlpha = alpha * 0.9;
  drawFace(g, state.skins[kind], x + CELL / 2, y + CELL / 2 + 1, CELL - 5);
  g.globalAlpha = 1;
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3);
}

function draw() {
  g.fillStyle = "#0e1020";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#171a30";
  g.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
  g.strokeStyle = "rgba(255,255,255,0.05)";
  for (let x = 1; x < COLS; x++) {
    g.beginPath();
    g.moveTo(OX + x * CELL, OY);
    g.lineTo(OX + x * CELL, OY + ROWS * CELL);
    g.stroke();
  }
  for (let y = 1; y < ROWS; y++) {
    g.beginPath();
    g.moveTo(OX, OY + y * CELL);
    g.lineTo(OX + COLS * CELL, OY + y * CELL);
    g.stroke();
  }
  g.strokeStyle = "#8d93c9";
  g.lineWidth = 3;
  g.strokeRect(OX - 1.5, OY - 1.5, COLS * CELL + 3, ROWS * CELL + 3);
  g.lineWidth = 1;
  state.grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (!cell) return;
      const flash = state.clear?.rows.includes(y);
      drawBlock(cell.kind, x, y, flash ? 0.4 + 0.6 * Math.abs(Math.sin(state.clear.t * 30)) : 1);
    }),
  );
  const p = state.piece;
  if (p && state.mode === "play" && !state.clear) {
    let gy = p.y;
    while (!collides(p.cells, p.x, gy + 1)) gy += 1;
    for (const [x, y] of p.cells) {
      if (gy + y >= 0) {
        g.strokeStyle = COLORS[p.kind];
        g.globalAlpha = 0.5;
        g.strokeRect(OX + (p.x + x) * CELL + 2, OY + (gy + y) * CELL + 2, CELL - 4, CELL - 4);
        g.globalAlpha = 1;
      }
    }
    for (const [x, y] of p.cells) if (p.y + y >= 0) drawBlock(p.kind, p.x + x, p.y + y);
  }
  g.fillStyle = "#9aa0d4";
  g.font = "700 18px Inter, system-ui, sans-serif";
  g.textAlign = "left";
  g.fillText("SUIVANT", 388, 80);
  if (state.next) {
    const cells = SHAPES[state.next];
    for (const [x, y] of cells) {
      const bx = 392 + x * 28;
      const by = 100 + y * 28;
      g.fillStyle = COLORS[state.next];
      g.fillRect(bx, by, 26, 26);
      drawFace(g, state.skins[state.next], bx + 13, by + 14, 22);
    }
  }
  g.fillStyle = "#6c7199";
  g.font = "600 14px Inter, system-ui, sans-serif";
  ["← → déplacer", "↑ tourner", "↓ descendre", "Espace : chute"].forEach((line, i) => g.fillText(line, 388, 560 + i * 22));
}

addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key) && state.mode === "play") event.preventDefault();
  if (event.repeat && (key === "ArrowUp" || key === " ")) return;
  state.keys[key] = true;
  if (state.mode !== "play") return;
  if (key === "ArrowLeft" || key === "q" || key === "a") move(-1);
  if (key === "ArrowRight" || key === "d") move(1);
  if (key === "ArrowUp" || key === "z" || key === "w") rotate();
  if (key === " ") hardDrop();
});
addEventListener("keyup", (event) => {
  state.keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = false;
});

let touch = null;
canvas.addEventListener("pointerdown", (event) => {
  sfx.init();
  touch = { x: event.clientX, y: event.clientY, t: performance.now(), cx: event.clientX, moved: false };
});
canvas.addEventListener("pointermove", (event) => {
  if (!touch || state.mode !== "play") return;
  const step = canvas.getBoundingClientRect().width / 14;
  while (event.clientX - touch.cx > step) {
    move(1);
    touch.cx += step;
    touch.moved = true;
  }
  while (touch.cx - event.clientX > step) {
    move(-1);
    touch.cx -= step;
    touch.moved = true;
  }
  if (event.clientY - touch.y > step * 2.2 && !touch.dropped) {
    touch.dropped = true;
    hardDrop();
  }
});
addEventListener("pointerup", () => {
  if (touch && !touch.moved && !touch.dropped && performance.now() - touch.t < 300) rotate();
  touch = null;
});

overlay.onAction(() => {
  sfx.init();
  reset();
});
overlay.show({ eyebrow: "Arcade", title: "Tétris des potes", text: "Empile les blocs, complète des lignes. Au doigt : glisse pour déplacer, touche pour tourner, glisse vers le bas pour lâcher.", button: "Jouer" });
loop(update, draw);
