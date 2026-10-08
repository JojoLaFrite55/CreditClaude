import { SONGS } from "../rhythm/songs.js";
import { getBest, setBest, shuffle } from "../arcade/kit.js";

const ROUNDS = 12;
const CLIP = 5;
const POOL = SONGS.filter((song) => !["filtre-muet", "non"].includes(song.id));
const optsEl = document.getElementById("opts");
const roundEl = document.getElementById("round");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const listen = document.getElementById("listen");
const disc = listen.parentElement;
const state = { round: 0, score: 0, streak: 0, good: 0, deck: [], current: null, locked: true, plays: 0, audio: null, timer: 0, best: getBest("blindtest"), t0: 0 };
bestEl.textContent = state.best;

const probe = document.createElement("audio");
const useMp4 = probe.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== "";

function stopAudio() {
  clearTimeout(state.timer);
  state.audio?.pause();
  disc.classList.remove("playing");
}

function play() {
  if (!state.current) return;
  stopAudio();
  const song = state.current;
  const audio = new Audio(useMp4 ? song.mp4 : song.webm);
  audio.preload = "auto";
  state.audio = audio;
  const go = () => {
    const length = Number.isFinite(audio.duration) ? audio.duration : 10;
    const start = state.start ?? Math.max(0, Math.random() * Math.max(0.1, length - CLIP - 0.5));
    state.start = start;
    audio.currentTime = start;
    audio.play().then(() => {
      disc.classList.add("playing");
      state.timer = setTimeout(stopAudio, CLIP * 1000);
    }).catch(() => {
      statusEl.textContent = "Le navigateur bloque le son : clique encore sur ▶.";
    });
  };
  if (audio.readyState >= 1) go();
  else audio.addEventListener("loadedmetadata", go, { once: true });
  state.plays += 1;
}

function options(correct) {
  const wrong = shuffle(POOL.filter((song) => song.id !== correct.id)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

function nextRound() {
  if (state.round >= ROUNDS || !state.deck.length) return finish();
  state.round += 1;
  roundEl.textContent = `${state.round}/${ROUNDS}`;
  state.current = state.deck.pop();
  state.start = undefined;
  state.plays = 0;
  state.locked = false;
  state.t0 = performance.now();
  optsEl.innerHTML = "";
  for (const song of options(state.current)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zq-opt";
    button.textContent = song.title;
    button.dataset.id = song.id;
    button.addEventListener("click", () => answer(song, button));
    optsEl.append(button);
  }
  statusEl.textContent = "Clique sur ▶ pour écouter l'extrait.";
}

function answer(song, button) {
  if (state.locked) return;
  state.locked = true;
  stopAudio();
  for (const b of optsEl.children) {
    b.disabled = true;
    if (b.dataset.id === state.current.id) b.classList.add("good");
  }
  if (song.id === state.current.id) {
    state.streak += 1;
    state.good += 1;
    const gain = Math.max(40, 150 - state.plays * 20 + Math.min(state.streak, 6) * 15);
    state.score += gain;
    statusEl.textContent = `Bonne réponse ! +${gain}`;
  } else {
    state.streak = 0;
    button.classList.add("bad");
    statusEl.textContent = `Raté : c'était « ${state.current.title} ».`;
  }
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  setTimeout(nextRound, 1500);
}

function finish() {
  stopAudio();
  const record = state.score > state.best;
  if (record) {
    state.best = state.score;
    setBest("blindtest", state.best);
    bestEl.textContent = state.best;
  }
  optsEl.innerHTML = "";
  statusEl.textContent = `${state.good}/${ROUNDS} bonnes réponses, ${state.score} points${record ? " : nouveau record !" : "."}`;
  startBtn.textContent = "Rejouer";
  startBtn.hidden = false;
  state.current = null;
}

listen.addEventListener("click", play);
startBtn.addEventListener("click", () => {
  Object.assign(state, { round: 0, score: 0, streak: 0, good: 0, deck: shuffle(POOL).slice(0, ROUNDS) });
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  startBtn.hidden = true;
  nextRound();
});
