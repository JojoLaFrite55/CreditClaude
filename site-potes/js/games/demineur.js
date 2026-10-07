import { createSfx, getBest, loadMemeModels, mountSoundButton, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();
const LEVELS = { easy: { cols: 9, rows: 9, mines: 10 }, normal: { cols: 12, rows: 12, mines: 24 }, hard: { cols: 14, rows: 14, mines: 40 } };
const COLORS = ["", "#1d4ed8", "#15803d", "#dc2626", "#6d28d9", "#b45309", "#0e7490", "#111", "#6b7280"];

const board = document.getElementById("mines");
const levelSel = document.getElementById("level");
const flagsEl = document.getElementById("flags");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const message = document.getElementById("msg");
const flagBtn = document.getElementById("flagmode");
const state = { cells: [], over: false, started: false, flagMode: false, timer: 0, start: 0, flags: 0, opened: 0, cfg: LEVELS.easy };

const bestKey = () => `demineur-${levelSel.value}`;
const showBest = () => {
  const best = getBest(bestKey());
  bestEl.textContent = best ? `${best} s` : "—";
};

const headUrl = (index) => {
  const image = models[index % models.length];
  return image instanceof HTMLCanvasElement ? image.toDataURL() : image.src;
};

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nc >= 0 && nr < state.cfg.rows && nc < state.cfg.cols) out.push(state.cells[nr][nc]);
  }
  return out;
}

function build() {
  clearInterval(state.timer);
  state.cfg = LEVELS[levelSel.value];
  Object.assign(state, { over: false, started: false, flags: 0, opened: 0 });
  message.classList.add("hidden");
  board.style.setProperty("--cols", state.cfg.cols);
  board.innerHTML = "";
  state.cells = Array.from({ length: state.cfg.rows }, (_, r) =>
    Array.from({ length: state.cfg.cols }, (_, c) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = "mcell";
      node.setAttribute("aria-label", `Case ${r + 1}-${c + 1}`);
      const cell = { r, c, node, mine: false, open: false, flag: false, count: 0 };
      let pressTimer = 0;
      let long = false;
      node.addEventListener("pointerdown", () => {
        long = false;
        pressTimer = setTimeout(() => {
          long = true;
          toggleFlag(cell);
        }, 450);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((type) => node.addEventListener(type, () => clearTimeout(pressTimer)));
      node.addEventListener("click", () => {
        if (long) return;
        state.flagMode ? toggleFlag(cell) : reveal(cell);
      });
      node.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleFlag(cell);
      });
      board.append(node);
      return cell;
    }),
  );
  flagsEl.textContent = state.cfg.mines;
  timeEl.textContent = "0";
  showBest();
}

function plant(safe) {
  const all = state.cells.flat().filter((cell) => cell !== safe && !neighbors(safe.r, safe.c).includes(cell));
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  all.slice(0, state.cfg.mines).forEach((cell) => (cell.mine = true));
  state.cells.flat().forEach((cell) => (cell.count = neighbors(cell.r, cell.c).filter((n) => n.mine).length));
  state.started = true;
  state.start = performance.now();
  state.timer = setInterval(() => (timeEl.textContent = Math.floor((performance.now() - state.start) / 1000)), 250);
}

function toggleFlag(cell) {
  if (state.over || cell.open) return;
  sfx.init();
  cell.flag = !cell.flag;
  state.flags += cell.flag ? 1 : -1;
  cell.node.classList.toggle("flag", cell.flag);
  cell.node.textContent = cell.flag ? "⚑" : "";
  flagsEl.textContent = state.cfg.mines - state.flags;
  sfx.tick();
}

function reveal(cell) {
  sfx.init();
  if (state.over || cell.open || cell.flag) return;
  if (!state.started) plant(cell);
  if (cell.mine) return lose(cell);
  const stack = [cell];
  while (stack.length) {
    const current = stack.pop();
    if (current.open || current.flag) continue;
    current.open = true;
    state.opened += 1;
    current.node.classList.add("open");
    if (current.count) {
      current.node.textContent = current.count;
      current.node.style.color = COLORS[current.count];
    } else stack.push(...neighbors(current.r, current.c));
  }
  sfx.click();
  if (state.opened === state.cfg.rows * state.cfg.cols - state.cfg.mines) win();
}

function end() {
  state.over = true;
  clearInterval(state.timer);
}

function lose(hit) {
  end();
  sfx.hit();
  state.cells.flat().filter((cell) => cell.mine).forEach((cell, i) => {
    cell.node.classList.add("mine");
    cell.node.textContent = "";
    cell.node.style.backgroundImage = `url(${headUrl(i)})`;
  });
  hit.node.classList.add("boom");
  message.textContent = "Boum ! Tu as réveillé une tête.";
  message.classList.remove("hidden");
}

function win() {
  end();
  sfx.win();
  const time = Math.max(1, Math.round((performance.now() - state.start) / 1000));
  const best = getBest(bestKey());
  if (!best || time < best) setBest(bestKey(), time);
  showBest();
  message.textContent = `Gagné en ${time} s !`;
  message.classList.remove("hidden");
}

document.getElementById("restart").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  build();
});
levelSel.addEventListener("change", build);
flagBtn.addEventListener("click", () => {
  state.flagMode = !state.flagMode;
  flagBtn.setAttribute("aria-pressed", String(state.flagMode));
  flagBtn.textContent = state.flagMode ? "Mode drapeau : oui" : "Mode drapeau : non";
});
build();
