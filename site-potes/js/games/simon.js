import { createSfx, getBest, loadMemeModels, mountSoundButton, pick, setBest } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();
const FREQ = [262, 330, 392, 523];
const pads = [...document.querySelectorAll(".spad")];
const roundEl = document.getElementById("round");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const state = { seq: [], input: 0, busy: false, playing: false };
bestEl.textContent = getBest("simon");

pads.forEach((pad, i) => {
  const image = models[i % models.length];
  const img = document.createElement(image instanceof HTMLCanvasElement ? "canvas" : "img");
  if (image instanceof HTMLCanvasElement) {
    img.width = image.width;
    img.height = image.height;
    img.getContext("2d").drawImage(image, 0, 0);
  } else {
    img.src = image.src;
    img.alt = "";
  }
  pad.append(img);
  pad.addEventListener("click", () => press(i));
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function flash(i, ms = 380) {
  pads[i].classList.add("lit");
  sfx.tone("triangle", FREQ[i], FREQ[i], ms / 1000, 0.25);
  await wait(ms);
  pads[i].classList.remove("lit");
  await wait(120);
}

async function playback() {
  state.busy = true;
  statusEl.textContent = "Regarde bien…";
  await wait(500);
  const speed = Math.max(170, 380 - state.seq.length * 12);
  for (const i of state.seq) await flash(i, speed);
  state.input = 0;
  state.busy = false;
  statusEl.textContent = "À toi !";
}

async function nextRound() {
  state.seq.push(Math.floor(Math.random() * 4));
  roundEl.textContent = state.seq.length;
  await playback();
}

async function press(i) {
  sfx.init();
  if (!state.playing || state.busy) return;
  if (i !== state.seq[state.input]) return fail();
  state.busy = true;
  await flash(i, 220);
  state.busy = false;
  state.input += 1;
  if (state.input === state.seq.length) {
    state.busy = true;
    statusEl.textContent = "Bien joué !";
    await wait(500);
    nextRound();
  }
}

function fail() {
  state.playing = false;
  sfx.lose();
  const score = state.seq.length - 1;
  if (score > getBest("simon")) {
    setBest("simon", score);
    bestEl.textContent = score;
  }
  statusEl.textContent = `Raté ! Tu as tenu ${score} manche${score > 1 ? "s" : ""}.`;
  startBtn.textContent = "Rejouer";
  startBtn.classList.remove("hidden");
}

startBtn.addEventListener("click", () => {
  sfx.init();
  sfx.click();
  state.seq = [];
  state.playing = true;
  startBtn.classList.add("hidden");
  nextRound();
});
