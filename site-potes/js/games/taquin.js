import { createSfx, getBest, loadMemeModels, mountSoundButton, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();
const board = document.getElementById("puzzle");
const sizeSel = document.getElementById("size");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const message = document.getElementById("msg");
const state = { n: 3, tiles: [], moves: 0, start: 0, timer: 0, model: 0, started: false, done: false };

const url = (image) => {
  const square = document.createElement("canvas");
  square.width = 600;
  square.height = 600;
  const g = square.getContext("2d");
  g.fillStyle = "#e8ecf3";
  g.fillRect(0, 0, 600, 600);
  const ratio = image.width / image.height;
  const height = ratio > 1 ? 600 / ratio : 600;
  const width = height * ratio;
  g.drawImage(image, (600 - width) / 2, (600 - height) / 2, width, height);
  return square.toDataURL();
};
const showBest = () => {
  const best = getBest(`taquin-${state.n}`);
  bestEl.textContent = best ? `${best} coups` : "—";
};

function render() {
  board.innerHTML = "";
  board.style.setProperty("--n", state.n);
  const image = url(models[state.model % models.length]);
  state.tiles.forEach((value, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tq";
    if (value === 0) {
      tile.classList.add("empty");
      tile.disabled = true;
    } else {
      const row = Math.floor((value - 1) / state.n);
      const col = (value - 1) % state.n;
      tile.style.backgroundImage = `url(${image})`;
      tile.style.backgroundSize = `${state.n * 100}% ${state.n * 100}%`;
      tile.style.backgroundPosition = `${(col / (state.n - 1)) * 100}% ${(row / (state.n - 1)) * 100}%`;
      tile.textContent = value;
      tile.addEventListener("click", () => move(index));
    }
    board.append(tile);
  });
}

function neighborsOf(index) {
  const n = state.n;
  const r = Math.floor(index / n);
  const c = index % n;
  const out = [];
  if (r > 0) out.push(index - n);
  if (r < n - 1) out.push(index + n);
  if (c > 0) out.push(index - 1);
  if (c < n - 1) out.push(index + 1);
  return out;
}

function shuffleBoard() {
  state.tiles = [...Array(state.n * state.n).keys()].map((i) => (i + 1) % (state.n * state.n));
  let empty = state.tiles.indexOf(0);
  let previous = -1;
  for (let i = 0; i < state.n * state.n * 40; i++) {
    const options = neighborsOf(empty).filter((x) => x !== previous);
    const target = options[Math.floor(Math.random() * options.length)];
    [state.tiles[empty], state.tiles[target]] = [state.tiles[target], state.tiles[empty]];
    previous = empty;
    empty = target;
  }
}

function move(index) {
  sfx.init();
  if (state.done) return;
  const empty = state.tiles.indexOf(0);
  if (!neighborsOf(empty).includes(index)) return;
  [state.tiles[empty], state.tiles[index]] = [state.tiles[index], state.tiles[empty]];
  state.moves += 1;
  movesEl.textContent = state.moves;
  if (!state.started) {
    state.started = true;
    state.start = performance.now();
    state.timer = setInterval(() => (timeEl.textContent = Math.floor((performance.now() - state.start) / 1000)), 500);
  }
  sfx.tick();
  render();
  const solved = state.tiles.every((value, i) => value === (i + 1) % state.tiles.length);
  if (solved) {
    state.done = true;
    clearInterval(state.timer);
    sfx.win();
    const best = getBest(`taquin-${state.n}`);
    if (!best || state.moves < best) setBest(`taquin-${state.n}`, state.moves);
    showBest();
    message.textContent = `Résolu en ${state.moves} coups !`;
    message.classList.remove("hidden");
  }
}

function start() {
  clearInterval(state.timer);
  Object.assign(state, { n: Number(sizeSel.value), moves: 0, started: false, done: false });
  movesEl.textContent = "0";
  timeEl.textContent = "0";
  message.classList.add("hidden");
  shuffleBoard();
  showBest();
  render();
}

document.getElementById("shuffle").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  start();
});
document.getElementById("change").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  state.model = (state.model + 1) % models.length;
  start();
});
sizeSel.addEventListener("change", start);
start();
