import { getBest, loadHeads, pick, setBest, shuffle } from "../arcade/kit.js";

const PHOTOS = ["casque", "bouche", "tourne-mal", "grimace", "dinguerie", "gros-caca", "chapeau", "cri", "webcam", "moustache", "cri-noir", "lunettes", "concombres", "oasis", "chemise-rose", "canape", "treillis", "filtre-violet", "chaise-gamer", "portrait-mur", "nintendo", "nuit", "voiture-flou", "mouchoir", "souris", "cheveux-longs"];
const S = 480;
const COUNT = 5;
const START_TIME = 75;
const a = document.getElementById("a");
const b = document.getElementById("b");
const va = a.getContext("2d");
const vb = b.getContext("2d");
const baseA = document.createElement("canvas");
const baseB = document.createElement("canvas");
baseA.width = baseB.width = baseA.height = baseB.height = 480;
const ga = baseA.getContext("2d");
const gb = baseB.getContext("2d", { willReadFrequently: true });
const roundEl = document.getElementById("round");
const foundEl = document.getElementById("found");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const heads = await loadHeads();
const state = { round: 0, diffs: [], found: 0, time: START_TIME, tick: 0, play: false, best: getBest("erreurs"), flash: 0, order: [], marks: [], flashUntil: 0 };
bestEl.textContent = state.best;

const loadPhoto = (name) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `assets/photos/${name}.jpg`;
  });

function cover(g, image) {
  const k = Math.max(S / image.width, S / image.height);
  g.drawImage(image, (S - image.width * k) / 2, (S - image.height * k) / 2, image.width * k, image.height * k);
}

function makeDiffs() {
  const diffs = [];
  let guard = 0;
  while (diffs.length < COUNT && guard++ < 500) {
    const x = 70 + Math.random() * (S - 140);
    const y = 70 + Math.random() * (S - 140);
    if (diffs.every((d) => Math.hypot(d.x - x, d.y - y) > 120)) diffs.push({ x, y, r: 42, type: ["head", "blob", "invert", "mirror", "bar"][diffs.length % 5], done: false });
  }
  return shuffle(diffs);
}

function applyDiff(d) {
  gb.save();
  if (d.type === "head") {
    const head = pick(heads);
    const k = 84 / Math.max(head.width, head.height);
    gb.drawImage(head, d.x - (head.width * k) / 2, d.y - (head.height * k) / 2, head.width * k, head.height * k);
  } else if (d.type === "blob") {
    gb.fillStyle = pick(["rgba(255,60,90,0.85)", "rgba(60,200,120,0.85)", "rgba(250,210,40,0.9)", "rgba(80,120,255,0.85)"]);
    gb.beginPath();
    gb.ellipse(d.x, d.y, 34, 26, Math.random() * 3, 0, Math.PI * 2);
    gb.fill();
  } else if (d.type === "invert") {
    const r = 38;
    const img = gb.getImageData(d.x - r, d.y - r, r * 2, r * 2);
    for (let i = 0; i < img.data.length; i += 4) {
      const px = ((i / 4) % (r * 2)) - r;
      const py = Math.floor(i / 4 / (r * 2)) - r;
      if (px * px + py * py < r * r) {
        img.data[i] = 255 - img.data[i];
        img.data[i + 1] = 255 - img.data[i + 1];
        img.data[i + 2] = 255 - img.data[i + 2];
      }
    }
    gb.putImageData(img, d.x - r, d.y - r);
  } else if (d.type === "mirror") {
    const r = 40;
    gb.beginPath();
    gb.arc(d.x, d.y, r, 0, Math.PI * 2);
    gb.clip();
    gb.translate(d.x, 0);
    gb.scale(-1, 1);
    gb.translate(-d.x, 0);
    gb.drawImage(baseB, d.x - r, d.y - r, r * 2, r * 2, d.x - r, d.y - r, r * 2, r * 2);
  } else {
    gb.fillStyle = "#111";
    gb.fillRect(d.x - 38, d.y - 8, 76, 16);
    gb.fillStyle = "#fff";
    gb.fillRect(d.x - 30, d.y - 3, 60, 6);
  }
  gb.restore();
}

async function newBoard() {
  const photo = await loadPhoto(pick(PHOTOS));
  const image = photo || (await loadPhoto("casque"));
  ga.clearRect(0, 0, S, S);
  gb.clearRect(0, 0, S, S);
  cover(ga, image);
  cover(gb, image);
  state.diffs = makeDiffs();
  state.found = 0;
  state.marks = [];
  foundEl.textContent = `0/${COUNT}`;
  for (const d of state.diffs) applyDiff(d);
  render();
}

function render() {
  va.drawImage(baseA, 0, 0);
  vb.drawImage(baseB, 0, 0);
  for (const d of state.diffs) {
    if (!d.done) continue;
    ring(va, d.x, d.y, "#22c55e");
    ring(vb, d.x, d.y, "#22c55e");
  }
  if (performance.now() < state.flashUntil) {
    for (const g of [va, vb]) {
      g.fillStyle = "rgba(220,40,40,0.3)";
      g.fillRect(0, 0, S, S);
    }
  }
}

function ring(g, x, y, color) {
  g.save();
  g.strokeStyle = color;
  g.lineWidth = 5;
  g.beginPath();
  g.arc(x, y, 46, 0, Math.PI * 2);
  g.stroke();
  g.restore();
}

function click(event) {
  if (!state.play) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * S;
  const y = ((event.clientY - rect.top) / rect.height) * S;
  const hit = state.diffs.find((d) => !d.done && Math.hypot(d.x - x, d.y - y) < d.r + 10);
  if (hit) {
    hit.done = true;
    state.found += 1;
    foundEl.textContent = `${state.found}/${COUNT}`;
    render();
    statusEl.textContent = "Trouvée !";
    if (state.found === COUNT) nextRound();
  } else {
    state.time = Math.max(0, state.time - 5);
    timeEl.textContent = Math.ceil(state.time);
    statusEl.textContent = "Raté : −5 secondes";
    state.flashUntil = performance.now() + 260;
    render();
    setTimeout(render, 280);
  }
}

async function nextRound() {
  state.round += 1;
  state.time = Math.min(99, state.time + 15);
  roundEl.textContent = state.round;
  timeEl.textContent = Math.ceil(state.time);
  statusEl.textContent = "Bravo ! +15 secondes. Photo suivante…";
  state.play = false;
  await new Promise((resolve) => setTimeout(resolve, 900));
  await newBoard();
  state.play = true;
  statusEl.textContent = "Trouve les cinq différences (clique sur l'une ou l'autre photo).";
}

function finish() {
  state.play = false;
  clearInterval(state.tick);
  const score = (state.round - 1) * COUNT + state.found;
  const record = score > state.best;
  if (record) {
    state.best = score;
    setBest("erreurs", score);
    bestEl.textContent = score;
  }
  statusEl.textContent = `Temps écoulé. ${score} différences trouvées au total${record ? " : nouveau record !" : "."}`;
  startBtn.textContent = "Rejouer";
  startBtn.hidden = false;
}

for (const cv of [a, b]) cv.addEventListener("pointerdown", click);
await newBoard();
statusEl.textContent = "Appuie sur Jouer.";
startBtn.addEventListener("click", async () => {
  state.round = 1;
  state.time = START_TIME;
  roundEl.textContent = "1";
  timeEl.textContent = START_TIME;
  startBtn.hidden = true;
  await newBoard();
  state.play = true;
  statusEl.textContent = "Trouve les cinq différences (clique sur l'une ou l'autre photo).";
  clearInterval(state.tick);
  state.tick = setInterval(() => {
    if (!state.play) return;
    state.time -= 0.25;
    timeEl.textContent = Math.max(0, Math.ceil(state.time));
    if (state.time <= 0) finish();
  }, 250);
});
