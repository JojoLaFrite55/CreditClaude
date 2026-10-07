import { createSfx, drawFace, loadMemeModels, mountSoundButton, pick, pointer, setupCanvas } from "../arcade/kit.js";

const COLS = 7;
const ROWS = 6;
const CELL = 86;
const W = COLS * CELL + 40;
const H = ROWS * CELL + 110;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = (await loadMemeModels()).slice(0, 9);
const statusEl = document.getElementById("status");
const modeSel = document.getElementById("mode");
const levelSel = document.getElementById("level");

const state = { board: [], turn: 1, over: false, winCells: [], falling: null, heads: [models[0], models[1]], hover: 3, thinking: false, wins: [0, 0] };

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const dropRow = (board, col) => {
  for (let r = ROWS - 1; r >= 0; r--) if (!board[r][col]) return r;
  return -1;
};

function lines(board, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        const cells = [];
        for (let k = 0; k < 4; k++) cells.push([r + dr * k, c + dc * k]);
        if (cells.every(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === player)) return cells;
      }
    }
  }
  return null;
}

function scoreWindow(window, me) {
  const mine = window.filter((v) => v === me).length;
  const other = window.filter((v) => v === 3 - me).length;
  const empty = window.filter((v) => !v).length;
  if (mine === 4) return 1000;
  if (mine === 3 && empty === 1) return 6;
  if (mine === 2 && empty === 2) return 2;
  if (other === 3 && empty === 1) return -8;
  return 0;
}

function evaluate(board, me) {
  let score = 0;
  for (let r = 0; r < ROWS; r++) if (board[r][3] === me) score += 3;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        const window = [];
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) break;
          window.push(board[rr][cc]);
        }
        if (window.length === 4) score += scoreWindow(window, me);
      }
    }
  }
  return score;
}

const order = [3, 2, 4, 1, 5, 0, 6];

function negamax(board, depth, alpha, beta, player, me) {
  if (lines(board, 3 - player)) return player === me ? -100000 - depth : 100000 + depth;
  const moves = order.filter((c) => dropRow(board, c) >= 0);
  if (!moves.length) return 0;
  if (depth === 0) return (player === me ? 1 : -1) * 0 + evaluate(board, me) - evaluate(board, 3 - me);
  if (player === me) {
    let best = -Infinity;
    for (const c of moves) {
      const r = dropRow(board, c);
      board[r][c] = player;
      best = Math.max(best, negamax(board, depth - 1, alpha, beta, 3 - player, me));
      board[r][c] = 0;
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const c of moves) {
    const r = dropRow(board, c);
    board[r][c] = player;
    best = Math.min(best, negamax(board, depth - 1, alpha, beta, 3 - player, me));
    board[r][c] = 0;
    beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

function aiMove() {
  const level = levelSel.value;
  const moves = order.filter((c) => dropRow(state.board, c) >= 0);
  const depth = level === "easy" ? 1 : level === "normal" ? 3 : 6;
  if (level === "easy" && Math.random() < 0.35) return pick(moves);
  let bestScore = -Infinity;
  let best = [];
  for (const c of moves) {
    const r = dropRow(state.board, c);
    state.board[r][c] = 2;
    const score = negamax(state.board, depth, -Infinity, Infinity, 1, 2) + (level === "easy" ? Math.random() * 3 : 0);
    state.board[r][c] = 0;
    if (score > bestScore + 0.001) {
      bestScore = score;
      best = [c];
    } else if (Math.abs(score - bestScore) <= 0.001) best.push(c);
  }
  return pick(best);
}

function reset() {
  Object.assign(state, { board: emptyBoard(), turn: 1, over: false, winCells: [], falling: null, thinking: false });
  updateStatus();
}

function updateStatus() {
  const vs = modeSel.value === "ai";
  if (state.over) return;
  statusEl.textContent = state.turn === 1 ? "À toi de jouer (tête 1)" : vs ? "L'IA réfléchit…" : "Au tour du joueur 2";
}

function play(col) {
  sfx.init();
  if (state.over || state.falling || state.thinking) return;
  const r = dropRow(state.board, col);
  if (r < 0) {
    sfx.tone("square", 180, 120, 0.1, 0.1);
    return;
  }
  state.falling = { col, row: r, y: -CELL, player: state.turn, vy: 0 };
}

function land() {
  const { col, row, player } = state.falling;
  state.board[row][col] = player;
  state.falling = null;
  sfx.tone("sine", 220, 90, 0.12, 0.35);
  const win = lines(state.board, player);
  if (win) {
    state.over = true;
    state.winCells = win;
    state.wins[player - 1] += 1;
    document.getElementById("score1").textContent = state.wins[0];
    document.getElementById("score2").textContent = state.wins[1];
    const vs = modeSel.value === "ai";
    statusEl.textContent = player === 1 ? "Victoire de la tête 1 !" : vs ? "L'IA gagne cette fois…" : "Victoire de la tête 2 !";
    player === 1 || !vs ? sfx.win() : sfx.lose();
    return;
  }
  if (!state.board[0].some((v) => !v)) {
    state.over = true;
    statusEl.textContent = "Match nul";
    return;
  }
  state.turn = 3 - player;
  updateStatus();
  if (state.turn === 2 && modeSel.value === "ai") {
    state.thinking = true;
    setTimeout(() => {
      const col2 = aiMove();
      state.thinking = false;
      play(col2);
    }, 350);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.falling) {
    const f = state.falling;
    f.vy += 2600 * dt;
    f.y += f.vy * dt;
    const target = 90 + f.row * CELL;
    if (f.y >= target) {
      f.y = target;
      land();
    }
  }
  draw(now / 1000);
  requestAnimationFrame(frame);
}

function pieceAt(player, x, y, size) {
  g.fillStyle = player === 1 ? "#f4c542" : "#e9556a";
  g.beginPath();
  g.arc(x, y, size / 2, 0, Math.PI * 2);
  g.fill();
  g.save();
  g.beginPath();
  g.arc(x, y, size / 2 - 3, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = "#fff";
  g.fillRect(x - size / 2, y - size / 2, size, size);
  drawFace(g, state.heads[player - 1], x, y + 2, size + 6);
  g.restore();
}

function draw(time) {
  g.fillStyle = "#0e1a2e";
  g.fillRect(0, 0, W, H);
  const ox = 20;
  const oy = 90;
  if (!state.over && !state.falling && !state.thinking) {
    const x = ox + state.hover * CELL + CELL / 2;
    pieceAt(state.turn, x, 44 + Math.sin(time * 5) * 3, CELL - 14);
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = state.board[r][c];
      if (v) pieceAt(v, ox + c * CELL + CELL / 2, oy + r * CELL + CELL / 2, CELL - 14);
    }
  }
  if (state.falling) pieceAt(state.falling.player, ox + state.falling.col * CELL + CELL / 2, state.falling.y + CELL / 2, CELL - 14);
  g.fillStyle = "#1f56d6";
  g.beginPath();
  g.rect(ox - 8, oy - 6, COLS * CELL + 16, ROWS * CELL + 14);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      g.moveTo(ox + c * CELL + CELL / 2 + (CELL - 14) / 2, oy + r * CELL + CELL / 2);
      g.arc(ox + c * CELL + CELL / 2, oy + r * CELL + CELL / 2, (CELL - 14) / 2, 0, Math.PI * 2, true);
    }
  }
  g.fill("evenodd");
  for (const [r, c] of state.winCells) {
    g.strokeStyle = `rgba(255,255,255,${0.6 + Math.sin(time * 8) * 0.4})`;
    g.lineWidth = 6;
    g.beginPath();
    g.arc(ox + c * CELL + CELL / 2, oy + r * CELL + CELL / 2, (CELL - 14) / 2 + 3, 0, Math.PI * 2);
    g.stroke();
  }
}

canvas.addEventListener("pointermove", (event) => {
  const p = pointer(event, canvas, W, H);
  state.hover = Math.max(0, Math.min(COLS - 1, Math.floor((p.x - 20) / CELL)));
});
canvas.addEventListener("pointerdown", (event) => {
  const p = pointer(event, canvas, W, H);
  state.hover = Math.max(0, Math.min(COLS - 1, Math.floor((p.x - 20) / CELL)));
  if (state.turn === 1 || modeSel.value === "two") play(state.hover);
});
addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") state.hover = Math.max(0, state.hover - 1);
  else if (event.key === "ArrowRight") state.hover = Math.min(COLS - 1, state.hover + 1);
  else if (event.key === " " || event.key === "Enter") {
    if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    if (state.turn === 1 || modeSel.value === "two") play(state.hover);
  }
});

document.getElementById("restart").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  reset();
});
document.getElementById("swap").addEventListener("click", () => {
  sfx.init();
  sfx.pop();
  state.heads = [pick(models), pick(models)];
  if (state.heads[0] === state.heads[1]) state.heads[1] = models[(models.indexOf(state.heads[0]) + 1) % models.length];
});
modeSel.addEventListener("change", reset);
levelSel.addEventListener("change", reset);
reset();
requestAnimationFrame(frame);
