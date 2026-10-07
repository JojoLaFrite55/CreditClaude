import { createDrone, openHell } from "./enfer.js";

const $ = (id) => document.getElementById(id);
const gate = $("gate");
const hint = $("hint");
const goat = $("goat");
const pool = $("pool");
const altar = $("altar");
const drawSection = $("draw");
const pent = $("pent");
const fx = $("fx");
const bloodBar = $("blood");
const progressBar = $("progress");
const pentMeter = $("pent-meter");
const finaleText = $("finale-text");
const scene = $("scene");

const HITS_NEEDED = 7;
const HIT_LINES = ["Elle crie.", "Encore.", "Le sol est tout rouge.", "Ne t'arrête pas.", "Elle ne bouge presque plus.", "Un dernier coup."];
const state = { stage: "gate", hits: 0, reserve: 0, drawing: false, last: null, filled: 0, drone: null, ctx: null, squelchAt: 0 };

const g = pent.getContext("2d");
const paint = document.createElement("canvas");
paint.width = pent.width;
paint.height = pent.height;
const pg = paint.getContext("2d");
const fg = fx.getContext("2d");
const CX = 380;
const CY = 380;
const R = 320;
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

const particles = [];
const stains = [];
const drips = [];
let flash = 0;
let blackout = 0;

function resizeFx() {
  fx.width = innerWidth;
  fx.height = innerHeight;
}
resizeFx();
addEventListener("resize", resizeFx);

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
  thud() {
    this.noise(0.22, 0.7, "lowpass", 420);
    this.tone("sine", 110, 38, 0.25, 0.8);
  },
  bleat(step) {
    const ctx = state.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const base = 520 - step * 38;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.linearRampToValueAtTime(base * 0.62, t + 0.55);
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
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.65);
    lfo.stop(t + 0.65);
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

function burst(x, y, amount, power = 1) {
  for (let i = 0; i < amount; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = (80 + Math.random() * 420) * power;
    particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 140, life: 0.8 + Math.random() * 0.9, size: 2 + Math.random() * 6 * power, age: 0 });
  }
  for (let i = 0; i < 4; i++) stains.push({ x: x + (Math.random() - 0.5) * 120, y: y + (Math.random() - 0.5) * 120, r: 6 + Math.random() * 22 });
  while (stains.length > 160) stains.shift();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  fg.clearRect(0, 0, fx.width, fx.height);
  fg.fillStyle = "#6e0000";
  for (const s of stains) {
    fg.globalAlpha = 0.55;
    fg.beginPath();
    fg.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    fg.fill();
  }
  fg.globalAlpha = 1;
  for (const p of particles) {
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
  for (let i = particles.length - 1; i >= 0; i--) if (particles[i].age > particles[i].life) particles.splice(i, 1);
  for (const d of drips) {
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

function startScene() {
  state.drone = createDrone();
  state.drone.level(0.4);
  state.ctx = state.drone.ctx;
  state.noise = noiseBuffer(state.ctx);
  if (state.ctx.state === "suspended") state.ctx.resume();
  gate.classList.add("hidden");
  state.stage = "kill";
  hint.textContent = `Elle t'attend sur l'autel. Frappe-la. (0/${HITS_NEEDED})`;
  bloodBar.style.width = "0%";
}

$("enter").addEventListener("click", startScene);

const svgRoot = goat.querySelector("svg");
const wounds = svgRoot.querySelector("#wounds");
const NS = "http://www.w3.org/2000/svg";

function addWound(x, y) {
  const point = svgRoot.createSVGPoint();
  point.x = x;
  point.y = y;
  const local = point.matrixTransform(svgRoot.getScreenCTM().inverse());
  const group = document.createElementNS(NS, "g");
  const glow = document.createElementNS(NS, "ellipse");
  glow.setAttribute("cx", local.x);
  glow.setAttribute("cy", local.y);
  glow.setAttribute("rx", 16 + Math.random() * 12);
  glow.setAttribute("ry", 10 + Math.random() * 8);
  glow.setAttribute("fill", "#5a0000");
  glow.setAttribute("opacity", "0.9");
  const core = document.createElementNS(NS, "ellipse");
  core.setAttribute("cx", local.x);
  core.setAttribute("cy", local.y);
  core.setAttribute("rx", 7 + Math.random() * 6);
  core.setAttribute("ry", 4 + Math.random() * 4);
  core.setAttribute("fill", "#c40d0d");
  group.append(glow, core);
  const drips = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < drips; i++) {
    const drip = document.createElementNS(NS, "path");
    const dx = local.x + (Math.random() - 0.5) * 26;
    const length = 40 + Math.random() * 90;
    drip.setAttribute("d", `M${dx} ${local.y} q${(Math.random() - 0.5) * 6} ${length / 2} 0 ${length}`);
    drip.setAttribute("stroke", i % 2 ? "#8b0000" : "#c40d0d");
    drip.setAttribute("stroke-width", 3 + Math.random() * 3);
    drip.setAttribute("stroke-linecap", "round");
    drip.setAttribute("fill", "none");
    drip.setAttribute("class", "wound-drip");
    drip.style.transformOrigin = `${dx}px ${local.y}px`;
    group.append(drip);
  }
  wounds.append(group);
}

function hit(x, y, onBody = true) {
  if (state.stage !== "kill") return;
  if (!onBody) {
    audio.tone("sawtooth", 300, 120, 0.08, 0.05);
    return;
  }
  addWound(x, y);
  state.hits += 1;
  goat.classList.remove("hit");
  void goat.offsetWidth;
  goat.classList.add("hit");
  burst(x, y, 34, 1 + state.hits * 0.12);
  audio.thud();
  audio.bleat(state.hits);
  state.reserve = state.hits / HITS_NEEDED;
  bloodBar.style.width = `${state.reserve * 100}%`;
  const size = 20 + state.hits * 9;
  pool.style.width = `${size}%`;
  pool.style.height = `${size * 0.22}%`;
  if (state.hits >= HITS_NEEDED) {
    state.stage = "wait";
    goat.classList.add("dead");
    hint.textContent = "Elle ne crie plus.";
    setTimeout(startDrawing, 2200);
  } else hint.textContent = `${HIT_LINES[state.hits - 1]} (${state.hits}/${HITS_NEEDED})`;
}

goat.addEventListener("pointerdown", (event) => hit(event.clientX, event.clientY, !!event.target.closest("#goat-body")));
goat.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  const rect = goat.getBoundingClientRect();
  hit(rect.left + rect.width * (0.42 + Math.random() * 0.3), rect.top + rect.height * (0.38 + Math.random() * 0.2));
});

function renderPentagram() {
  g.clearRect(0, 0, pent.width, pent.height);
  g.save();
  g.strokeStyle = "rgba(160, 30, 30, 0.55)";
  g.lineWidth = 3;
  g.setLineDash([10, 10]);
  g.beginPath();
  g.arc(CX, CY, R, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  starOrder.forEach((v, i) => (i ? g.lineTo(...verts[v]) : g.moveTo(...verts[v])));
  g.stroke();
  g.restore();
  g.fillStyle = "rgba(160, 30, 30, 0.7)";
  for (const [x, y] of verts) {
    g.beginPath();
    g.arc(x, y, 7, 0, Math.PI * 2);
    g.fill();
  }
  g.drawImage(paint, 0, 0);
}

function startDrawing() {
  state.stage = "draw";
  stains.length = 0;
  altar.classList.add("hidden");
  drawSection.classList.remove("hidden");
  pentMeter.classList.remove("hidden");
  state.reserve = 1;
  bloodBar.style.width = "100%";
  hint.textContent = "Trempe tes doigts dans son sang. Remplis le pentagramme sans t'arrêter.";
  renderPentagram();
}

function toCanvas(event) {
  const rect = pent.getBoundingClientRect();
  return [((event.clientX - rect.left) / rect.width) * pent.width, ((event.clientY - rect.top) / rect.height) * pent.height];
}

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
  pg.lineCap = "round";
  pg.lineJoin = "round";
  pg.strokeStyle = "#5a0000";
  pg.lineWidth = 24;
  pg.beginPath();
  pg.moveTo(...from);
  pg.lineTo(...to);
  pg.stroke();
  pg.strokeStyle = "#c40d0d";
  pg.lineWidth = 14;
  pg.beginPath();
  pg.moveTo(...from);
  pg.lineTo(...to);
  pg.stroke();
  pg.strokeStyle = "rgba(255, 120, 120, 0.35)";
  pg.lineWidth = 4;
  pg.beginPath();
  pg.moveTo(from[0] - 2, from[1] - 2);
  pg.lineTo(to[0] - 2, to[1] - 2);
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
  renderPentagram();
  if (performance.now() - state.squelchAt > 140) {
    audio.squelch();
    state.squelchAt = performance.now();
  }
  if (ratio >= 0.95) finale();
}

pent.addEventListener("pointerdown", (event) => {
  if (state.stage !== "draw") return;
  pent.setPointerCapture(event.pointerId);
  state.drawing = true;
  state.last = toCanvas(event);
  stroke(state.last, state.last);
});
pent.addEventListener("pointermove", (event) => {
  if (!state.drawing || state.stage !== "draw") return;
  const point = toCanvas(event);
  stroke(state.last, point);
  state.last = point;
});
["pointerup", "pointercancel"].forEach((type) => pent.addEventListener(type, () => (state.drawing = false)));

function finale() {
  state.stage = "finale";
  state.drawing = false;
  document.body.classList.add("finale");
  hint.textContent = "";
  flash = 0.9;
  audio.boom();
  setTimeout(() => audio.shriek(), 500);
  state.drone.level(1);
  const spawnDrips = setInterval(() => {
    drips.push({ x: Math.random() * fx.width, w: 4 + Math.random() * 14, len: 0, speed: 60 + Math.random() * 260 });
  }, 90);
  const words = ["IL EST LÀ", "TU L'AS FAIT", "MERCI", "ILS ARRIVENT", "…"];
  words.forEach((word, i) => {
    setTimeout(() => {
      finaleText.textContent = word;
      flash = 0.35;
      burst(Math.random() * innerWidth, Math.random() * innerHeight * 0.6, 40, 1.6);
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
    drips.length = 0;
    stains.length = 0;
    particles.length = 0;
    document.body.classList.remove("finale");
    blackout = 0;
    openHell({ onClose: () => (location.href = "index.html") });
  }, 5400);
}
