import { createDrone, openHell } from "./enfer.js";
import { drawGoat, POSES } from "./gore/goat.js";
import { drawKnife, KNIFE } from "./gore/knife.js";
import { bloodStrokeLayers, drawBlob, splat, streak } from "./gore/blood.js";
import { fbm, makeFloor, makeWall, rand } from "./gore/noise.js";

const $ = (id) => document.getElementById(id);
const gate = $("gate");
const hint = $("hint");
const stage = $("stage");
const fx = $("fx");
const bloodBar = $("blood");
const progressBar = $("progress");
const pentMeter = $("pent-meter");
const finaleText = $("finale-text");
const scene = $("scene");
const sg = stage.getContext("2d");
const fg = fx.getContext("2d");

const W = 760;
const H = 760;
const FLOOR_Y = 500;
const HITS_NEEDED = 7;
const HIT_LINES = ["Elle hurle.", "Encore.", "Le sol est tout rouge.", "Ne t'arrête pas.", "Elle ne bouge presque plus.", "Un dernier coup."];
const S = 0.92;
const GX = 380 - 455 * S;
const GY = FLOOR_Y + 20 - 564 * S;
const CX = 380;
const CY = 380;
const R = 262;

const state = { stage: "gate", hits: 0, reserve: 0, drawing: false, last: null, filled: 0, drone: null, ctx: null, noise: null, squelchAt: 0, time: 0, shake: 0, jerk: 0, fade: 0, fadeDir: 0, poolR: 0, poolTarget: 0, collapseT: 0, finaleT: 0, pulse: 0 };
const assets = {};
const particles = [];
const drips = [];
const fall = [];
const knife = { phase: "idle", t: 0, target: [0, 0], theta: 0.4, bloody: false };
let alphaData = null;
let soakDirty = true;
const fxParticles = [];
const stains = [];
const fxDrips = [];
let flash = 0;
let blackout = 0;

const verts = Array.from({ length: 5 }, (_, k) => {
  const a = -Math.PI / 2 + (k * Math.PI * 2) / 5;
  return [CX + Math.cos(a) * R, CY + Math.sin(a) * R];
});
const starOrder = [0, 2, 4, 1, 3, 0];
const segments = starOrder.slice(0, -1).map((v, i) => [verts[v], verts[starOrder[i + 1]]]);
const samples = [];
for (let i = 0; i < 180; i++) {
  const a = (i / 180) * Math.PI * 2;
  samples.push({ x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R, on: false });
}
for (const [[ax, ay], [bx, by]] of segments) for (let i = 0; i <= 60; i++) samples.push({ x: ax + ((bx - ax) * i) / 60, y: ay + ((by - ay) * i) / 60, on: false });
const pathLength = Math.PI * 2 * R + segments.reduce((sum, [[ax, ay], [bx, by]]) => sum + Math.hypot(bx - ax, by - ay), 0);

function resizeFx() {
  fx.width = innerWidth;
  fx.height = innerHeight;
}
resizeFx();
addEventListener("resize", resizeFx);

const mk = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

function noiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

const audio = {
  noise(duration, volume, type, freq, q = 1) {
    const ctx = state.ctx;
    if (!ctx) return;
    const source = ctx.createBufferSource();
    source.buffer = state.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration + 0.05);
  },
  tone(type, from, to, duration, volume, delay = 0) {
    const ctx = state.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  },
  swoosh() {
    this.noise(0.18, 0.25, "bandpass", 1800, 1.4);
  },
  stab() {
    this.noise(0.14, 0.85, "bandpass", 900, 2);
    this.noise(0.3, 0.6, "lowpass", 380);
    this.tone("sine", 120, 36, 0.28, 0.9);
    this.noise(0.5, 0.18, "highpass", 2600, 0.8);
  },
  pull() {
    this.noise(0.22, 0.4, "bandpass", 500, 3);
  },
  bleat(step) {
    const ctx = state.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const base = 520 - step * 38;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.linearRampToValueAtTime(base * 0.62, t + 0.6);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 38;
    const depth = ctx.createGain();
    depth.gain.value = 55;
    lfo.connect(depth).connect(osc.frequency);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 950;
    filter.Q.value = 4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.7);
    lfo.stop(t + 0.7);
  },
  thud() {
    this.noise(0.4, 0.9, "lowpass", 300);
    this.tone("sine", 90, 28, 0.5, 1);
  },
  squelch() {
    this.noise(0.09, 0.12, "bandpass", 700 + Math.random() * 500, 3);
  },
  boom() {
    this.tone("sine", 70, 22, 2.2, 1);
    this.noise(1.8, 0.8, "lowpass", 260);
  },
  shriek() {
    for (const [from, to, shift] of [[260, 2600, 1], [277, 2750, 1.04], [130, 1500, 1.5]]) this.tone("sawtooth", from * shift, to * shift, 2.6, 0.09);
    this.noise(2.4, 0.18, "highpass", 3200, 0.7);
  },
};

async function buildAssets() {
  const yieldFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  assets.floor = makeFloor(W, H - FLOOR_Y + 120);
  await yieldFrame();
  assets.wall = makeWall(W, FLOOR_Y + 10);
  await yieldFrame();
  assets.stand = drawGoat(POSES.standing);
  await yieldFrame();
  assets.dead = drawGoat(POSES.dead);
  await yieldFrame();
  assets.knife = drawKnife(false);
  assets.knifeBloody = drawKnife(true);
  assets.floorOver = makeFloor(W, H);
  assets.blood = mk(W, H);
  assets.overBlood = mk(W, H);
  assets.soak = mk(900, 640);
  assets.soakMaskedStand = mk(900, 640);
  assets.soakMaskedDead = mk(900, 640);
  assets.paint = mk(W, H);
  assets.paintMid = mk(W, H);
  assets.paintCore = mk(W, H);
  assets.paintHi = mk(W, H);
  assets.paintGlow = mk(W, H);
  assets.guide = mk(W, H);
  assets.light = mk(W, H);
  const mask = assets.stand.getContext("2d").getImageData(0, 0, 900, 640);
  alphaData = mask.data;
  await yieldFrame();
}

function hitMask(lx, ly) {
  const x = Math.round(lx);
  const y = Math.round(ly);
  if (x < 0 || y < 0 || x >= 900 || y >= 640) return false;
  return alphaData[(y * 900 + x) * 4 + 3] > 60;
}

const toSprite = (x, y) => [(x - GX) / S, (y - GY) / S];

function refreshSoak() {
  for (const [target, sprite, dx] of [[assets.soakMaskedStand, assets.stand, 0], [assets.soakMaskedDead, assets.dead, 30]]) {
    const g = target.getContext("2d");
    g.clearRect(0, 0, 900, 640);
    g.globalCompositeOperation = "source-over";
    g.drawImage(assets.soak, dx, 0);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(sprite, 0, 0);
    g.globalCompositeOperation = "source-over";
  }
  soakDirty = false;
}

function addWound(lx, ly) {
  const s = assets.soak.getContext("2d");
  const soak = s.createRadialGradient(lx, ly, 2, lx, ly, 70 + Math.random() * 25);
  soak.addColorStop(0, "rgba(60,0,0,0.82)");
  soak.addColorStop(0.5, "rgba(80,0,0,0.5)");
  soak.addColorStop(1, "rgba(80,0,0,0)");
  s.fillStyle = soak;
  s.fillRect(lx - 120, ly - 120, 240, 240);
  const seed = (Math.random() * 1e6) | 0;
  drawBlob(s, lx, ly, 15 + Math.random() * 8, seed, { squash: 0.75, wet: 1 });
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) drips.push({ x: lx + (Math.random() - 0.5) * 34, y: ly + 6, max: 70 + Math.random() * 170, len: 0, speed: 26 + Math.random() * 60, w: 3 + Math.random() * 4 });
  soakDirty = true;
}

function startStab(x, y) {
  if (state.stage !== "kill" || knife.phase !== "idle") return;
  const [lx, ly] = toSprite(x, y);
  if (!hitMask(lx, ly)) {
    audio.tone("sawtooth", 300, 120, 0.08, 0.05);
    return;
  }
  Object.assign(knife, { phase: "in", t: 0, target: [x, y], local: [lx, ly], theta: 0.28 + Math.random() * 0.42, bloody: state.hits > 0 });
  audio.swoosh();
}

function impact() {
  state.hits += 1;
  const [x, y] = knife.target;
  addWound(...knife.local);
  state.shake = 1;
  state.jerk = 1;
  state.poolTarget = 38 + state.hits * 26;
  state.reserve = state.hits / HITS_NEEDED;
  bloodBar.style.width = `${state.reserve * 100}%`;
  const u = Math.atan2(-Math.cos(knife.theta), Math.sin(knife.theta));
  for (let i = 0; i < 70; i++) {
    const a = u + (Math.random() - 0.5) * 2.4;
    const speed = 160 + Math.random() * 620;
    particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 120, size: 1.5 + Math.random() * 4.2, life: 1.4, age: 0 });
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.random() * Math.PI * 2;
    splat(assets.blood.getContext("2d"), x + Math.cos(a) * 120, FLOOR_Y + 30 + Math.random() * 190, 3 + Math.random() * 7, (Math.random() * 1e6) | 0, { drops: 4 });
  }
  audio.stab();
  setTimeout(() => audio.bleat(state.hits), 80);
  if (state.hits >= HITS_NEEDED) hint.textContent = "Elle ne bouge plus.";
  else hint.textContent = `${HIT_LINES[state.hits - 1]} (${state.hits}/${HITS_NEEDED})`;
}

const easeOut = (t) => 1 - (1 - t) * (1 - t);

function updateKnife(dt) {
  if (knife.phase === "in") {
    knife.t += dt / 0.17;
    if (knife.t >= 1) {
      knife.t = 0;
      knife.phase = "stuck";
      impact();
    }
  } else if (knife.phase === "stuck") {
    knife.t += dt / (state.hits >= HITS_NEEDED ? 1.0 : 0.55);
    if (knife.t >= 1 && state.stage === "kill") {
      if (state.hits >= HITS_NEEDED) startCollapse();
      else {
        knife.phase = "out";
        knife.t = 0;
        audio.pull();
      }
    }
  } else if (knife.phase === "out") {
    knife.t += dt / 0.3;
    if (knife.t >= 1) knife.phase = "idle";
  }
}

function drawKnifeAnim(g) {
  if (knife.phase === "idle") return;
  const sprite = knife.bloody || knife.phase !== "in" ? assets.knifeBloody : assets.knife;
  let tipY;
  if (knife.phase === "in") tipY = -340 * (1 - knife.t) * (1 - knife.t);
  else if (knife.phase === "stuck") tipY = Math.min(1, knife.t * 6) * 34;
  else tipY = 34 - 420 * easeOut(knife.t);
  g.save();
  g.translate(knife.target[0], knife.target[1]);
  g.rotate(knife.theta);
  g.beginPath();
  g.rect(-300, -1500, 600, 1500);
  g.clip();
  g.scale(0.74, 0.74);
  g.drawImage(sprite, -KNIFE.tipX, tipY - KNIFE.tipY);
  g.restore();
  if (knife.phase !== "in") {
    g.save();
    g.translate(knife.target[0], knife.target[1]);
    g.rotate(knife.theta);
    const lip = g.createRadialGradient(0, 0, 2, 0, 0, 24);
    lip.addColorStop(0, "rgba(40,0,0,0.95)");
    lip.addColorStop(0.7, "rgba(110,6,6,0.85)");
    lip.addColorStop(1, "rgba(110,6,6,0)");
    g.fillStyle = lip;
    g.beginPath();
    g.ellipse(0, 0, 26, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
}

function startCollapse() {
  state.stage = "collapse";
  state.collapseT = 0;
  audio.bleat(8);
  setTimeout(() => audio.thud(), 900);
}

function startCut() {
  state.stage = "cut";
  state.fadeDir = 1;
}

function buildOverhead() {
  const og = assets.overBlood.getContext("2d");
  og.clearRect(0, 0, W, H);
  const rnd = rand(11);
  drawBlob(og, CX + 10, CY + 40, 190, 21, { squash: 0.9 });
  drawBlob(og, CX - 80, CY + 60, 130, 22, { squash: 0.8 });
  drawBlob(og, CX + 120, CY + 10, 110, 23, { squash: 0.85 });
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 150 + rnd() * 210;
    splat(og, CX + Math.cos(a) * d, CY + Math.sin(a) * d, 3 + rnd() * 10, 500 + i, { drops: 5, directional: a });
  }
  const g = assets.guide.getContext("2d");
  g.clearRect(0, 0, W, H);
  const groove = (draw) => {
    g.save();
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "rgba(0,0,0,0.9)";
    g.lineWidth = 11;
    draw();
    g.strokeStyle = "rgba(70,12,10,0.95)";
    g.lineWidth = 6;
    draw();
    g.strokeStyle = "rgba(150,30,20,0.35)";
    g.lineWidth = 1.6;
    draw();
    g.restore();
  };
  groove(() => {
    g.beginPath();
    g.arc(CX, CY, R, 0, Math.PI * 2);
    g.stroke();
  });
  groove(() => {
    g.beginPath();
    starOrder.forEach((v, i) => (i ? g.lineTo(...verts[v]) : g.moveTo(...verts[v])));
    g.stroke();
  });
  g.save();
  g.strokeStyle = "rgba(70,12,10,0.8)";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(CX, CY, R + 46, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(CX, CY, R + 18, 0, Math.PI * 2);
  g.stroke();
  g.restore();
  const glyphs = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ☿♀♂♃♄☉☽⛧";
  g.font = "700 22px serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const total = 44;
  for (let i = 0; i < total; i++) {
    const a = (i / total) * Math.PI * 2;
    const ch = glyphs[Math.floor(rnd() * glyphs.length)];
    g.save();
    g.translate(CX + Math.cos(a) * (R + 32), CY + Math.sin(a) * (R + 32));
    g.rotate(a + Math.PI / 2);
    g.fillStyle = "rgba(0,0,0,0.9)";
    g.fillText(ch, 1, 1);
    g.fillStyle = "rgba(120,24,18,0.9)";
    g.fillText(ch, 0, 0);
    g.restore();
  }
  for (const [vx, vy] of verts) {
    g.save();
    g.strokeStyle = "rgba(100,20,16,0.9)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(vx, vy, 26, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
}

function startOverhead() {
  buildOverhead();
  state.stage = "draw";
  pentMeter.classList.remove("hidden");
  state.reserve = 1;
  bloodBar.style.width = "100%";
  hint.textContent = "Il reste son sang. Trace le pentagramme sans t'arrêter.";
  state.fadeDir = -1;
}

function candlesOverhead() {
  return verts.map(([x, y]) => ({ x, y }));
}

function lightOverlay(g, candles, t, strength) {
  const lg = assets.light.getContext("2d");
  lg.globalCompositeOperation = "source-over";
  lg.clearRect(0, 0, W, H);
  lg.fillStyle = `rgba(0,0,0,${strength})`;
  lg.fillRect(0, 0, W, H);
  lg.globalCompositeOperation = "destination-out";
  for (const [i, c] of candles.entries()) {
    const flick = 0.85 + Math.sin(t * 9 + i * 2.1) * 0.08 + Math.sin(t * 23 + i) * 0.05 + (Math.random() - 0.5) * 0.04;
    const rr = c.r * flick;
    const grad = lg.createRadialGradient(c.x, c.y, 4, c.x, c.y, rr);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.45, "rgba(0,0,0,0.7)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    lg.fillStyle = grad;
    lg.fillRect(c.x - rr, c.y - rr, rr * 2, rr * 2);
  }
  lg.globalCompositeOperation = "source-over";
  g.drawImage(assets.light, 0, 0);
  g.save();
  g.globalCompositeOperation = "lighter";
  for (const [i, c] of candles.entries()) {
    const flick = 0.85 + Math.sin(t * 9 + i * 2.1) * 0.08 + Math.sin(t * 23 + i) * 0.05;
    const rr = c.r * 0.55 * flick;
    const warm = g.createRadialGradient(c.x, c.y, 2, c.x, c.y, rr);
    warm.addColorStop(0, "rgba(255,150,60,0.28)");
    warm.addColorStop(1, "rgba(255,90,20,0)");
    g.fillStyle = warm;
    g.fillRect(c.x - rr, c.y - rr, rr * 2, rr * 2);
  }
  g.restore();
}

function flame(g, x, y, scale, t, seed) {
  g.save();
  g.translate(x, y);
  const sway = Math.sin(t * 11 + seed) * 2.5 * scale + Math.sin(t * 29 + seed * 3) * 1.2 * scale;
  const h = (26 + Math.sin(t * 17 + seed) * 4) * scale;
  const grad = g.createRadialGradient(0, -h * 0.35, 1, 0, -h * 0.35, h * 0.7);
  grad.addColorStop(0, "rgba(255,255,230,1)");
  grad.addColorStop(0.35, "rgba(255,200,80,0.95)");
  grad.addColorStop(1, "rgba(255,70,0,0)");
  g.globalCompositeOperation = "lighter";
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(-9 * scale, -h * 0.3, -6 * scale + sway * 0.4, -h * 0.75, sway, -h);
  g.bezierCurveTo(6 * scale + sway * 0.4, -h * 0.75, 9 * scale, -h * 0.3, 0, 0);
  g.fill();
  g.restore();
}

function drawCandleSide(g, x, y, t, seed) {
  g.save();
  g.translate(x + 6, y + 4);
  g.scale(1, 0.3);
  const cs = g.createRadialGradient(0, 0, 1, 0, 0, 24);
  cs.addColorStop(0, "rgba(0,0,0,0.6)");
  cs.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = cs;
  g.beginPath();
  g.arc(0, 0, 24, 0, Math.PI * 2);
  g.fill();
  g.restore();
  const wax = g.createLinearGradient(x - 14, 0, x + 14, 0);
  wax.addColorStop(0, "#9b8a68");
  wax.addColorStop(0.5, "#e8dcc0");
  wax.addColorStop(1, "#7c6c4c");
  g.fillStyle = wax;
  g.beginPath();
  g.roundRect(x - 14, y - 70, 28, 70, 5);
  g.fill();
  g.fillStyle = "rgba(255,248,226,0.9)";
  g.beginPath();
  g.ellipse(x, y - 70, 14, 4, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1a120a";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, y - 70);
  g.lineTo(x, y - 78);
  g.stroke();
  flame(g, x, y - 78, 1, t, seed);
}

function drawCandleTop(g, x, y, t, seed, scale = 1) {
  g.save();
  const ts = g.createRadialGradient(x + 5, y + 6, 2, x + 5, y + 6, 22);
  ts.addColorStop(0, "rgba(0,0,0,0.65)");
  ts.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = ts;
  g.beginPath();
  g.arc(x + 5, y + 6, 22, 0, Math.PI * 2);
  g.fill();
  g.restore();
  const wax = g.createRadialGradient(x - 4, y - 4, 2, x, y, 15);
  wax.addColorStop(0, "#f2e8cf");
  wax.addColorStop(1, "#8e7d58");
  g.fillStyle = wax;
  g.beginPath();
  g.arc(x, y, 14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,120,30,0.7)";
  g.beginPath();
  g.arc(x, y, 5, 0, Math.PI * 2);
  g.fill();
  flame(g, x, y + 4, 0.9 * scale, t, seed);
}

function drawKillScene(g, t) {
  const ox = (Math.random() - 0.5) * 14 * state.shake;
  const oy = (Math.random() - 0.5) * 14 * state.shake;
  g.save();
  g.translate(ox, oy);
  g.drawImage(assets.wall, 0, 0);
  const wallShade = g.createLinearGradient(0, FLOOR_Y - 120, 0, FLOOR_Y + 8);
  wallShade.addColorStop(0, "rgba(0,0,0,0)");
  wallShade.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = wallShade;
  g.fillRect(0, FLOOR_Y - 120, W, 128);
  g.drawImage(assets.floor, 0, FLOOR_Y, W, H - FLOOR_Y);
  const floorShade = g.createLinearGradient(0, FLOOR_Y, 0, H);
  floorShade.addColorStop(0, "rgba(0,0,0,0.5)");
  floorShade.addColorStop(1, "rgba(0,0,0,0.1)");
  g.fillStyle = floorShade;
  g.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  g.fillStyle = "#050302";
  g.fillRect(0, FLOOR_Y - 4, W, 8);
  g.drawImage(assets.blood, 0, 0);
  if (state.poolR > 1) {
    drawBlob(g, 380 + 10, FLOOR_Y + 38, state.poolR * 1.7, 31, { squash: 0.2 });
    drawBlob(g, 380 - 40, FLOOR_Y + 44, state.poolR * 1.0, 32, { squash: 0.2 });
  }
  drawCandleSide(g, 96, FLOOR_Y + 110, t, 1);
  drawCandleSide(g, 668, FLOOR_Y + 118, t, 2);

  g.save();
  g.translate(390, FLOOR_Y + 24);
  g.scale(1, 0.12);
  const gs = g.createRadialGradient(0, 0, 10, 0, 0, 270);
  gs.addColorStop(0, "rgba(0,0,0,0.85)");
  gs.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gs;
  g.beginPath();
  g.arc(0, 0, 270, 0, Math.PI * 2);
  g.fill();
  g.restore();

  if (soakDirty) refreshSoak();
  g.save();
  const jerk = state.jerk;
  const gx = GX + Math.sin(t * 70) * 12 * jerk;
  if (state.stage === "collapse") {
    const e = Math.min(1, state.collapseT / 1.1);
    const ease = e * e * (3 - 2 * e);
    g.translate(GX + 455 * S, GY + 564 * S);
    g.rotate(-0.1 * ease);
    g.scale(1 + 0.05 * ease, 1 - 0.14 * ease);
    g.translate(-455 * S, -564 * S);
    g.scale(S, S);
  } else {
    g.translate(gx, GY + Math.abs(Math.sin(t * 50)) * 3 * jerk);
    g.scale(S, S);
  }
  g.drawImage(assets.stand, 0, 0);
  g.drawImage(assets.soakMaskedStand, 0, 0);
  g.restore();

  for (const p of particles) {
    const sx = p.x - p.vx * 0.022;
    const sy = p.y - p.vy * 0.022;
    streak(g, sx, sy, p.x, p.y, p.size);
  }
  drawKnifeAnim(g);
  g.restore();

  const candles = [{ x: 96, y: FLOOR_Y + 32, r: 330 }, { x: 668, y: FLOOR_Y + 40, r: 330 }, { x: 380, y: 300, r: 330 }];
  lightOverlay(g, candles, t, 0.8);
}

function drawGoatOverhead(g, t) {
  g.save();
  g.translate(CX + 18, CY + 26);
  g.rotate(-0.35);
  g.scale(1, 0.55);
  const os = g.createRadialGradient(0, 0, 10, 0, 0, 175);
  os.addColorStop(0, "rgba(0,0,0,0.8)");
  os.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = os;
  g.beginPath();
  g.arc(0, 0, 175, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.save();
  g.translate(CX, CY + 6);
  g.rotate(-0.35);
  g.scale(0.4, 0.4);
  g.translate(-455, -330);
  g.drawImage(assets.dead, 0, 0);
  g.drawImage(assets.soakMaskedDead, 0, 0);
  g.restore();
}

function localToStage(x, y) {
  const pose = POSES.dead;
  const hc = Math.cos(pose.head);
  const hs = Math.sin(pose.head);
  const dx = x - 262;
  const dy = y - 236;
  let px = 262 + dx * hc - dy * hs;
  let py = 236 + dx * hs + dy * hc;
  const tc = Math.cos(pose.tilt);
  const ts = Math.sin(pose.tilt);
  const ex = px - 450;
  const ey = py - 380;
  px = 450 + ex * tc - ey * ts + 110;
  py = 380 + ex * ts + ey * tc;
  const ax = (px - 455) * 0.4;
  const ay = (py - 330) * 0.4;
  const c2 = Math.cos(-0.35);
  const s2 = Math.sin(-0.35);
  return [CX + ax * c2 - ay * s2, CY + 6 + ax * s2 + ay * c2];
}

const eyes = Array.from({ length: 16 }, (_, i) => {
  const rnd = rand(900 + i);
  const a = rnd() * Math.PI * 2;
  const d = 330 + rnd() * 90;
  return { x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d, gap: 7 + rnd() * 7, start: 0.4 + rnd() * 2.6, size: 2.2 + rnd() * 2.4 };
});

function drawOverhead(g, t) {
  g.drawImage(assets.floorOver, 0, 0);
  const vig = g.createRadialGradient(CX, CY, 120, CX, CY, 520);
  vig.addColorStop(0, "rgba(0,0,0,0.05)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  g.drawImage(assets.overBlood, 0, 0);
  const breathe = 0.55 + Math.sin(t * 2.2) * 0.25;
  g.save();
  g.globalAlpha = state.stage === "finale" ? 1 : 1;
  g.drawImage(assets.guide, 0, 0);
  g.restore();
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.18 * breathe * (1 - Math.min(1, state.filled / samples.length));
  g.strokeStyle = "#ff2a1a";
  g.lineWidth = 3;
  g.shadowColor = "#ff2a1a";
  g.shadowBlur = 14;
  g.beginPath();
  g.arc(CX, CY, R, 0, Math.PI * 2);
  starOrder.forEach((v, i) => (i ? g.lineTo(...verts[v]) : g.moveTo(...verts[v])));
  g.stroke();
  g.restore();
  g.drawImage(assets.paint, 0, 0);
  g.drawImage(assets.paintMid, 0, 0);
  g.drawImage(assets.paintCore, 0, 0);
  g.drawImage(assets.paintHi, 0, 0);
  const progress = state.filled / samples.length;
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = Math.min(1, progress * 0.45 + (state.stage === "finale" ? 0.7 + Math.sin(t * 24) * 0.2 : 0));
  g.drawImage(assets.paintGlow, 0, 0);
  g.restore();
  drawGoatOverhead(g, t);
  g.save();
  g.translate(590, 600);
  g.rotate(0.95);
  g.scale(0.5, 0.5);
  g.fillStyle = "rgba(0,0,0,0.3)";
  g.fillRect(-10, -540, 34, 540);
  g.drawImage(assets.knifeBloody, -KNIFE.tipX, -KNIFE.tipY);
  g.restore();
  const fin = state.stage === "finale" ? state.finaleT : 0;
  for (const [i, [x, y]] of verts.entries()) drawCandleTop(g, x, y, t, i + 3, 1 + fin * 0.9);
  const lights = candlesOverhead().map((c) => ({ ...c, r: 280 + fin * 200 }));
  lights.push({ x: CX, y: CY, r: 150 + fin * 260 });
  lightOverlay(g, lights, t, state.stage === "finale" ? Math.max(0.35, 0.82 - fin * 0.5) : 0.82);
  if (state.stage === "finale") {
    g.save();
    g.globalCompositeOperation = "lighter";
    const [ex, ey] = localToStage(150, 206);
    const glow = g.createRadialGradient(ex, ey, 1, ex, ey, 60 + Math.sin(t * 12) * 8);
    glow.addColorStop(0, "rgba(255,40,20,1)");
    glow.addColorStop(0.3, "rgba(255,20,10,0.6)");
    glow.addColorStop(1, "rgba(255,0,0,0)");
    g.fillStyle = glow;
    g.fillRect(ex - 90, ey - 90, 180, 180);
    for (const e of eyes) {
      const k = Math.min(1, Math.max(0, state.finaleT * 3 - e.start * 0.5));
      if (k <= 0) continue;
      const blink = Math.sin(t * 3 + e.start * 7) > 0.9 ? 0.1 : 1;
      for (const sx of [-1, 1]) {
        const eg = g.createRadialGradient(e.x + sx * e.gap, e.y, 0, e.x + sx * e.gap, e.y, e.size * 5);
        eg.addColorStop(0, `rgba(255,50,30,${k * blink})`);
        eg.addColorStop(0.3, `rgba(255,20,10,${0.5 * k * blink})`);
        eg.addColorStop(1, "rgba(255,0,0,0)");
        g.fillStyle = eg;
        g.fillRect(e.x + sx * e.gap - e.size * 5, e.y - e.size * 5, e.size * 10, e.size * 10);
      }
    }
    g.strokeStyle = `rgba(255,70,20,${0.5 * fin})`;
    g.lineWidth = 2;
    g.shadowColor = "#ff3a10";
    g.shadowBlur = 12;
    const rnd = rand(77);
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2;
      let px = CX + Math.cos(a) * (R * 0.5);
      let py = CY + Math.sin(a) * (R * 0.5);
      g.beginPath();
      g.moveTo(px, py);
      for (let k = 0; k < 8; k++) {
        px += Math.cos(a + (rnd() - 0.5) * 1.1) * 40 * fin;
        py += Math.sin(a + (rnd() - 0.5) * 1.1) * 40 * fin;
        g.lineTo(px, py);
      }
      g.stroke();
    }
    g.restore();
  }
}

function updateParticles(dt) {
  const bg = assets.blood.getContext("2d");
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age += dt;
    p.vy += 1500 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const floorHit = FLOOR_Y + 20 + (p.size * 17) % 190;
    if (p.y > floorHit && p.vy > 0) {
      if (p.size > 2.2) splat(bg, p.x, p.y, p.size * 0.9, (p.x * 7 + p.y * 13) | 0, { drops: 2, directional: Math.atan2(p.vy * 0.2, p.vx) });
      particles.splice(i, 1);
    } else if (p.age > p.life || p.x < -40 || p.x > W + 40) particles.splice(i, 1);
  }
  const s = assets.soak.getContext("2d");
  for (let i = drips.length - 1; i >= 0; i--) {
    const d = drips[i];
    const step = d.speed * dt * (1 - d.len / d.max * 0.8);
    if (d.len >= d.max) {
      drips.splice(i, 1);
      continue;
    }
    streak(s, d.x, d.y + d.len, d.x + (Math.random() - 0.5) * 0.4, d.y + d.len + step + 0.5, d.w);
    d.len += step;
    soakDirty = true;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.time += dt;
  const t = state.time;
  if (assets.blood && (state.stage === "kill" || state.stage === "collapse" || state.stage === "cut")) {
    updateKnife(dt);
    updateParticles(dt);
    state.shake = Math.max(0, state.shake - dt * 3.2);
    state.jerk = Math.max(0, state.jerk - dt * 2.4);
    state.poolR += (state.poolTarget - state.poolR) * Math.min(1, dt * 2.2);
    if (state.stage === "collapse") {
      state.collapseT += dt;
      if (state.collapseT > 2.2) startCut();
    }
    if (state.stage === "cut") {
      state.fade += dt / 0.8;
      if (state.fade >= 1) {
        state.fade = 1;
        startOverhead();
      }
    }
    drawKillScene(sg, t);
  } else if (assets.blood && (state.stage === "draw" || state.stage === "finale")) {
    state.finaleT = state.stage === "finale" ? state.finaleT + dt / 4 : 0;
    drawOverhead(sg, t);
  } else if (assets.blood === undefined) {
    sg.fillStyle = "#000";
    sg.fillRect(0, 0, W, H);
  }
  if (state.fadeDir === -1) {
    state.fade -= dt / 1.2;
    if (state.fade <= 0) {
      state.fade = 0;
      state.fadeDir = 0;
    }
  }
  if (state.fade > 0) {
    sg.fillStyle = `rgba(0,0,0,${Math.min(1, state.fade)})`;
    sg.fillRect(0, 0, W, H);
  }

  fg.clearRect(0, 0, fx.width, fx.height);
  fg.fillStyle = "#6e0000";
  for (const s of stains) {
    fg.globalAlpha = 0.55;
    fg.beginPath();
    fg.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    fg.fill();
  }
  fg.globalAlpha = 1;
  for (const p of fxParticles) {
    p.age += dt;
    p.vy += 900 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    fg.fillStyle = p.age > p.life * 0.6 ? "#7a0000" : "#c40d0d";
    fg.globalAlpha = Math.max(0, 1 - p.age / p.life);
    fg.beginPath();
    fg.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fg.fill();
  }
  fg.globalAlpha = 1;
  for (let i = fxParticles.length - 1; i >= 0; i--) if (fxParticles[i].age > fxParticles[i].life) fxParticles.splice(i, 1);
  for (const d of fxDrips) {
    d.len = Math.min(fx.height, d.len + d.speed * dt);
    fg.fillStyle = "#8b0000";
    fg.fillRect(d.x, 0, d.w, d.len);
    fg.beginPath();
    fg.arc(d.x + d.w / 2, d.len, d.w * 0.8, 0, Math.PI * 2);
    fg.fill();
  }
  if (flash > 0) {
    fg.fillStyle = `rgba(255, 0, 0, ${flash})`;
    fg.fillRect(0, 0, fx.width, fx.height);
    flash = Math.max(0, flash - dt * 0.8);
  }
  if (blackout > 0) {
    fg.fillStyle = `rgba(0, 0, 0, ${Math.min(1, blackout)})`;
    fg.fillRect(0, 0, fx.width, fx.height);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function stagePoint(event) {
  const rect = stage.getBoundingClientRect();
  return [((event.clientX - rect.left) / rect.width) * W, ((event.clientY - rect.top) / rect.height) * H];
}

async function startScene() {
  state.drone = createDrone();
  state.drone.level(0.4);
  state.ctx = state.drone.ctx;
  state.noise = noiseBuffer(state.ctx);
  if (state.ctx.state === "suspended") state.ctx.resume();
  gate.classList.add("hidden");
  state.stage = "loading";
  hint.textContent = "Tes yeux s'habituent à l'obscurité…";
  await buildAssets();
  state.stage = "kill";
  hint.textContent = `Elle t'attend sur l'autel. Frappe-la. (0/${HITS_NEEDED})`;
  bloodBar.style.width = "0%";
}

$("enter").addEventListener("click", startScene);

stage.addEventListener("pointerdown", (event) => {
  const [x, y] = stagePoint(event);
  if (state.stage === "kill") startStab(x, y);
  else if (state.stage === "draw") {
    stage.setPointerCapture(event.pointerId);
    state.drawing = true;
    state.last = [x, y];
    stroke(state.last, state.last);
  }
});
stage.addEventListener("pointermove", (event) => {
  if (!state.drawing || state.stage !== "draw") return;
  const point = stagePoint(event);
  stroke(state.last, point);
  state.last = point;
});
["pointerup", "pointercancel"].forEach((type) => stage.addEventListener(type, () => (state.drawing = false)));
addEventListener("keydown", (event) => {
  if (state.stage !== "kill" || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  startStab(330 + Math.random() * 190, 250 + Math.random() * 90);
});

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

let glowTimer = 0;
function stroke(from, to) {
  const cost = Math.hypot(to[0] - from[0], to[1] - from[1]) / (pathLength * 4.5);
  state.reserve -= cost;
  if (state.reserve <= 0) {
    state.reserve = 0.4;
    hint.textContent = "Le sang ruisselle encore. Continue.";
  }
  bloodBar.style.width = `${state.reserve * 100}%`;
  const width = 15 + Math.random() * 3;
  if (!assets.layers) assets.layers = { dark: assets.paint.getContext("2d"), mid: assets.paintMid.getContext("2d"), core: assets.paintCore.getContext("2d"), hi: assets.paintHi.getContext("2d") };
  bloodStrokeLayers(assets.layers, from, to, width);
  const pg = assets.paintGlow.getContext("2d");
  pg.strokeStyle = "rgba(255,40,20,0.9)";
  pg.lineWidth = width * 0.8;
  pg.lineCap = "round";
  pg.shadowColor = "#ff2a1a";
  pg.shadowBlur = 22;
  pg.beginPath();
  pg.moveTo(from[0], from[1]);
  pg.lineTo(to[0], to[1]);
  pg.stroke();
  let newly = 0;
  for (const s of samples) {
    if (s.on) continue;
    if (distanceToSegment(s.x, s.y, from[0], from[1], to[0], to[1]) < 24) {
      s.on = true;
      newly += 1;
    }
  }
  state.filled += newly;
  const ratio = state.filled / samples.length;
  progressBar.style.width = `${Math.round(ratio * 100)}%`;
  if (performance.now() - state.squelchAt > 140) {
    audio.squelch();
    state.squelchAt = performance.now();
  }
  if (ratio >= 0.95 && state.stage === "draw") finale();
}

function burstFx(x, y, amount, power = 1) {
  for (let i = 0; i < amount; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = (80 + Math.random() * 420) * power;
    fxParticles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 140, life: 0.8 + Math.random() * 0.9, size: 2 + Math.random() * 6 * power, age: 0 });
  }
}

function finale() {
  state.stage = "finale";
  state.drawing = false;
  state.finaleT = 0;
  document.body.classList.add("finale");
  hint.textContent = "";
  flash = 0.9;
  audio.boom();
  setTimeout(() => audio.shriek(), 500);
  state.drone.level(1);
  const spawnDrips = setInterval(() => {
    fxDrips.push({ x: Math.random() * fx.width, w: 4 + Math.random() * 14, len: 0, speed: 60 + Math.random() * 260 });
  }, 90);
  const words = ["IL EST LÀ", "TU L'AS FAIT", "MERCI", "ILS ARRIVENT", "…"];
  words.forEach((word, i) => {
    setTimeout(() => {
      finaleText.textContent = word;
      flash = 0.35;
      burstFx(Math.random() * innerWidth, Math.random() * innerHeight * 0.6, 40, 1.6);
    }, 400 + i * 900);
  });
  setTimeout(() => {
    const fade = setInterval(() => {
      blackout += 0.1;
      if (blackout >= 1) clearInterval(fade);
    }, 80);
  }, 4300);
  setTimeout(() => {
    clearInterval(spawnDrips);
    state.drone.stop();
    scene.classList.add("hidden");
    finaleText.textContent = "";
    fxDrips.length = 0;
    stains.length = 0;
    fxParticles.length = 0;
    document.body.classList.remove("finale");
    blackout = 0;
    openHell({ onClose: () => (location.href = "index.html") });
  }, 5400);
}
