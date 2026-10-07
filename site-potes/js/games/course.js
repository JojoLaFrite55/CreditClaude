import { createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, setBest, setupCanvas, shuffle } from "../arcade/kit.js";

const W = 960;
const H = 520;
const LANES = 6;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const moneyEl = document.getElementById("money");
const bestEl = document.getElementById("best");
const betBox = document.getElementById("bets");
const stakeInput = document.getElementById("stake");
const goBtn = document.getElementById("go");
const log = document.getElementById("log");
const MONEY_KEY = "qg-race-money";

let money = 100;
try {
  money = Number(localStorage.getItem(MONEY_KEY)) || 100;
} catch {
  money = 100;
}
let best = getBest("course");
bestEl.textContent = best;

const state = { mode: "bet", runners: [], pick: 0, stake: 10, time: 0, ranking: [], crowd: Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * 22, c: pick(["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#e9c46a"]) })) };

const NAMES = ["Éclair", "Tornade", "Fusée", "Bolide", "Comète", "Turbo", "Flèche", "Météore", "Caramel", "Pépite"];

function setup() {
  const picks = shuffle(heads).slice(0, LANES);
  const names = shuffle(NAMES).slice(0, LANES);
  const strengths = picks.map(() => 0.9 + Math.random() * 0.22);
  const order = [...strengths].sort((a, b) => b - a);
  state.runners = picks.map((head, i) => ({ head, name: names[i], strength: strengths[i], x: 60, speed: 0, odds: Math.round((1.6 + order.indexOf(strengths[i]) * 1.5 + Math.random() * 0.4) * 10) / 10, finished: false, wobble: Math.random() * 6 }));
  state.mode = "bet";
  state.time = 0;
  state.ranking = [];
  renderBets();
  moneyEl.textContent = money;
}

function renderBets() {
  betBox.innerHTML = "";
  state.runners.forEach((runner, i) => {
    const label = document.createElement("label");
    label.className = "bet";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "runner";
    input.checked = i === state.pick;
    input.addEventListener("change", () => (state.pick = i));
    const text = document.createElement("span");
    text.innerHTML = `<strong>${i + 1}. ${runner.name}</strong><em>cote x${runner.odds.toFixed(1).replace(".", ",")}</em>`;
    label.append(input, text);
    betBox.append(label);
  });
}

function persist() {
  try {
    localStorage.setItem(MONEY_KEY, String(money));
  } catch {
    return;
  }
}

function go() {
  sfx.init();
  if (state.mode === "run") return;
  if (state.mode === "result") {
    setup();
    goBtn.textContent = "Lancer la course";
    return;
  }
  const stake = Math.max(1, Math.min(money, Math.floor(Number(stakeInput.value) || 0)));
  if (money < 1) {
    money = 100;
    persist();
    moneyEl.textContent = money;
    log.textContent = "Le comité te prête 100 $ : tu repars de zéro.";
    return;
  }
  state.stake = stake;
  stakeInput.value = stake;
  state.mode = "run";
  state.time = 0;
  goBtn.disabled = true;
  log.textContent = "Et c'est parti !";
  sfx.tone("square", 880, 880, 0.15, 0.12);
  sfx.tone("square", 1320, 1320, 0.35, 0.12, 0.2);
}

function finish() {
  state.mode = "result";
  const winner = state.ranking[0];
  const mine = state.runners[state.pick];
  const won = winner === mine;
  if (won) {
    const gain = Math.round(state.stake * mine.odds);
    money += gain - state.stake;
    log.innerHTML = `<strong>${winner.name} gagne !</strong> Tu empoches ${gain} $ (mise ${state.stake} $).`;
    sfx.win();
  } else {
    money -= state.stake;
    log.innerHTML = `<strong>${winner.name} gagne.</strong> Ton ${mine.name} finit ${state.ranking.indexOf(mine) + 1}ᵉ : tu perds ${state.stake} $.`;
    sfx.lose();
  }
  if (money > best) {
    best = money;
    setBest("course", best);
    bestEl.textContent = best;
  }
  persist();
  moneyEl.textContent = money;
  goBtn.disabled = false;
  goBtn.textContent = "Nouvelle course";
}

function update(dt) {
  state.time += dt;
  if (state.mode !== "run") return;
  const finish2 = W - 90;
  for (const runner of state.runners) {
    if (runner.finished) continue;
    const surge = 1 + Math.sin(state.time * 3 + runner.wobble) * 0.25 + (Math.random() - 0.5) * 0.5;
    runner.speed = 72 * runner.strength * Math.max(0.3, surge);
    runner.x += runner.speed * dt;
    if (runner.x >= finish2) {
      runner.finished = true;
      runner.x = finish2;
      state.ranking.push(runner);
      sfx.tone("triangle", 660, 990, 0.12, 0.12);
    }
  }
  if (state.ranking.length === state.runners.length) finish();
  else if (Math.random() < 0.05) sfx.tick();
}

function draw() {
  g.fillStyle = "#2f7d32";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#1f5a24";
  const laneH = (H - 70) / LANES;
  for (let i = 0; i < LANES; i++) {
    g.fillStyle = i % 2 ? "#3a8a3f" : "#33803a";
    g.fillRect(0, 50 + i * laneH, W, laneH);
  }
  g.fillStyle = "#ececec";
  g.fillRect(0, 0, W, 50);
  for (const person of state.crowd) {
    g.fillStyle = person.c;
    g.beginPath();
    g.arc(person.x, 18 + person.y * 0.6 + Math.sin(state.time * 6 + person.x) * (state.mode === "run" ? 2 : 0), 6, 0, Math.PI * 2);
    g.fill();
  }
  const finishX = W - 70;
  for (let y = 50; y < H - 20; y += 16) {
    g.fillStyle = (y / 16) % 2 ? "#111" : "#fff";
    g.fillRect(finishX, y, 8, 16);
    g.fillStyle = (y / 16) % 2 ? "#fff" : "#111";
    g.fillRect(finishX + 8, y, 8, 16);
  }
  g.fillStyle = "#fff";
  g.font = '700 14px "Inter", sans-serif';
  g.textAlign = "left";
  state.runners.forEach((runner, i) => {
    const y = 50 + i * laneH + laneH / 2;
    const bounce = state.mode === "run" && !runner.finished ? Math.sin(state.time * 18 + i) * 3 : 0;
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.beginPath();
    g.ellipse(runner.x, y + laneH * 0.32, 24, 6, 0, 0, Math.PI * 2);
    g.fill();
    drawFace(g, runner.head, runner.x, y - 2 + bounce, laneH * 0.9, Math.sin(state.time * 12 + i) * (state.mode === "run" && !runner.finished ? 0.12 : 0));
    g.fillStyle = i === state.pick ? "#ffd54a" : "#fff";
    g.fillText(`${i + 1}`, 14, y + 5);
  });
  g.fillStyle = "rgba(0,0,0,0.65)";
  g.font = '700 22px "Inter", sans-serif';
  g.textAlign = "center";
  if (state.mode === "bet") {
    g.fillText("Choisis ton favori, mise, et lance la course", W / 2, 33);
  } else if (state.mode === "run") {
    g.fillText("Course en cours…", W / 2, 33);
  } else if (state.ranking.length) {
    g.fillText(`Vainqueur : ${state.ranking[0].name}`, W / 2, 33);
  }
}

goBtn.addEventListener("click", go);
document.getElementById("allin").addEventListener("click", () => {
  stakeInput.value = money;
  sfx.init();
  sfx.click();
});
setup();
loop(update, draw);
