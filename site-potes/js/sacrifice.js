import { createDrone, openHell } from "./enfer.js";
import { bloodStrokeLayers, drawBlob, streak } from "./gore/blood.js";
import { rand } from "./gore/noise.js";

const $ = (id) => document.getElementById(id);
const gate = $("gate");
const hint = $("hint");
const stage = $("stage");
const fx = $("fx");
const bloodBar = $("blood");
const progressBar = $("progress");
const pentMeter = $("pent-meter");
const finaleText = $("finale-text");
const headFlash = $("head-flash");
const scene = $("scene");
const sg = stage.getContext("2d");
const fg = fx.getContext("2d");

const W = 760;
const H = 760;
const FLOOR_Y = 520;
const FEET_Y = 548;
const GOAT_H = 500;
const DS = 0.62;
const HITS_NEEDED = 7;
const HIT_LINES = ["Elle hurle.", "Encore.", "Le sol est tout rouge.", "Ne t'arrête pas.", "Elle ne bouge presque plus.", "Un dernier coup."];
const CX = 380;
const CY = 380;
const R = 262;
const BASE = new URL("../assets/gore/", import.meta.url).href;

const state = { stage: "gate", hits: 0, reserve: 0, drawing: false, last: null, filled: 0, drone: null, ctx: null, noise: null, squelchAt: 0, time: 0, shake: 0, jerk: 0, fade: 0, fadeDir: 0, poolR: 0, poolTarget: 0, collapseT: 0, finaleT: 0 };
const assets = {};
const particles = [];
const drips = [];
const knife = { phase: "idle", t: 0, target: [0, 0], theta: 0.4, bloody: false, local: [0, 0] };
const fxParticles = [];
const stains = [];
const fxDrips = [];
let alphaData = null;
let soakDirty = true;
let flash = 0;
let blackout = 0;
let G = { x: 0, y: 0, s: 1, w: 0, h: 0 };

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

const loadImage = (name) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = BASE + name;
  });

function gradePixels(canvas, { sat, dark, tint, gamma = 1.12 }) {
  const g = canvas.getContext("2d");
  const data = g.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
    for (let c = 0; c < 3; c++) {
      const v = l + (d[i + c] - l) * sat;
      d[i + c] = Math.min(255, Math.pow(Math.max(0, v) / 255, gamma) * 255 * dark * tint[c]);
    }
  }
  g.putImageData(data, 0, 0);
}

function stamp(g, img, x, y, size, rot = 0, alpha = 1) {
  g.save();
  g.globalAlpha = alpha;
  g.translate(x, y);
  g.rotate(rot);
  const h = size * (img.height / img.width);
  g.drawImage(img, -size / 2, -h / 2, size, h);
  g.restore();
}

const pickSplat = (small = false) => {
  const list = small ? [assets.splat3, assets.splat18, assets.splat3, assets.splat0] : [assets.splat0, assets.splat3, assets.splat18, assets.splat14, assets.splat21, assets.splat2];
  return list[Math.floor(Math.random() * list.length)];
};

function maskTo(layer, sprite, dx = 0, dy = 0) {
  const g = layer.getContext("2d");
  g.save();
  g.globalCompositeOperation = "destination-in";
  g.drawImage(sprite, dx, dy);
  g.restore();
}

function prepareStanding(img) {
  const w = 800;
  const h = Math.round((800 * img.height) / img.width);
  const c = mk(w, h);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0, w, h);
  gradePixels(c, { sat: 0.62, dark: 0.66, tint: [1.12, 0.9, 0.78] });
  g.globalCompositeOperation = "source-atop";
  const low = g.createLinearGradient(0, h * 0.45, 0, h);
  low.addColorStop(0, "rgba(0,0,0,0)");
  low.addColorStop(1, "rgba(0,0,0,0.78)");
  g.fillStyle = low;
  g.fillRect(0, 0, w, h);
  const warm = g.createRadialGradient(w * 0.88, h * 0.4, 20, w * 0.88, h * 0.4, w * 0.7);
  warm.addColorStop(0, "rgba(255,150,70,0.3)");
  warm.addColorStop(1, "rgba(255,150,70,0)");
  g.fillStyle = warm;
  g.fillRect(0, 0, w, h);
  const side = g.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, "rgba(0,0,0,0.5)");
  side.addColorStop(0.5, "rgba(0,0,0,0)");
  g.fillStyle = side;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "source-over";
  return c;
}

function prepareLying(img) {
  const w = 1120;
  const h = Math.round((1120 * img.height) / img.width);
  const c = mk(w, h);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0, w, h);
  gradePixels(c, { sat: 0.5, dark: 0.58, tint: [1.1, 0.92, 0.82], gamma: 1.18 });
  g.globalCompositeOperation = "source-atop";
  const low = g.createLinearGradient(0, h * 0.4, 0, h);
  low.addColorStop(0, "rgba(0,0,0,0)");
  low.addColorStop(1, "rgba(0,0,0,0.6)");
  g.fillStyle = low;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "source-over";
  const layer = mk(w, h);
  const lg = layer.getContext("2d");
  const rnd = rand(31);
  for (let i = 0; i < 9; i++) {
    const img2 = [assets.splat0, assets.splat3, assets.splat18, assets.splat14, assets.splat21][i % 5];
    stamp(lg, img2, 520 + rnd() * 380, 130 + rnd() * 190, 150 + rnd() * 120, rnd() * Math.PI * 2, 0.95);
  }
  const ls = lg;
  for (let i = 0; i < 6; i++) {
    const x = 500 + rnd() * 380;
    const y0 = 160 + rnd() * 120;
    const len = 120 + rnd() * 180;
    streak(ls, x, y0, x + (rnd() - 0.5) * 12, y0 + len, 5 + rnd() * 7);
  }
  stamp(lg, assets.splat17, 990, 470, 260, 0.3, 0.95);
  stamp(lg, assets.splat0, 1030, 430, 200, 2.2, 0.95);
  const soak = lg.createRadialGradient(700, 220, 20, 700, 220, 320);
  soak.addColorStop(0, "rgba(70,0,0,0.6)");
  soak.addColorStop(1, "rgba(70,0,0,0)");
  lg.fillStyle = soak;
  lg.fillRect(0, 0, w, h);
  maskTo(layer, c);
  g.drawImage(layer, 0, 0);
  return c;
}

function prepareDagger(img) {
  const c = mk(img.width, img.height);
  c.getContext("2d").drawImage(img, 0, 0);
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let tipY = 0;
  for (let y = c.height - 1; y >= 0 && !tipY; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 90) tipY = y;
  let sx = 0;
  let n = 0;
  for (let y = tipY - 4; y <= tipY; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 90) {
    sx += x;
    n += 1;
  }
  const tipX = n ? sx / n : c.width / 2;
  const bloody = mk(c.width, c.height);
  const bg = bloody.getContext("2d");
  bg.drawImage(c, 0, 0);
  bg.globalCompositeOperation = "source-atop";
  const wash = bg.createLinearGradient(0, c.height * 0.3, 0, c.height);
  wash.addColorStop(0.45, "rgba(110,0,0,0)");
  wash.addColorStop(0.7, "rgba(120,6,8,0.5)");
  wash.addColorStop(1, "rgba(80,0,0,0.92)");
  bg.fillStyle = wash;
  bg.fillRect(0, 0, c.width, c.height);
  const rnd = rand(8);
  bg.strokeStyle = "rgba(150,10,10,0.9)";
  bg.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const x = c.width * (0.3 + rnd() * 0.4);
    bg.lineWidth = 2 + rnd() * 3;
    bg.beginPath();
    bg.moveTo(x, c.height * (0.4 + rnd() * 0.2));
    bg.lineTo(x + (rnd() - 0.5) * 4, c.height * (0.7 + rnd() * 0.25));
    bg.stroke();
  }
  bg.fillStyle = "rgba(255,170,160,0.35)";
  bg.fillRect(c.width * 0.36, c.height * 0.45, 3, c.height * 0.45);
  return { clean: c, bloody, tipX, tipY };
}

function bakeBackgrounds() {
  const bg = mk(W, H);
  const g = bg.getContext("2d");
  g.drawImage(assets.wall, 0, 0, W, FLOOR_Y + 12);
  g.fillStyle = "rgba(10,0,0,0.58)";
  g.fillRect(0, 0, W, FLOOR_Y + 12);
  const damp = g.createLinearGradient(0, 0, 0, FLOOR_Y);
  damp.addColorStop(0, "rgba(0,0,0,0.5)");
  damp.addColorStop(0.7, "rgba(0,0,0,0)");
  g.fillStyle = damp;
  g.fillRect(0, 0, W, FLOOR_Y);
  const wallShade = g.createLinearGradient(0, FLOOR_Y - 120, 0, FLOOR_Y + 8);
  wallShade.addColorStop(0, "rgba(0,0,0,0)");
  wallShade.addColorStop(1, "rgba(0,0,0,0.6)");
  g.fillStyle = wallShade;
  g.fillRect(0, FLOOR_Y - 120, W, 128);
  g.save();
  g.beginPath();
  g.rect(0, FLOOR_Y, W, H - FLOOR_Y);
  g.clip();
  g.drawImage(assets.floor, 0, FLOOR_Y - 60, W, H - FLOOR_Y + 120);
  g.restore();
  const floorShade = g.createLinearGradient(0, FLOOR_Y, 0, H);
  floorShade.addColorStop(0, "rgba(0,0,0,0.55)");
  floorShade.addColorStop(1, "rgba(0,0,0,0.2)");
  g.fillStyle = floorShade;
  g.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  g.fillStyle = "#050302";
  g.fillRect(0, FLOOR_Y - 4, W, 8);
  assets.bgKill = bg;
  const ov = mk(W, H);
  const og = ov.getContext("2d");
  og.drawImage(assets.floor, 0, 0, W, H);
  og.fillStyle = "rgba(12,0,0,0.5)";
  og.fillRect(0, 0, W, H);
  const vig = og.createRadialGradient(CX, CY, 120, CX, CY, 540);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.6)");
  og.fillStyle = vig;
  og.fillRect(0, 0, W, H);
  assets.bgOver = ov;
}

async function buildAssets() {
  const yieldFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  const names = ["goat-standing.webp", "goat-lying.webp", "dagger.webp", "wall.jpg", "floor.jpg", "hands.webp", "splat-0.webp", "splat-2.webp", "splat-3.webp", "splat-14.webp", "splat-15.webp", "splat-17.webp", "splat-18.webp", "splat-21.webp"];
  const imgs = await Promise.all(names.map(loadImage));
  const [standImg, lieImg, daggerImg, wall, floor, hands, s0, s2, s3, s14, s15, s17, s18, s21] = imgs;
  Object.assign(assets, { wall, floor, hands, splat0: s0, splat2: s2, splat3: s3, splat14: s14, splat15: s15, splat17: s17, splat18: s18, splat21: s21 });
  await yieldFrame();
  assets.stand = prepareStanding(standImg);
  const s = GOAT_H / assets.stand.height;
  G = { s, w: assets.stand.width * s, h: GOAT_H, x: 380 - (assets.stand.width * s) / 2, y: FEET_Y - GOAT_H };
  await yieldFrame();
  assets.dead = prepareLying(lieImg);
  await yieldFrame();
  const dag = prepareDagger(daggerImg);
  Object.assign(assets, { dagger: dag.clean, daggerBloody: dag.bloody, tipX: dag.tipX, tipY: dag.tipY });
  bakeBackgrounds();
  assets.blood = mk(W, H);
  assets.overBlood = mk(W, H);
  assets.soak = mk(assets.stand.width, assets.stand.height);
  assets.soakMasked = mk(assets.stand.width, assets.stand.height);
  assets.paint = mk(W, H);
  assets.paintMid = mk(W, H);
  assets.paintCore = mk(W, H);
  assets.paintHi = mk(W, H);
  assets.paintGlow = mk(W, H);
  assets.guide = mk(W, H);
  assets.light = mk(W, H);
  alphaData = assets.stand.getContext("2d").getImageData(0, 0, assets.stand.width, assets.stand.height).data;
  await yieldFrame();
}

function hitMask(lx, ly) {
  const x = Math.round(lx);
  const y = Math.round(ly);
  if (x < 0 || y < 0 || x >= assets.stand.width || y >= assets.stand.height) return false;
  return alphaData[(y * assets.stand.width + x) * 4 + 3] > 60;
}

const toSprite = (x, y) => [(x - G.x) / G.s, (y - G.y) / G.s];

function refreshSoak() {
  const g = assets.soakMasked.getContext("2d");
  g.clearRect(0, 0, assets.soakMasked.width, assets.soakMasked.height);
  g.globalCompositeOperation = "source-over";
  g.drawImage(assets.soak, 0, 0);
  g.globalCompositeOperation = "destination-in";
  g.drawImage(assets.stand, 0, 0);
  g.globalCompositeOperation = "source-over";
  soakDirty = false;
}

function addWound(lx, ly) {
  const s = assets.soak.getContext("2d");
  const soak = s.createRadialGradient(lx, ly, 2, lx, ly, 120 + Math.random() * 40);
  soak.addColorStop(0, "rgba(60,0,0,0.85)");
  soak.addColorStop(0.5, "rgba(80,0,0,0.5)");
  soak.addColorStop(1, "rgba(80,0,0,0)");
  s.fillStyle = soak;
  s.fillRect(lx - 200, ly - 200, 400, 400);
  stamp(s, pickSplat(true), lx, ly, 150 + Math.random() * 90, Math.random() * Math.PI * 2, 0.95);
  drawBlob(s, lx, ly, 22 + Math.random() * 12, (Math.random() * 1e6) | 0, { squash: 0.75, wet: 1 });
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) drips.push({ x: lx + (Math.random() - 0.5) * 70, y: ly + 10, max: 80 + Math.random() * 200, len: 0, speed: 30 + Math.random() * 70, w: 3.5 + Math.random() * 5 });
  soakDirty = true;
}

function startStab(x, y) {
  if (state.stage !== "kill" || knife.phase !== "idle") return;
  const [lx, ly] = toSprite(x, y);
  if (!hitMask(lx, ly)) {
    audio.tone("sawtooth", 300, 120, 0.08, 0.05);
    return;
  }
  Object.assign(knife, { phase: "in", t: 0, target: [x, y], local: [lx, ly], theta: 0.2 + Math.random() * 0.4, bloody: state.hits > 0 });
  audio.swoosh();
}

function impact() {
  state.hits += 1;
  const [x, y] = knife.target;
  addWound(...knife.local);
  state.shake = 1;
  state.jerk = 1;
  state.poolTarget = 40 + state.hits * 28;
  state.reserve = state.hits / HITS_NEEDED;
  bloodBar.style.width = `${state.reserve * 100}%`;
  const u = Math.atan2(-Math.cos(knife.theta), Math.sin(knife.theta));
  for (let i = 0; i < 80; i++) {
    const a = u + (Math.random() - 0.5) * 2.4;
    const speed = 160 + Math.random() * 640;
    particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 120, size: 1.5 + Math.random() * 4.4, life: 1.4, age: 0 });
  }
  const bg = assets.blood.getContext("2d");
  for (let i = 0; i < 3; i++) {
    const a = Math.random() * Math.PI * 2;
    stamp(bg, pickSplat(true), x + Math.cos(a) * 130, FLOOR_Y + 30 + Math.random() * 190, 36 + Math.random() * 60, Math.random() * Math.PI * 2, 0.9);
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
  const sprite = knife.bloody || knife.phase !== "in" ? assets.daggerBloody : assets.dagger;
  let tip;
  if (knife.phase === "in") tip = -420 * (1 - knife.t) * (1 - knife.t);
  else if (knife.phase === "stuck") tip = Math.min(1, knife.t * 6) * 40;
  else tip = 40 - 520 * easeOut(knife.t);
  g.save();
  g.translate(knife.target[0], knife.target[1]);
  g.rotate(knife.theta);
  g.beginPath();
  g.rect(-400, -1800, 800, 1800);
  g.clip();
  g.scale(DS, DS);
  g.drawImage(sprite, -assets.tipX, tip / DS - assets.tipY);
  g.restore();
  if (knife.phase !== "in") {
    g.save();
    g.translate(knife.target[0], knife.target[1]);
    g.rotate(knife.theta);
    const lip = g.createRadialGradient(0, 0, 2, 0, 0, 22);
    lip.addColorStop(0, "rgba(40,0,0,0.95)");
    lip.addColorStop(0.7, "rgba(110,6,6,0.85)");
    lip.addColorStop(1, "rgba(110,6,6,0)");
    g.fillStyle = lip;
    g.beginPath();
    g.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
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
  stamp(og, assets.splat17, CX + 10, CY + 40, 620, 0.2, 0.96);
  stamp(og, assets.splat17, CX - 120, CY + 110, 300, 2.4, 0.9);
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 200 + rnd() * 160;
    stamp(og, [assets.splat0, assets.splat3, assets.splat14, assets.splat18, assets.splat21, assets.splat2][i % 6], CX + Math.cos(a) * d, CY + Math.sin(a) * d, 90 + rnd() * 170, a + 1.5, 0.92);
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
    warm.addColorStop(0, "rgba(255,150,60,0.26)");
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
  g.drawImage(assets.bgKill, 0, 0);
  g.drawImage(assets.blood, 0, 0);
  if (state.poolR > 1) {
    const r = state.poolR * 2.1;
    g.save();
    g.globalAlpha = 0.97;
    g.drawImage(assets.splat17, 395 - r, FEET_Y + 6 - r * 0.2, r * 2, r * 0.4);
    g.drawImage(assets.splat17, 350 - r * 0.6, FEET_Y + 22 - r * 0.12, r * 1.2, r * 0.24);
    g.restore();
  }
  drawCandleSide(g, 96, FLOOR_Y + 110, t, 1);
  drawCandleSide(g, 668, FLOOR_Y + 118, t, 2);
  g.save();
  g.translate(390, FEET_Y - 6);
  g.scale(1, 0.1);
  const gs = g.createRadialGradient(0, 0, 10, 0, 0, 260);
  gs.addColorStop(0, "rgba(0,0,0,0.85)");
  gs.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gs;
  g.beginPath();
  g.arc(0, 0, 260, 0, Math.PI * 2);
  g.fill();
  g.restore();

  if (soakDirty) refreshSoak();
  g.save();
  if (state.stage === "collapse") {
    const e = Math.min(1, state.collapseT / 1.1);
    const ease = e * e * (3 - 2 * e);
    g.translate(G.x + G.w / 2, FEET_Y);
    g.rotate(-0.07 * ease);
    g.scale(1 + 0.04 * ease, 1 - 0.12 * ease);
    g.translate(-G.w / 2, -G.h);
    g.scale(G.s, G.s);
  } else {
    g.translate(G.x + Math.sin(t * 70) * 10 * state.jerk, G.y + Math.abs(Math.sin(t * 50)) * 3 * state.jerk);
    g.scale(G.s, G.s);
  }
  g.drawImage(assets.stand, 0, 0);
  g.drawImage(assets.soakMasked, 0, 0);
  g.restore();

  for (const p of particles) {
    const sx = p.x - p.vx * 0.022;
    const sy = p.y - p.vy * 0.022;
    streak(g, sx, sy, p.x, p.y, p.size);
  }
  drawKnifeAnim(g);
  g.restore();

  const candles = [{ x: 96, y: FLOOR_Y + 32, r: 340 }, { x: 668, y: FLOOR_Y + 40, r: 340 }, { x: 380, y: 300, r: 330 }];
  lightOverlay(g, candles, t, 0.72);
}

function drawGoatOverhead(g) {
  const w = assets.dead.width;
  const h = assets.dead.height;
  const sc = 480 / w;
  g.save();
  g.translate(CX + 14, CY + 22);
  g.rotate(-0.12);
  g.scale(1, 0.55);
  const os = g.createRadialGradient(0, 0, 10, 0, 0, 300);
  os.addColorStop(0, "rgba(0,0,0,0.75)");
  os.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = os;
  g.beginPath();
  g.arc(0, 0, 300, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.save();
  g.translate(CX, CY + 6);
  g.rotate(-0.12);
  g.scale(sc, sc);
  g.drawImage(assets.dead, -w / 2, -h / 2);
  g.restore();
}

function eyePos() {
  const w = assets.dead.width;
  const h = assets.dead.height;
  const sc = 480 / w;
  const lx = 0.7 * w - w / 2;
  const ly = 0.64 * h - h / 2;
  const c = Math.cos(-0.12);
  const s = Math.sin(-0.12);
  return [CX + (lx * c - ly * s) * sc, CY + 6 + (lx * s + ly * c) * sc];
}

const eyes = Array.from({ length: 16 }, (_, i) => {
  const rnd = rand(900 + i);
  const a = rnd() * Math.PI * 2;
  const d = 330 + rnd() * 90;
  return { x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d, gap: 7 + rnd() * 7, start: 0.4 + rnd() * 2.6, size: 2.2 + rnd() * 2.4 };
});

function drawOverhead(g, t) {
  g.drawImage(assets.bgOver, 0, 0);
  g.drawImage(assets.overBlood, 0, 0);
  const progress = state.filled / samples.length;
  const breathe = 0.55 + Math.sin(t * 2.2) * 0.25;
  g.drawImage(assets.guide, 0, 0);
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.18 * breathe * (1 - Math.min(1, progress));
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
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = Math.min(1, progress * 0.45 + (state.stage === "finale" ? 0.7 + Math.sin(t * 24) * 0.2 : 0));
  g.drawImage(assets.paintGlow, 0, 0);
  g.restore();
  drawGoatOverhead(g);
  const handAlpha = Math.min(1, Math.max(0, (progress - 0.25) * 2.2));
  if (handAlpha > 0) {
    stamp(g, assets.hands, 190, 640, 230, -0.4, handAlpha * 0.9);
    stamp(g, assets.hands, 590, 650, 200, 0.5, handAlpha * 0.9);
  }
  g.save();
  g.translate(590, 690);
  g.rotate(-1.38);
  g.scale(DS * 0.72, DS * 0.72);
  g.fillStyle = "rgba(0,0,0,0.3)";
  g.fillRect(-30, -assets.tipY, 80, assets.tipY);
  g.drawImage(assets.daggerBloody, -assets.tipX, -assets.tipY);
  g.restore();
  const fin = state.stage === "finale" ? state.finaleT : 0;
  for (const [i, [x, y]] of verts.entries()) drawCandleTop(g, x, y, t, i + 3, 1 + fin * 0.9);
  const lights = verts.map(([x, y]) => ({ x, y, r: 280 + fin * 200 }));
  lights.push({ x: CX, y: CY, r: 160 + fin * 260 });
  lightOverlay(g, lights, t, state.stage === "finale" ? Math.max(0.3, 0.74 - fin * 0.5) : 0.74);
  if (state.stage === "finale") {
    g.save();
    g.globalCompositeOperation = "lighter";
    const [ex, ey] = eyePos();
    const glow = g.createRadialGradient(ex, ey, 1, ex, ey, 70 + Math.sin(t * 12) * 8);
    glow.addColorStop(0, "rgba(255,40,20,1)");
    glow.addColorStop(0.3, "rgba(255,20,10,0.6)");
    glow.addColorStop(1, "rgba(255,0,0,0)");
    g.fillStyle = glow;
    g.fillRect(ex - 100, ey - 100, 200, 200);
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
    if (fin > 0.45) {
      const reveal = Math.min(1, (fin - 0.45) * 2);
      g.save();
      g.beginPath();
      g.rect(0, 0, W, H * reveal * 0.55);
      g.clip();
      g.drawImage(assets.splat15, 0, -20, W, W * (assets.splat15.height / assets.splat15.width) * 0.8);
      g.restore();
    }
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
      if (p.size > 2.4) stamp(bg, pickSplat(true), p.x, p.y, 10 + p.size * 7, Math.random() * Math.PI * 2, 0.9);
      particles.splice(i, 1);
    } else if (p.age > p.life || p.x < -40 || p.x > W + 40) particles.splice(i, 1);
  }
  const s = assets.soak.getContext("2d");
  for (let i = drips.length - 1; i >= 0; i--) {
    const d = drips[i];
    if (d.len >= d.max) {
      drips.splice(i, 1);
      continue;
    }
    const step = d.speed * dt * (1 - (d.len / d.max) * 0.8);
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
  } else {
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
  startStab(G.x + G.w * (0.3 + Math.random() * 0.4), G.y + G.h * (0.3 + Math.random() * 0.2));
});

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

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

function flashHead(duration) {
  headFlash.style.transform = `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 30}px) scale(${1.05 + Math.random() * 0.1})`;
  headFlash.classList.add("on");
  setTimeout(() => headFlash.classList.remove("on"), duration);
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
  setTimeout(() => flashHead(170), 1500);
  setTimeout(() => flashHead(120), 2000);
  setTimeout(() => flashHead(260), 3300);
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
