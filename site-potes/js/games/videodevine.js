import { SONGS, MICRO_SONG } from "../rhythm/songs.js";
import { getBest, setBest, shuffle } from "../arcade/kit.js";

const ROUNDS = 10;
const STEPS = [48, 28, 16, 9, 5, 2];
const STEP_MS = 1700;
const POOL = [...SONGS, MICRO_SONG].filter((song) => !["filtre-muet"].includes(song.id));
const cv = document.getElementById("frame");
const g = cv.getContext("2d");
const optsEl = document.getElementById("opts");
const roundEl = document.getElementById("round");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const video = document.createElement("video");
video.muted = true;
video.playsInline = true;
video.preload = "auto";
const useMp4 = video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== "";
const state = { round: 0, score: 0, streak: 0, good: 0, deck: [], answer: null, step: 0, t0: 0, raf: 0, locked: true, best: getBest("videodevine"), buttons: [], ready: false };
bestEl.textContent = state.best;
const small = document.createElement("canvas");
const sg = small.getContext("2d");

function drawPixel(block) {
  const vw = video.videoWidth || 480;
  const vh = video.videoHeight || 480;
  const k = Math.max(480 / vw, 480 / vh);
  const w = vw * k;
  const h = vh * k;
  const sw = Math.max(2, Math.round(480 / block));
  small.width = sw;
  small.height = sw;
  sg.imageSmoothingEnabled = true;
  sg.drawImage(video, (480 - w) / 2 / (480 / sw), (480 - h) / 2 / (480 / sw), w / (480 / sw), h / (480 / sw));
  g.imageSmoothingEnabled = block <= 2;
  g.drawImage(small, 0, 0, 480, 480);
}

function load(song) {
  return new Promise((resolve) => {
    state.ready = false;
    video.src = useMp4 ? song.mp4 : song.webm;
    const onMeta = () => {
      const dur = Number.isFinite(video.duration) ? video.duration : 5;
      video.currentTime = 0.4 + Math.random() * Math.max(0.2, dur - 0.9);
    };
    video.addEventListener("loadedmetadata", onMeta, { once: true });
    video.addEventListener("seeked", () => resolve(), { once: true });
    video.addEventListener("error", () => resolve(), { once: true });
  });
}

function thumbOpts(correct) {
  const wrong = shuffle(POOL.filter((song) => song.id !== correct.id)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

async function nextRound() {
  if (state.round >= ROUNDS || !state.deck.length) return finish();
  state.round += 1;
  roundEl.textContent = `${state.round}/${ROUNDS}`;
  state.answer = state.deck.pop();
  state.locked = true;
  statusEl.textContent = "Chargement de l'image…";
  optsEl.innerHTML = "";
  await load(state.answer);
  state.buttons = [];
  for (const song of thumbOpts(state.answer)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zq-opt";
    button.textContent = song.title;
    button.dataset.id = song.id;
    button.addEventListener("click", () => answer(song, button));
    optsEl.append(button);
    state.buttons.push(button);
  }
  state.locked = false;
  state.step = 0;
  state.t0 = performance.now();
  statusEl.textContent = "L'image se précise… trouve la vidéo.";
  const tick = () => {
    if (state.locked) return;
    const elapsed = performance.now() - state.t0;
    const step = Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_MS));
    if (step !== state.step || elapsed < 50) state.step = step;
    drawPixel(STEPS[state.step]);
    timerEl.style.transform = `scaleX(${Math.max(0, 1 - elapsed / (STEP_MS * STEPS.length))})`;
    if (elapsed > STEP_MS * STEPS.length + 1500) return answer(null, null);
    state.raf = requestAnimationFrame(tick);
  };
  tick();
}

function answer(song, button) {
  if (state.locked) return;
  state.locked = true;
  cancelAnimationFrame(state.raf);
  const elapsed = performance.now() - state.t0;
  const step = Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_MS));
  for (const b of state.buttons) {
    b.disabled = true;
    if (b.dataset.id === state.answer.id) b.classList.add("good");
  }
  drawPixel(1);
  if (song && song.id === state.answer.id) {
    state.streak += 1;
    state.good += 1;
    const gain = 60 + (STEPS.length - 1 - step) * 40 + Math.min(state.streak, 6) * 15;
    state.score += gain;
    statusEl.textContent = `Bien joué ! +${gain}`;
  } else {
    state.streak = 0;
    button?.classList.add("bad");
    statusEl.textContent = song ? `Raté : c'était « ${state.answer.title} ».` : `Trop lent : c'était « ${state.answer.title} ».`;
  }
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  setTimeout(nextRound, 1500);
}

function finish() {
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("videodevine", state.best);
    bestEl.textContent = state.best;
  }
  optsEl.innerHTML = "";
  g.fillStyle = "#e9edf2";
  g.fillRect(0, 0, 480, 480);
  g.fillStyle = "#111";
  g.textAlign = "center";
  g.font = "800 54px Inter, system-ui, sans-serif";
  g.fillText(`${state.good}/${ROUNDS}`, 240, 230);
  g.font = "600 24px Inter, system-ui, sans-serif";
  g.fillText(`${state.score} points`, 240, 280);
  statusEl.textContent = record ? "Nouveau record !" : "Partie terminée.";
  startBtn.textContent = "Rejouer";
  startBtn.hidden = false;
  timerEl.style.transform = "scaleX(0)";
}

g.fillStyle = "#e9edf2";
g.fillRect(0, 0, 480, 480);
g.fillStyle = "#6b7280";
g.textAlign = "center";
g.font = "700 28px Inter, system-ui, sans-serif";
g.fillText("Une image apparaîtra ici", 240, 240);
startBtn.addEventListener("click", () => {
  Object.assign(state, { round: 0, score: 0, streak: 0, good: 0, deck: shuffle(POOL).slice(0, ROUNDS) });
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  startBtn.hidden = true;
  nextRound();
});
