import { createOverlay, createSfx, drawFace, getBest, loadHeads, loop, mountSoundButton, pick, setBest, setupCanvas, statBlock } from "../arcade/kit.js";

const W = 960;
const H = 600;
const N = 8;
const REEL_W = 220;
const CELL = 150;
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, W, H);
const sfx = createSfx();
const overlay = createOverlay(document.getElementById("ov"));
mountSoundButton(document.getElementById("sound"), sfx);
const creditsEl = document.getElementById("credits");
const betEl = document.getElementById("bet");
const bestEl = document.getElementById("best");
const spinBtn = document.getElementById("spin");
const heads = await loadHeads();
const faces = heads.slice(0, 6);
const SYMBOLS = [...faces.map((head, i) => ({ head, id: i, mult: 12 })), { id: 6, gem: true, mult: 40 }];
const strip = [0, 6, 1, 2, 3, 4, 5, 2];
const BETS = [5, 10, 25, 50, 100];

const state = { mode: "ready", credits: 200, bet: 10, reels: [0, 1, 2].map((i) => ({ pos: i * 3, spinning: false, anim: null })), msg: "", msgT: 0, best: Math.max(200, getBest("slots")), win: 0, spins: 0, flash: 0 };
creditsEl.textContent = state.credits;
bestEl.textContent = state.best;

const symAt = (index) => strip[((index % N) + N) % N];

function setCredits(value) {
  state.credits = value;
  creditsEl.textContent = value;
  if (value > state.best) {
    state.best = value;
    setBest("slots", value);
    bestEl.textContent = value;
  }
}

function pickResult() {
  const roll = Math.random();
  if (roll < 0.05) return [1, 1, 1];
  if (roll < 0.08) return Array(3).fill(Math.floor(Math.random() * N));
  if (roll < 0.3) {
    const k = Math.floor(Math.random() * N);
    return Math.random() < 0.5 ? [k, k, Math.floor(Math.random() * N)] : [Math.floor(Math.random() * N), k, k];
  }
  return [0, 1, 2].map(() => Math.floor(Math.random() * N));
}

function spin() {
  sfx.init();
  if (state.mode === "spin") return;
  if (state.mode === "broke") return;
  if (state.credits < state.bet) {
    state.msg = "Pas assez de jetons";
    state.msgT = 1.5;
    sfx.tone("sawtooth", 160, 100, 0.2, 0.1);
    return;
  }
  setCredits(state.credits - state.bet);
  state.mode = "spin";
  state.win = 0;
  state.msg = "";
  state.spins += 1;
  const result = pickResult();
  state.reels.forEach((reel, i) => {
    reel.spinning = true;
    reel.anim = null;
    reel.stopAt = 0.9 + i * 0.55;
    reel.t = 0;
    reel.result = result[i];
  });
  sfx.tone("triangle", 200, 500, 0.5, 0.08);
}

function settle() {
  const [a, b, c] = state.reels.map((reel) => symAt(reel.result));
  let gain = 0;
  let label = "";
  if (a === b && b === c) {
    const sym = a === 6 ? 40 : 12;
    gain = state.bet * sym;
    label = a === 6 ? "JACKPOT DIAMANT !" : "TROIS IDENTIQUES !";
  } else if (a === b || b === c) {
    gain = state.bet * 2;
    label = "Deux côte à côte";
  }
  state.mode = "ready";
  if (gain) {
    state.win = gain;
    setCredits(state.credits + gain);
    state.msg = `${label} +${gain}`;
    state.msgT = 3;
    state.flash = 1;
    sfx.win();
  } else {
    state.msg = "Perdu";
    state.msgT = 1.2;
    sfx.tone("triangle", 220, 180, 0.2, 0.1);
  }
  if (state.credits < BETS[0]) {
    state.mode = "broke";
    overlay.show({ eyebrow: "Faillite", title: "Plus un jeton", text: "La maison gagne toujours. Heureusement, ce n'est pas du vrai argent.", button: "Repartir à 200", stats: statBlock([["Tours joués", state.spins], ["Record de jetons", state.best]]) });
  }
}

function update(dt) {
  state.msgT = Math.max(0, state.msgT - dt);
  state.flash = Math.max(0, state.flash - dt * 1.4);
  if (state.mode !== "spin") return;
  let allDone = true;
  for (const reel of state.reels) {
    if (reel.spinning) {
      reel.t += dt;
      if (reel.anim) {
        reel.anim.t += dt;
        const k = Math.min(1, reel.anim.t / 0.55);
        reel.pos = reel.anim.from + (reel.anim.to - reel.anim.from) * (1 - Math.pow(1 - k, 3));
        if (k >= 1) {
          reel.spinning = false;
          reel.pos = reel.anim.to;
          sfx.tone("square", 340, 260, 0.06, 0.1);
        }
      } else {
        reel.pos += dt * 18;
        if (reel.t >= reel.stopAt) {
          const base = Math.ceil(reel.pos) + N * 1;
          let target = base;
          while (((target % N) + N) % N !== reel.result) target += 1;
          reel.anim = { from: reel.pos, to: target, t: 0 };
        }
      }
    }
    if (reel.spinning) allDone = false;
  }
  if (allDone) settle();
}

function drawSymbol(id, cx, cy, size) {
  const sym = SYMBOLS[id];
  if (sym.gem) {
    g.save();
    g.translate(cx, cy);
    g.fillStyle = "#5ee3ff";
    g.beginPath();
    g.moveTo(0, -size * 0.45);
    g.lineTo(size * 0.4, -size * 0.1);
    g.lineTo(0, size * 0.45);
    g.lineTo(-size * 0.4, -size * 0.1);
    g.closePath();
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.beginPath();
    g.moveTo(0, -size * 0.45);
    g.lineTo(-size * 0.4, -size * 0.1);
    g.lineTo(-size * 0.08, -size * 0.05);
    g.closePath();
    g.fill();
    g.restore();
    return;
  }
  drawFace(g, sym.head, cx, cy, size * 0.82);
}

function draw() {
  g.fillStyle = "#3a0d1c";
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 520);
  glow.addColorStop(0, `rgba(255,200,80,${0.25 + state.flash * 0.45})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#1a0710";
  g.beginPath();
  g.roundRect(50, 70, W - 100, 330, 28);
  g.fill();
  g.strokeStyle = "#ffcf5a";
  g.lineWidth = 6;
  g.stroke();
  const startX = (W - REEL_W * 3 - 20) / 2;
  state.reels.forEach((reel, i) => {
    const x = startX + i * (REEL_W + 10);
    g.save();
    g.beginPath();
    g.rect(x, 90, REEL_W, 290);
    g.clip();
    g.fillStyle = "#fffaf0";
    g.fillRect(x, 90, REEL_W, 290);
    const base = Math.floor(reel.pos);
    for (let i = base - 2; i <= base + 3; i++) drawSymbol(symAt(i), x + REEL_W / 2, 235 + (reel.pos - i) * CELL, CELL - 10);
    const shade = g.createLinearGradient(0, 90, 0, 380);
    shade.addColorStop(0, "rgba(0,0,0,0.45)");
    shade.addColorStop(0.3, "rgba(0,0,0,0)");
    shade.addColorStop(0.7, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.45)");
    g.fillStyle = shade;
    g.fillRect(x, 90, REEL_W, 290);
    g.restore();
  });
  g.strokeStyle = "rgba(255,60,60,0.8)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(startX - 20, 235);
  g.lineTo(startX + REEL_W * 3 + 40, 235);
  g.stroke();
  g.textAlign = "center";
  g.font = "800 34px Inter, system-ui, sans-serif";
  g.fillStyle = state.win ? "#ffe45e" : "#fff";
  if (state.msgT > 0) g.fillText(state.msg, W / 2, 450);
  g.font = "600 17px Inter, system-ui, sans-serif";
  g.fillStyle = "rgba(255,255,255,0.7)";
  g.fillText("3 têtes : ×12 · 3 diamants : ×40 · 2 côte à côte : ×2", W / 2, 520);
  g.fillText("Espace pour lancer", W / 2, 550);
}

spinBtn.addEventListener("click", spin);
document.getElementById("plus").addEventListener("click", () => {
  const i = BETS.indexOf(state.bet);
  state.bet = BETS[Math.min(BETS.length - 1, i + 1)];
  betEl.textContent = state.bet;
  sfx.click();
});
document.getElementById("minus").addEventListener("click", () => {
  const i = BETS.indexOf(state.bet);
  state.bet = BETS[Math.max(0, i - 1)];
  betEl.textContent = state.bet;
  sfx.click();
});
canvas.addEventListener("pointerdown", spin);
addEventListener("keydown", (event) => {
  if (event.key === " ") {
    event.preventDefault();
    if (!document.getElementById("ov").classList.contains("hidden")) return;
    spin();
  }
});
overlay.onAction(() => {
  sfx.init();
  overlay.hide();
  if (state.mode === "broke") {
    state.mode = "ready";
    setCredits(200);
    state.spins = 0;
  }
});
overlay.show({ eyebrow: "Casino", title: "Machine à sous", text: "Tu pars avec 200 jetons. Trois têtes identiques, c'est le gros lot. Aucun vrai argent.", button: "Jouer" });
loop(update, draw);
