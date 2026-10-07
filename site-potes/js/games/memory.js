import { createSfx, getBest, loadMemeModels, mountSoundButton, setBest, shuffle } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();

const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const result = document.getElementById("result");
const levels = { easy: { pairs: 6, cols: 4 }, normal: { pairs: 8, cols: 4 }, hard: { pairs: 10, cols: 5 } };
const select = document.getElementById("level");

const state = { level: "normal", first: null, lock: false, moves: 0, matched: 0, started: 0, timer: null };

function cardFace(image) {
  const element = document.createElement(image instanceof HTMLCanvasElement ? "canvas" : "img");
  if (image instanceof HTMLCanvasElement) {
    element.width = image.width;
    element.height = image.height;
    element.getContext("2d").drawImage(image, 0, 0);
  } else {
    element.src = image.src;
    element.alt = "";
  }
  return element;
}

function setup() {
  clearInterval(state.timer);
  state.level = select.value;
  const { pairs, cols } = levels[state.level];
  const deck = shuffle([...shuffle(models).slice(0, pairs).flatMap((image, id) => [{ image, id }, { image, id }])]);
  board.style.setProperty("--cols", cols);
  board.innerHTML = "";
  Object.assign(state, { first: null, lock: false, moves: 0, matched: 0, started: 0, total: pairs });
  movesEl.textContent = "0";
  timeEl.textContent = "0";
  bestEl.textContent = getBest(`memory-${state.level}`) ? `${getBest(`memory-${state.level}`)} coups` : "—";
  result.classList.add("hidden");
  deck.forEach((entry) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "mem-card";
    card.dataset.id = entry.id;
    card.setAttribute("aria-label", "Carte face cachée");
    const inner = document.createElement("span");
    inner.className = "mem-inner";
    const back = document.createElement("span");
    back.className = "mem-back";
    back.textContent = "QG";
    const front = document.createElement("span");
    front.className = "mem-front";
    front.append(cardFace(entry.image));
    inner.append(back, front);
    card.append(inner);
    card.addEventListener("click", () => flip(card));
    board.append(card);
  });
}

function flip(card) {
  sfx.init();
  if (state.lock || card.classList.contains("flipped") || card.classList.contains("done")) return;
  if (!state.started) {
    state.started = Date.now();
    state.timer = setInterval(() => (timeEl.textContent = Math.floor((Date.now() - state.started) / 1000)), 250);
  }
  card.classList.add("flipped");
  sfx.pop();
  if (!state.first) {
    state.first = card;
    return;
  }
  state.moves += 1;
  movesEl.textContent = state.moves;
  const first = state.first;
  state.first = null;
  if (first.dataset.id === card.dataset.id) {
    first.classList.add("done");
    card.classList.add("done");
    state.matched += 1;
    sfx.coin();
    if (state.matched === state.total) win();
    return;
  }
  state.lock = true;
  setTimeout(() => {
    first.classList.remove("flipped");
    card.classList.remove("flipped");
    state.lock = false;
  }, 750);
}

function win() {
  clearInterval(state.timer);
  const seconds = Math.floor((Date.now() - state.started) / 1000);
  const key = `memory-${state.level}`;
  const best = getBest(key);
  const record = !best || state.moves < best;
  if (record) setBest(key, state.moves);
  sfx.win();
  result.innerHTML = `<strong>${record ? "Nouveau record !" : "Bien joué !"}</strong> ${state.moves} coups en ${seconds} s.`;
  result.classList.remove("hidden");
  bestEl.textContent = `${getBest(key)} coups`;
}

select.addEventListener("change", setup);
document.getElementById("restart").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  setup();
});
setup();
