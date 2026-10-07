import { createSfx, getBest, loadMemeModels, mountSoundButton, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();

const SIZE = 4;
const board = document.getElementById("grid2048");
const tilesLayer = document.getElementById("tiles");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const message = document.getElementById("message");
const state = { cells: [], score: 0, best: getBest("2048"), over: false, won: false, nextId: 1, tiles: new Map() };
bestEl.textContent = state.best;

const toNode = (image) => {
  const node = document.createElement(image instanceof HTMLCanvasElement ? "canvas" : "img");
  if (image instanceof HTMLCanvasElement) {
    node.width = image.width;
    node.height = image.height;
    node.getContext("2d").drawImage(image, 0, 0);
  } else {
    node.src = image.src;
    node.alt = "";
  }
  return node;
};

function reset() {
  state.cells = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  state.score = 0;
  state.over = false;
  state.won = false;
  tilesLayer.innerHTML = "";
  state.tiles.clear();
  scoreEl.textContent = "0";
  message.classList.add("hidden");
  addTile();
  addTile();
}

function addTile() {
  const free = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!state.cells[r][c]) free.push([r, c]);
  if (!free.length) return;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  const tile = { id: state.nextId++, value: Math.random() < 0.9 ? 2 : 4, r, c, isNew: true };
  state.cells[r][c] = tile;
  mountTile(tile);
}

function levelOf(value) {
  return Math.log2(value) - 1;
}

function mountTile(tile) {
  const node = document.createElement("div");
  node.className = "tile2048";
  node.append(toNode(models[levelOf(tile.value) % models.length]));
  const badge = document.createElement("span");
  node.append(badge);
  tilesLayer.append(node);
  state.tiles.set(tile.id, { node, badge, tile });
  place(tile, true);
}

function place(tile, appear = false) {
  const entry = state.tiles.get(tile.id);
  if (!entry) return;
  entry.node.style.setProperty("--r", tile.r);
  entry.node.style.setProperty("--c", tile.c);
  entry.node.dataset.level = Math.min(levelOf(tile.value), 10);
  entry.badge.textContent = tile.value;
  entry.node.classList.toggle("fresh", appear);
  if (!appear) {
    entry.node.classList.remove("merged");
  }
}

function slide(line) {
  const tiles = line.filter(Boolean);
  const out = [];
  let gained = 0;
  const merged = [];
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i + 1] && tiles[i].value === tiles[i + 1].value) {
      merged.push({ keep: tiles[i], drop: tiles[i + 1] });
      gained += tiles[i].value * 2;
      out.push(tiles[i]);
      i += 1;
    } else out.push(tiles[i]);
  }
  while (out.length < SIZE) out.push(null);
  return { out, gained, merged };
}

function move(dir) {
  if (state.over) return;
  let moved = false;
  let gained = 0;
  const merges = [];
  const next = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (let i = 0; i < SIZE; i++) {
    const line = [];
    for (let j = 0; j < SIZE; j++) {
      const [r, c] = dir === "left" ? [i, j] : dir === "right" ? [i, SIZE - 1 - j] : dir === "up" ? [j, i] : [SIZE - 1 - j, i];
      line.push(state.cells[r][c]);
    }
    const result = slide(line);
    gained += result.gained;
    merges.push(...result.merged);
    result.out.forEach((tile, j) => {
      const [r, c] = dir === "left" ? [i, j] : dir === "right" ? [i, SIZE - 1 - j] : dir === "up" ? [j, i] : [SIZE - 1 - j, i];
      next[r][c] = tile;
      if (tile && (tile.r !== r || tile.c !== c)) moved = true;
      if (tile) {
        tile.r = r;
        tile.c = c;
      }
    });
  }
  if (merges.length) moved = true;
  if (!moved) return;
  for (const { keep, drop } of merges) {
    const target = state.tiles.get(drop.id);
    drop.r = keep.r;
    drop.c = keep.c;
    if (target) {
      place(drop);
      setTimeout(() => {
        target.node.remove();
        state.tiles.delete(drop.id);
      }, 130);
    }
    keep.value *= 2;
    if (keep.value === 2048 && !state.won) {
      state.won = true;
      showMessage("2048 atteint ! Tu peux continuer.");
      sfx.win();
    }
  }
  state.cells = next;
  state.cells.flat().filter(Boolean).forEach((tile) => place(tile));
  for (const { keep } of merges) {
    const entry = state.tiles.get(keep.id);
    entry?.node.classList.add("merged");
  }
  state.score += gained;
  scoreEl.textContent = state.score;
  if (gained) sfx.coin();
  else sfx.tick();
  if (state.score > state.best) {
    state.best = state.score;
    setBest("2048", state.best);
    bestEl.textContent = state.best;
  }
  setTimeout(() => {
    addTile();
    if (!canMove()) {
      state.over = true;
      showMessage(`Partie terminée : ${state.score} points.`);
      sfx.lose();
    }
  }, 120);
}

function canMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = state.cells[r][c];
      if (!tile) return true;
      if (state.cells[r][c + 1]?.value === tile.value || state.cells[r + 1]?.[c]?.value === tile.value) return true;
    }
  }
  return false;
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

addEventListener("keydown", (event) => {
  const map = { arrowleft: "left", q: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", z: "up", w: "up", arrowdown: "down", s: "down" };
  const dir = map[event.key.toLowerCase()];
  if (!dir) return;
  event.preventDefault();
  sfx.init();
  move(dir);
});

let start = null;
board.addEventListener("pointerdown", (event) => {
  start = { x: event.clientX, y: event.clientY };
});
board.addEventListener("pointerup", (event) => {
  if (!start) return;
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  start = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
  sfx.init();
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
  else move(dy > 0 ? "down" : "up");
});

document.getElementById("restart").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  reset();
});
reset();
