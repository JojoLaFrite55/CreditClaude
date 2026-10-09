import { createSfx, loadHeads, mountSoundButton, pick, getBest, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const board = document.getElementById("board");
const status = document.getElementById("status");
const modeEl = document.getElementById("mode");
const levelEl = document.getElementById("level");
const scoreMe = document.getElementById("me");
const scoreFoe = document.getElementById("foe");
const scoreDraw = document.getElementById("draw");
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const state = { cells: Array(9).fill(null), turn: "X", over: false, me: 0, foe: 0, draw: 0, heads: { X: heads[0], O: heads[1] }, busy: false };

function skin(head) {
  const c = document.createElement("canvas");
  c.width = 120;
  c.height = 120;
  const cx = c.getContext("2d");
  const k = Math.min(110 / head.width, 110 / head.height);
  cx.drawImage(head, (120 - head.width * k) / 2, (120 - head.height * k) / 2, head.width * k, head.height * k);
  return c;
}

const winnerOf = (cells) => {
  for (const [a, b, c] of LINES) if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return { who: cells[a], line: [a, b, c] };
  return cells.every(Boolean) ? { who: "draw", line: [] } : null;
};

function minimax(cells, turn, me, depth) {
  const result = winnerOf(cells);
  if (result) return result.who === me ? 10 - depth : result.who === "draw" ? 0 : depth - 10;
  const scores = [];
  cells.forEach((v, i) => {
    if (v) return;
    cells[i] = turn;
    scores.push(minimax(cells, turn === "X" ? "O" : "X", me, depth + 1));
    cells[i] = null;
  });
  return turn === me ? Math.max(...scores) : Math.min(...scores);
}

function aiMove() {
  const free = state.cells.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  const level = levelEl.value;
  if (level === "easy" || (level === "normal" && Math.random() < 0.35)) return pick(free);
  let best = -Infinity;
  let picks = [];
  for (const i of free) {
    state.cells[i] = "O";
    const score = minimax(state.cells, "X", "O", 1);
    state.cells[i] = null;
    if (score > best) {
      best = score;
      picks = [i];
    } else if (score === best) picks.push(i);
  }
  return pick(picks);
}

function render(winLine = []) {
  board.innerHTML = "";
  state.cells.forEach((value, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ttt-cell" + (winLine.includes(i) ? " win" : "");
    button.setAttribute("aria-label", `Case ${i + 1}`);
    if (value) button.append(skin(state.heads[value]));
    button.disabled = Boolean(value) || state.over;
    button.addEventListener("click", () => play(i));
    board.append(button);
  });
}

function end(result) {
  state.over = true;
  if (result.who === "draw") {
    state.draw += 1;
    status.textContent = "Match nul.";
    sfx.tone("triangle", 330, 330, 0.2, 0.1);
  } else if (modeEl.value === "ai") {
    if (result.who === "X") {
      state.me += 1;
      status.textContent = "Tu as gagné !";
      sfx.win();
      const wins = getBest("morpion") + 1;
      setBest("morpion", wins);
    } else {
      state.foe += 1;
      status.textContent = "La machine a gagné.";
      sfx.lose();
    }
  } else {
    if (result.who === "X") state.me += 1;
    else state.foe += 1;
    status.textContent = `${result.who === "X" ? "Joueur 1" : "Joueur 2"} gagne !`;
    sfx.win();
  }
  scoreMe.textContent = state.me;
  scoreFoe.textContent = state.foe;
  scoreDraw.textContent = state.draw;
  render(result.line);
}

function play(i) {
  sfx.init();
  if (state.over || state.cells[i] || state.busy) return;
  state.cells[i] = state.turn;
  sfx.pop();
  const result = winnerOf(state.cells);
  if (result) return end(result);
  state.turn = state.turn === "X" ? "O" : "X";
  render();
  if (modeEl.value === "ai" && state.turn === "O") {
    state.busy = true;
    status.textContent = "La machine réfléchit…";
    setTimeout(() => {
      state.busy = false;
      const move = aiMove();
      state.cells[move] = "O";
      sfx.tone("triangle", 440, 440, 0.06, 0.1);
      const next = winnerOf(state.cells);
      if (next) return end(next);
      state.turn = "X";
      status.textContent = "À toi.";
      render();
    }, 450);
  } else status.textContent = state.turn === "X" ? "Au tour du joueur 1." : "Au tour du joueur 2.";
}

function restart(first = true) {
  Object.assign(state, { cells: Array(9).fill(null), turn: "X", over: false, busy: false });
  if (first) state.heads = { X: pick(heads), O: pick(heads) };
  while (state.heads.O === state.heads.X) state.heads.O = pick(heads);
  status.textContent = modeEl.value === "ai" ? "À toi de commencer." : "Au tour du joueur 1.";
  render();
}

document.getElementById("restart").addEventListener("click", () => restart(false));
document.getElementById("swap").addEventListener("click", () => restart(true));
modeEl.addEventListener("change", () => {
  Object.assign(state, { me: 0, foe: 0, draw: 0 });
  scoreMe.textContent = scoreFoe.textContent = scoreDraw.textContent = "0";
  restart(false);
});
levelEl.addEventListener("change", () => restart(false));
restart(true);
