import "../layout.js";
export { loadHeads, loadMemeModels } from "../faces.js";

const MUTE_KEY = "qg-muted";

export const getBest = (id) => {
  try {
    return Number(localStorage.getItem(`qg-best-${id}`)) || 0;
  } catch {
    return 0;
  }
};

export const setBest = (id, value) => {
  try {
    localStorage.setItem(`qg-best-${id}`, String(value));
  } catch {
    return;
  }
};

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function setupCanvas(canvas, width, height) {
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const g = canvas.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return g;
}

export function pointer(event, canvas, width, height) {
  const rect = canvas.getBoundingClientRect();
  return { x: ((event.clientX - rect.left) / rect.width) * width, y: ((event.clientY - rect.top) / rect.height) * height };
}

export function drawFace(g, image, cx, cy, size, angle = 0) {
  const ratio = image.width / image.height;
  g.save();
  g.translate(cx, cy);
  if (angle) g.rotate(angle);
  g.drawImage(image, (-size * ratio) / 2, -size / 2, size * ratio, size);
  g.restore();
}

export function createSfx() {
  let ctx = null;
  let master = null;
  let noiseBuffer = null;
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }

  const init = () => {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    ctx = new Context();
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.85;
    master.connect(compressor);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  };

  const tone = (type, from, to, duration, volume = 0.15, delay = 0) => {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.03);
  };

  const noise = (duration, volume, type, from, to, delay = 0, q = 1) => {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    if (to !== from) filter.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(t, Math.random() * 0.5);
    source.stop(t + duration + 0.03);
  };

  return {
    init,
    tone,
    noise,
    get ctx() {
      return ctx;
    },
    isMuted: () => muted,
    toggle() {
      muted = !muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      } catch {
        muted = muted;
      }
      if (master) master.gain.value = muted ? 0 : 0.85;
      return muted;
    },
    click: () => tone("square", 880, 620, 0.05, 0.08),
    flap: () => {
      tone("triangle", 420, 760, 0.1, 0.14);
      noise(0.05, 0.08, "highpass", 3000, 3000);
    },
    pop: () => tone("sine", 500, 900, 0.09, 0.16),
    coin: () => {
      tone("triangle", 1568, 1568, 0.07, 0.1);
      tone("triangle", 2093, 2093, 0.14, 0.1, 0.07);
    },
    bonk: () => {
      tone("sine", 220, 70, 0.14, 0.5);
      noise(0.07, 0.35, "lowpass", 1400, 300);
      tone("triangle", 880, 440, 0.06, 0.12);
    },
    boing: () => tone("sine", 200, 700, 0.35, 0.22),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone("triangle", f, f, 0.2, 0.14, i * 0.1)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone("triangle", f, f * 0.97, 0.28, 0.18, i * 0.2)),
    eat: () => tone("square", 520, 1040, 0.08, 0.1),
    hit: () => {
      tone("sawtooth", 180, 40, 0.3, 0.3);
      noise(0.25, 0.4, "lowpass", 1500, 200);
    },
    tick: () => tone("square", 1200, 1000, 0.025, 0.06),
  };
}

export function mountSoundButton(button, sfx) {
  const label = () => {
    button.textContent = sfx.isMuted() ? "Son : coupé" : "Son : activé";
  };
  label();
  button.addEventListener("click", () => {
    sfx.init();
    sfx.toggle();
    sfx.click();
    label();
  });
}

export function createOverlay(root) {
  const q = (selector) => root.querySelector(selector);
  const action = q("[data-ov-action]");
  let handler = () => {};
  action.addEventListener("click", () => handler());
  return {
    show({ eyebrow = "", title = "", text = "", button = "Jouer", stats = "" }) {
      q("[data-ov-eyebrow]").textContent = eyebrow;
      q("[data-ov-title]").textContent = title;
      q("[data-ov-text]").textContent = text;
      q("[data-ov-stats]").innerHTML = stats;
      action.textContent = button;
      root.classList.remove("hidden");
      action.focus({ preventScroll: true });
    },
    hide() {
      root.classList.add("hidden");
    },
    onAction(callback) {
      handler = callback;
    },
  };
}

export function loop(update, draw) {
  let last = performance.now();
  let running = true;
  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => {
    running = false;
  };
}

export const statBlock = (items) =>
  `<dl class="stats">${items.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
