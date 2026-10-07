import { HEADS } from "./data.js";

const WHISPERS = [
  "ABANDONNE TOUTE ESPÉRANCE",
  "LE QG TE REGARDE",
  "ʇǝɹɹǝ ǝl ɹǝdɹǝɔ",
  "666 LIKES",
  "AVE JULES",
  "ᚦᛖ ᚲᚢᛁᛉ ᛖᛋᛏ ᛗᛟᚱᛏ",
  "T'AS OUBLIÉ DE RÉPONDRE",
  "ΣΑΤΑΝ ΕΣΤΙ ΩΙΦΙ ΚΟΥΠΕ",
  "LE WIFI EST UN SACRIFICE",
  "𓂀 𓆩☠𓆪 𓂀",
  "ILS SONT DANS LE GROUPE",
  "SANGUIS ET MEMES",
  "PAIE TA TOURNÉE",
  "ꙮ ꙮ ꙮ",
  "NE LIS PAS LES MESSAGES",
  "CE N'EST QU'UN JEU",
];

const PENTAGRAM = `<svg class="hell-pentagram" viewBox="-110 -110 220 220" fill="none" stroke="#ff2a1a" stroke-width="1.6" aria-hidden="true">
  <circle r="100"/><circle r="92" stroke-width="0.6"/>
  <path d="M0-100 L58.8 80.9 L-95.1-30.9 L95.1-30.9 L-58.8 80.9 Z" stroke-linejoin="round"/>
  <g stroke-width="0.5" opacity="0.8"><circle r="40"/><path d="M0-100V100M-100 0H100"/></g>
</svg>`;

let sound = null;

function createDrone() {
  let level = 0.7;
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 4);
  const reverb = ctx.createConvolver();
  const len = ctx.sampleRate * 4;
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  reverb.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.7;
  reverb.connect(wet).connect(master);
  master.connect(ctx.destination);
  const dry = ctx.createGain();
  dry.gain.value = 0.55;
  dry.connect(master);
  const bus = (node) => {
    node.connect(dry);
    node.connect(reverb);
  };

  const nodes = [];
  const voice = (type, freq, gain, cutoff, lfoRate = 0.07) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.value = gain;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = lfoRate;
    const depth = ctx.createGain();
    depth.gain.value = cutoff * 0.5;
    lfo.connect(depth).connect(filter.frequency);
    osc.connect(filter).connect(g);
    bus(g);
    osc.start();
    lfo.start();
    nodes.push(osc, lfo);
  };
  const D = 36.71;
  voice("sawtooth", D, 0.28, 220, 0.05);
  voice("sawtooth", D * 1.004, 0.22, 240, 0.08);
  voice("sawtooth", D * 2, 0.1, 500, 0.06);
  voice("triangle", D * 1.5 * 2, 0.08, 900, 0.11);
  voice("sawtooth", D * 1.41421 * 4, 0.035, 1400, 0.13);
  voice("sine", D / 2, 0.5, 120, 0.03);

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuf;
  wind.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 500;
  band.Q.value = 6;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.05;
  const windLfo = ctx.createOscillator();
  windLfo.frequency.value = 0.09;
  const windDepth = ctx.createGain();
  windDepth.gain.value = 300;
  windLfo.connect(windDepth).connect(band.frequency);
  wind.connect(band).connect(windGain);
  bus(windGain);
  wind.start();
  windLfo.start();
  nodes.push(wind, windLfo);

  const bell = (freq, when) => {
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.14 / (i + 1), when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 6);
      osc.connect(g);
      bus(g);
      osc.start(when);
      osc.stop(when + 6.2);
    });
  };

  const choir = (when) => {
    const base = [D * 8, D * 9.51, D * 12, D * 11.31][Math.floor(Math.random() * 4)];
    [-6, 0, 7].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = base * Math.pow(2, cents / 1200);
      const vib = ctx.createOscillator();
      vib.frequency.value = 5 + Math.random();
      const vibDepth = ctx.createGain();
      vibDepth.gain.value = base * 0.012;
      vib.connect(vibDepth).connect(osc.frequency);
      const f1 = ctx.createBiquadFilter();
      f1.type = "bandpass";
      f1.frequency.value = 700;
      f1.Q.value = 8;
      const f2 = ctx.createBiquadFilter();
      f2.type = "bandpass";
      f2.frequency.value = 1100;
      f2.Q.value = 10;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.07, when + 2);
      g.gain.linearRampToValueAtTime(0, when + 6);
      osc.connect(f1).connect(g);
      osc.connect(f2).connect(g);
      bus(g);
      osc.start(when);
      vib.start(when);
      osc.stop(when + 6.2);
      vib.stop(when + 6.2);
    });
  };

  const thump = (when) => {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(70, when);
    osc.frequency.exponentialRampToValueAtTime(28, when + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.45);
    osc.connect(g);
    g.connect(master);
    osc.start(when);
    osc.stop(when + 0.5);
  };

  let beat = 0;
  const timer = setInterval(() => {
    const t = ctx.currentTime;
    thump(t);
    thump(t + 0.32);
    beat += 1;
    if (beat % 3 === 0) bell(D * 6 * (Math.random() < 0.5 ? 1 : 1.41421), t + 0.6);
    if (beat % 5 === 2) choir(t + 0.4);
  }, 1900);

  return {
    ctx,
    master,
    stop() {
      clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      setTimeout(() => {
        nodes.forEach((n) => { try { n.stop(); } catch {} });
        ctx.close();
      }, 1500);
    },
    mute(value) {
      master.gain.setTargetAtTime(value ? 0 : level, ctx.currentTime, 0.1);
    },
    level(value) {
      level = value;
      master.gain.setTargetAtTime(value, ctx.currentTime, 0.2);
    },
  };
}

function loadCss() {
  if (document.querySelector("link[data-hell]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/enfer.css", import.meta.url).href;
  link.dataset.hell = "1";
  document.head.append(link);
}

export function openHell() {
  if (document.querySelector(".hell")) return;
  loadCss();
  const root = document.createElement("div");
  root.className = "hell";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Menu de l'Enfer");
  const videoUrl = new URL("../assets/enfer/rituel.mp4", import.meta.url).href;
  const webmUrl = new URL("../assets/enfer/rituel.webm", import.meta.url).href;
  root.innerHTML = `
    <video muted loop playsinline preload="auto" disablepictureinpicture tabindex="-1"><source src="${videoUrl}" type="video/mp4"><source src="${webmUrl}" type="video/webm"></video>
    <div class="hell-tint"></div>
    ${PENTAGRAM}
    <div class="hell-heads"></div>
    <canvas class="hell-embers"></canvas>
    <div class="hell-runes"></div>
    <div class="hell-menu">
      <p class="hell-sub">Bienvenue dans</p>
      <h2 class="hell-title">Le QG des Enfers</h2>
      <p class="hell-sub">ᛋᚨᛏᚨᚾ ᛋᛖ ᚱᛖᛋᛏᛖ ᚨᚢ ᛈᛖᛏᛁᛏ ᛗᛁᛚᛁᛖᚢ</p>
      <div class="hell-actions">
        <button class="hell-btn" type="button" data-cinema>Jouer damné</button>
        <button class="hell-btn" type="button" data-mute>Couper le son</button>
        <button class="hell-btn" type="button" data-exit>Fuir</button>
      </div>
    </div>
    <div class="hell-cinema-bar">
      <button class="hell-btn" type="button" data-back>Retour au menu</button>
      <a class="hell-btn" href="jeu.html">Aller jouer</a>
      <button class="hell-btn" type="button" data-exit2>Fuir</button>
    </div>`;
  document.body.append(root);
  document.documentElement.style.overflow = "hidden";

  const video = root.querySelector("video");
  video.play().catch(() => {});
  video.muted = false;
  video.volume = 0.55;
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(() => {});
  });

  try {
    sound = createDrone();
    if (sound.ctx.state === "suspended") sound.ctx.resume();
  } catch {
    sound = null;
  }

  const headsBox = root.querySelector(".hell-heads");
  const count = Math.max(8, Math.min(16, Math.round(innerWidth / 110)));
  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.src = new URL("../" + HEADS[i % HEADS.length], import.meta.url).href;
    img.alt = "";
    img.style.left = `${Math.random() * 92 - 6}%`;
    img.style.top = `${Math.random() * 90 - 8}%`;
    img.style.setProperty("--d", `${6 + Math.random() * 9}s`);
    img.style.animationDelay = `${-Math.random() * 8}s`;
    if (Math.random() < 0.3) img.style.transform = "scaleY(-1)";
    headsBox.append(img);
  }

  const runes = root.querySelector(".hell-runes");
  const whisper = () => {
    const el = document.createElement("div");
    el.className = "hell-rune";
    el.textContent = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
    el.style.left = `${4 + Math.random() * 55}%`;
    el.style.top = `${6 + Math.random() * 84}%`;
    el.style.fontSize = `${14 + Math.random() * 34}px`;
    el.style.rotate = `${Math.random() * 30 - 15}deg`;
    runes.append(el);
    setTimeout(() => el.remove(), 6200);
  };
  for (let i = 0; i < 4; i++) setTimeout(whisper, i * 400);
  const whisperTimer = setInterval(whisper, 900);

  const canvas = root.querySelector(".hell-embers");
  const g = canvas.getContext("2d");
  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  resize();
  addEventListener("resize", resize);
  const embers = Array.from({ length: 70 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 1 + Math.random() * 2.4, v: 0.4 + Math.random() * 1.4, p: Math.random() * 6 }));
  let raf = 0;
  const tick = () => {
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (const e of embers) {
      e.y -= e.v;
      e.p += 0.03;
      e.x += Math.sin(e.p) * 0.6;
      if (e.y < -10) {
        e.y = canvas.height + 10;
        e.x = Math.random() * canvas.width;
      }
      g.fillStyle = `rgba(255, ${80 + Math.random() * 90 | 0}, 20, ${0.35 + Math.random() * 0.5})`;
      g.beginPath();
      g.arc(e.x, e.y, e.r, 0, 6.283);
      g.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  tick();

  const close = () => {
    clearInterval(whisperTimer);
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    removeEventListener("keydown", onKey);
    video.pause();
    sound?.stop();
    sound = null;
    document.documentElement.style.overflow = "";
    root.classList.remove("on");
    setTimeout(() => root.remove(), 900);
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  addEventListener("keydown", onKey);
  root.querySelector("[data-exit]").addEventListener("click", close);
  root.querySelector("[data-exit2]").addEventListener("click", close);
  root.querySelector("[data-cinema]").addEventListener("click", () => {
    root.classList.add("cinema");
    video.currentTime = 0;
    video.muted = muted;
    video.volume = 1;
    video.play().catch(() => {});
    sound?.level(muted ? 0 : 0.12);
  });
  root.querySelector("[data-back]").addEventListener("click", () => {
    root.classList.remove("cinema");
    video.volume = 0.55;
    sound?.level(0.7);
  });
  let muted = false;
  const muteBtn = root.querySelector("[data-mute]");
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    sound?.mute(muted);
    video.muted = muted;
    muteBtn.textContent = muted ? "Rallumer le son" : "Couper le son";
  });
  requestAnimationFrame(() => root.classList.add("on"));
}

export const HELL_HINT = "Konami code, ou six clics sur le logo du pied de page.";
