import { createSfx, getBest, loadHeads, mountSoundButton, pick, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const qEl = document.getElementById("question");
const input = document.getElementById("answer");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const status = document.getElementById("status");
const startBtn = document.getElementById("start");
const levelEl = document.getElementById("level");
const face = document.getElementById("face");
const ROUND = 45;
const state = { running: false, score: 0, time: ROUND, streak: 0, answer: 0, timer: 0, good: 0, bad: 0, best: getBest("calcul") };
bestEl.textContent = state.best;

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function question() {
  const level = levelEl.value;
  const hard = level === "hard";
  const mid = level === "normal";
  const kind = rnd(0, hard ? 3 : mid ? 2 : 1);
  let text;
  if (kind === 0) {
    const a = rnd(mid || hard ? 12 : 3, hard ? 99 : mid ? 60 : 20);
    const b = rnd(mid || hard ? 12 : 3, hard ? 99 : mid ? 60 : 20);
    state.answer = a + b;
    text = `${a} + ${b}`;
  } else if (kind === 1) {
    const a = rnd(mid || hard ? 30 : 8, hard ? 150 : mid ? 90 : 30);
    const b = rnd(2, Math.min(a, hard ? 90 : mid ? 50 : 20));
    state.answer = a - b;
    text = `${a} − ${b}`;
  } else if (kind === 2) {
    const a = rnd(2, hard ? 15 : 12);
    const b = rnd(2, hard ? 15 : 9);
    state.answer = a * b;
    text = `${a} × ${b}`;
  } else {
    const b = rnd(3, 12);
    const r = rnd(3, 15);
    state.answer = r;
    text = `${b * r} ÷ ${b}`;
  }
  qEl.textContent = text;
  input.value = "";
}

function setFace() {
  face.innerHTML = "";
  const head = pick(heads);
  const c = document.createElement("canvas");
  c.width = 120;
  c.height = 120;
  const cx = c.getContext("2d");
  const k = Math.min(110 / head.width, 110 / head.height);
  cx.drawImage(head, (120 - head.width * k) / 2, (120 - head.height * k) / 2, head.width * k, head.height * k);
  face.append(c);
}

function finish() {
  state.running = false;
  clearInterval(state.timer);
  input.disabled = true;
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("calcul", state.best);
    bestEl.textContent = state.best;
  }
  qEl.textContent = `${state.good} bonnes réponses`;
  status.textContent = `${state.score} points, ${state.bad} erreurs${record ? " : nouveau record !" : "."}`;
  startBtn.hidden = false;
  startBtn.textContent = "Rejouer";
  sfx.win();
}

function check() {
  if (!state.running || input.value.trim() === "") return;
  const v = Number(input.value.replace(",", "."));
  if (v === state.answer) {
    state.streak += 1;
    state.good += 1;
    state.score += 10 + Math.min(state.streak, 10) * 2;
    status.textContent = "Juste !";
    sfx.coin();
    face.classList.remove("shake");
    setFace();
  } else {
    state.streak = 0;
    state.bad += 1;
    state.score = Math.max(0, state.score - 5);
    state.time = Math.max(0, state.time - 2);
    status.textContent = `Raté : ${state.answer}`;
    sfx.hit();
    face.classList.add("shake");
  }
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  question();
}

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") check();
});
document.getElementById("ok").addEventListener("click", check);
startBtn.addEventListener("click", () => {
  sfx.init();
  Object.assign(state, { running: true, score: 0, time: ROUND, streak: 0, good: 0, bad: 0 });
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  timeEl.textContent = ROUND;
  input.disabled = false;
  startBtn.hidden = true;
  status.textContent = "Tape la réponse puis Entrée.";
  setFace();
  question();
  input.focus();
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.time -= 0.25;
    timeEl.textContent = Math.max(0, Math.ceil(state.time));
    if (state.time <= 0) finish();
  }, 250);
});
input.disabled = true;
setFace();
