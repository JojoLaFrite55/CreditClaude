import { loadHeads } from "./faces.js";

const BPM = 175;
const STEP = 60 / BPM / 4;
const A_MINOR = [55, 65.41, 73.42, 82.41, 98, 110, 130.81, 146.83, 164.81, 196, 220];

function loadCss() {
  if (document.querySelector("link[data-car]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/voiture.css", import.meta.url).href;
  link.dataset.car = "1";
  document.head.append(link);
}

function createTechno() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const out = ctx.createGain();
  out.gain.value = 0.85;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.ratio.value = 8;
  comp.attack.value = 0.003;
  comp.release.value = 0.12;
  const clip = ctx.createWaveShaper();
  const curve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    const x = (i / 1024) - 1;
    curve[i] = Math.tanh(x * 1.6);
  }
  clip.curve = curve;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.55;
  const master = ctx.createGain();
  master.gain.value = 1;
  out.connect(comp).connect(clip).connect(master).connect(analyser);
  analyser.connect(ctx.destination);

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const drive = ctx.createWaveShaper();
  const dc = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    const x = (i / 512) - 1;
    dc[i] = Math.tanh(x * 9);
  }
  drive.curve = dc;
  drive.oversample = "2x";
  const driveOut = ctx.createGain();
  driveOut.gain.value = 0.9;
  drive.connect(driveOut).connect(out);

  const duck = ctx.createGain();
  duck.gain.value = 1;
  duck.connect(out);

  const noise = (t, dur, vol, type, freq, q, dest = out, rise = 0) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.max(0.002, rise));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
    return f;
  };

  const kick = (t, power = 1) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(230, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1.15 * power, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(drive);
    o.start(t);
    o.stop(t + 0.34);
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.setValueAtTime(48, t);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.7 * power, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    o2.connect(g2).connect(out);
    o2.start(t);
    o2.stop(t + 0.3);
    noise(t, 0.02, 0.5 * power, "highpass", 3000, 0.7);
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(0.18, t);
    duck.gain.linearRampToValueAtTime(1, t + STEP * 1.6);
  };

  const hat = (t, open) => noise(t, open ? 0.2 : 0.045, open ? 0.32 : 0.22, "highpass", 7500, 0.6);

  const clap = (t) => {
    noise(t, 0.2, 0.55, "bandpass", 1700, 0.9);
    noise(t + 0.012, 0.12, 0.35, "bandpass", 2400, 1.2);
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.12);
  };

  const rollBass = (t, freq) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 260;
    f.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + STEP * 1.5);
    o.connect(f).connect(g).connect(duck);
    o.start(t);
    o.stop(t + STEP * 1.6);
  };

  const hoover = (t, freq, dur, vol = 0.22) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.setValueAtTime(vol, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 5;
    f.frequency.setValueAtTime(5200, t);
    f.frequency.exponentialRampToValueAtTime(900, t + dur);
    for (const detune of [-18, 0, 17]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.detune.value = detune;
      o.frequency.setValueAtTime(freq * 1.9, t);
      o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    f.connect(g).connect(drive);
  };

  const acid = (t, freq, accent) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 16;
    f.frequency.setValueAtTime(accent ? 3800 : 1700, t);
    f.frequency.exponentialRampToValueAtTime(260, t + STEP * 0.9);
    const g = ctx.createGain();
    g.gain.setValueAtTime(accent ? 0.28 : 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + STEP * 0.95);
    o.connect(f).connect(g).connect(duck);
    o.start(t);
    o.stop(t + STEP);
  };

  const riser = (t, dur) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(2600, t + dur);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 3;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(8000, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.28, t + dur);
    o.connect(f).connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
    const n = noise(t, dur, 0.32, "bandpass", 400, 1.4, out, dur * 0.95);
    n.frequency.exponentialRampToValueAtTime(9000, t + dur);
  };

  const crash = (t) => {
    noise(t, 1.6, 0.55, "highpass", 5200, 0.5);
    noise(t, 0.8, 0.4, "bandpass", 2500, 0.5);
  };

  const pad = (t, dur) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.12, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 1400;
    for (const freq of [220, 261.63, 329.63, 440]) {
      for (const d of [-9, 9]) {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.detune.value = d;
        o.frequency.value = freq;
        o.connect(f);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    }
    f.connect(g).connect(out);
  };

  const sections = [{ name: "build", bars: 4 }, { name: "drop", bars: 8 }, { name: "break", bars: 2 }];
  const state = { step: 0, section: 0, barInSection: 0, next: 0, timer: 0, drops: 0, onDrop: () => {}, melody: [] };

  const newMelody = () => {
    const seq = [];
    for (let i = 0; i < 16; i++) seq.push(Math.random() < 0.45 ? A_MINOR[5 + Math.floor(Math.random() * 6)] : 0);
    return seq;
  };
  state.melody = newMelody();

  const schedule = (t) => {
    const sec = sections[state.section];
    const s = state.step % 16;
    const bar = state.barInSection;
    const beat = s % 4 === 0;
    if (sec.name === "build") {
      const density = [4, 2, 1, 0.5][bar];
      if (density < 1 || s % density === 0) {
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.value = 200 + (bar * 16 + s) * 18;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 0.08);
        noise(t, 0.09, 0.28 + bar * 0.06, "bandpass", 1900, 1);
        if (density < 1) noise(t + STEP / 2, 0.06, 0.25, "bandpass", 2200, 1);
      }
      if (bar >= 2 && beat && !(bar === 3 && s >= 12)) kick(t, 0.7 + bar * 0.1);
      if (bar === 0 && s === 0) riser(t, STEP * 64);
      if (bar === 3 && s === 0) pad(t, STEP * 16);
    } else if (sec.name === "drop") {
      if (bar === 0 && s === 0) {
        crash(t);
        state.drops += 1;
        const delay = Math.max(0, (t - ctx.currentTime) * 1000);
        setTimeout(() => state.onDrop(), delay);
      }
      if (beat) kick(t, 1);
      else if (s % 4 === 2) hat(t, true);
      if (s % 4 === 1 || s % 4 === 3) rollBass(t, A_MINOR[bar % 4 === 3 ? 2 : bar % 4 === 2 ? 3 : 0]);
      if (s === 4 || s === 12) clap(t);
      if (s % 2 === 0 && s % 4 !== 2) hat(t, false);
      if (bar >= 2) {
        const f = state.melody[s];
        if (f) acid(t, f, s % 4 === 3);
      }
      if (bar >= 4 && (s === 0 || s === 6 || s === 10 || s === 14)) hoover(t, A_MINOR[[5, 7, 9, 8][(s / 2) % 4 | 0] ?? 5], STEP * 3);
      if (bar === 7 && s === 0) state.melody = newMelody();
    } else {
      if (s === 0) pad(t, STEP * 32);
      if (bar === 1 && s === 8) riser(t, STEP * 8);
      if (s === 0 && bar === 0) kick(t, 0.5);
    }
    state.step += 1;
    if (state.step % 16 === 0) {
      state.barInSection += 1;
      if (state.barInSection >= sec.bars) {
        state.barInSection = 0;
        state.section = (state.section + 1) % sections.length;
      }
    }
  };

  const pump = () => {
    while (state.next < ctx.currentTime + 0.2) {
      schedule(state.next);
      state.next += STEP;
    }
  };

  return {
    ctx,
    analyser,
    start() {
      if (ctx.state === "suspended") ctx.resume();
      state.next = ctx.currentTime + 0.1;
      state.timer = setInterval(pump, 30);
    },
    stop() {
      clearInterval(state.timer);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => ctx.close(), 600);
    },
    setMuted(value) {
      master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.05);
    },
    onDrop(cb) {
      state.onDrop = cb;
    },
  };
}

export async function openCar() {
  if (document.querySelector(".car-modal")) return;
  loadCss();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const modal = document.createElement("div");
  modal.className = "car-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Vidéo secrète");
  const mp4 = new URL("../assets/secret/trajet.mp4", import.meta.url).href;
  const webm = new URL("../assets/secret/trajet.webm", import.meta.url).href;
  const ticker = "🚗 TURBO 🚗 DROP 🚗 HARDCORE 🚗 LE QG 🚗 VROUM 🚗 ";
  modal.innerHTML = `
    <canvas class="car-fx"></canvas>
    <div class="car-ticker top"><span>${ticker.repeat(4)}</span></div>
    <div class="car-ticker bottom"><span>${ticker.repeat(4)}</span></div>
    <div class="car-stage"><div class="car-frame"><video controls playsinline autoplay loop><source src="${mp4}" type="video/mp4"><source src="${webm}" type="video/webm"></video></div></div>
    <div class="car-drop">DROP</div>
    <div class="car-flash"></div>
    <div class="car-bar"><button class="car-btn" type="button" data-mute>🔊 Musique</button><button class="car-btn" type="button" data-close aria-label="Fermer">✕</button></div>`;
  document.body.append(modal);
  document.documentElement.style.overflow = "hidden";

  const video = modal.querySelector("video");
  video.volume = 0.35;
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(() => {});
  });

  let techno = null;
  try {
    techno = createTechno();
    techno.start();
  } catch {
    techno = null;
  }

  const canvas = modal.querySelector(".car-fx");
  const g = canvas.getContext("2d");
  const drop = modal.querySelector(".car-drop");
  const flash = modal.querySelector(".car-flash");
  const frame = modal.querySelector(".car-frame");
  const bins = new Uint8Array(128);
  const heads = await loadHeads();
  const faces = Array.from({ length: 9 }, (_, i) => ({ img: heads[i % heads.length], x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - 0.5) * 260, vy: (Math.random() - 0.5) * 260, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3, size: 90 + Math.random() * 70 }));
  const sparks = [];
  let kickLevel = 0;
  let spin = 0;
  let hue = 0;
  let last = performance.now();
  let raf = 0;
  let intensity = 0.55;

  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  resize();
  addEventListener("resize", resize);

  techno?.onDrop(() => {
    intensity = 1;
    drop.classList.remove("go");
    void drop.offsetWidth;
    drop.classList.add("go");
    if (!reduce) {
      flash.style.transition = "none";
      flash.style.opacity = "0.85";
      requestAnimationFrame(() => {
        flash.style.transition = "opacity 0.6s ease-out";
        flash.style.opacity = "0";
      });
    }
    for (let i = 0; i < 6; i++) faces.push({ img: heads[Math.floor(Math.random() * heads.length)], x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - 0.5) * 900, vy: (Math.random() - 0.5) * 900, rot: 0, vr: (Math.random() - 0.5) * 8, size: 80 + Math.random() * 90, temp: 6 });
    for (let i = 0; i < 120; i++) sparks.push({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - 0.5) * 1400, vy: (Math.random() - 0.5) * 1400, life: 1, hue: Math.random() * 360 });
  });

  const draw = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const W = canvas.width;
    const H = canvas.height;
    let bass = 0;
    let treble = 0;
    if (techno) {
      techno.analyser.getByteFrequencyData(bins);
      for (let i = 0; i < 5; i++) bass += bins[i];
      bass /= 5 * 255;
      for (let i = 60; i < 110; i++) treble += bins[i];
      treble /= 50 * 255;
    } else bass = 0.4 + Math.sin(now / 170) * 0.2;
    kickLevel += (bass - kickLevel) * Math.min(1, dt * 18);
    const kick = Math.max(0, Math.min(1, (kickLevel - 0.35) * 2.2));
    intensity = Math.max(0.5, intensity - dt * 0.05);
    spin += dt * (60 + kick * 400);
    hue = (hue + dt * 90) % 360;
    modal.style.setProperty("--kick", reduce ? 0 : kick.toFixed(3));
    modal.style.setProperty("--spin", `${spin}deg`);
    modal.style.setProperty("--hue", `${Math.sin(now / 400) * 25 * kick}deg`);
    g.fillStyle = `rgba(5,1,13,${0.28 + (1 - kick) * 0.2})`;
    g.fillRect(0, 0, W, H);

    const bars = 56;
    const bw = W / bars;
    for (let i = 0; i < bars; i++) {
      const v = techno ? bins[Math.floor((i / bars) * 90)] / 255 : 0.3;
      const h = v * H * 0.42 * (0.6 + intensity * 0.6);
      g.fillStyle = `hsl(${(hue + i * 6) % 360} 100% ${50 + v * 15}%)`;
      g.fillRect(i * bw + 1, H - h, bw - 2, h);
      g.fillRect(i * bw + 1, 0, bw - 2, h * 0.5);
    }

    g.save();
    g.globalCompositeOperation = "lighter";
    const lasers = 7;
    for (let i = 0; i < lasers; i++) {
      const base = Math.sin(now / 900 + i) * 0.5 + (i / lasers - 0.5) * 1.6;
      for (const sx of [0, W]) {
        g.strokeStyle = `hsla(${(hue + i * 50) % 360},100%,60%,${0.15 + kick * 0.35})`;
        g.lineWidth = 2 + kick * 6;
        g.beginPath();
        g.moveTo(sx, H);
        g.lineTo(sx + Math.sin(base + (sx ? Math.PI : 0)) * W * 1.2 + (sx ? -W * 0.5 : W * 0.5), H * (0.05 + Math.abs(Math.cos(base)) * 0.4));
        g.stroke();
      }
    }
    g.restore();

    for (let i = faces.length - 1; i >= 0; i--) {
      const f = faces[i];
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot += f.vr * dt;
      if (f.x < 0 || f.x > W) f.vx *= -1;
      if (f.y < 0 || f.y > H) f.vy *= -1;
      f.x = Math.max(0, Math.min(W, f.x));
      f.y = Math.max(0, Math.min(H, f.y));
      if (f.temp) {
        f.temp -= dt;
        if (f.temp <= 0) {
          faces.splice(i, 1);
          continue;
        }
      }
      const s = f.size * (1 + kick * 0.5);
      const r = f.img.width / f.img.height;
      g.save();
      g.globalAlpha = 0.85;
      g.translate(f.x, f.y);
      g.rotate(f.rot);
      g.drawImage(f.img, (-s * r) / 2, -s / 2, s * r, s);
      g.restore();
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.9;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      g.fillStyle = `hsla(${p.hue},100%,60%,${p.life})`;
      g.fillRect(p.x, p.y, 4, 4);
    }
    if (kick > 0.6 && Math.random() < 0.5) for (let i = 0; i < 3; i++) sparks.push({ x: W / 2 + (Math.random() - 0.5) * 300, y: H / 2 + (Math.random() - 0.5) * 200, vx: (Math.random() - 0.5) * 500, vy: (Math.random() - 0.5) * 500, life: 0.7, hue: Math.random() * 360 });
    frame.style.filter = treble > 0.25 && !reduce ? "saturate(1.3)" : "none";
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  const close = () => {
    cancelAnimationFrame(raf);
    video.pause();
    techno?.stop();
    modal.remove();
    removeEventListener("resize", resize);
    removeEventListener("keydown", onKey);
    document.documentElement.style.overflow = "";
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  addEventListener("keydown", onKey);
  modal.querySelector("[data-close]").addEventListener("click", close);
  const muteBtn = modal.querySelector("[data-mute]");
  let muted = false;
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    techno?.setMuted(muted);
    muteBtn.textContent = muted ? "🔇 Musique coupée" : "🔊 Musique";
  });
}
