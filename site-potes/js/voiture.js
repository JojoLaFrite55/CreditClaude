import { loadHeads } from "./faces.js";

function loadCss() {
  if (document.querySelector("link[data-car]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/voiture.css", import.meta.url).href;
  link.dataset.car = "1";
  document.head.append(link);
}

const TRACK_URL = new URL("../assets/secret/stadium-rave.mp3", import.meta.url).href;

async function createRave() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const buffer = await fetch(TRACK_URL).then((response) => response.arrayBuffer()).then((data) => ctx.decodeAudioData(data));
  const master = ctx.createGain();
  master.gain.value = 1;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.55;
  master.connect(analyser);
  analyser.connect(ctx.destination);
  const state = { source: null, startedAt: 0, timer: 0, lastLoop: -1, onDrop: () => {} };

  return {
    ctx,
    analyser,
    start() {
      if (ctx.state === "suspended") ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(master);
      source.start();
      state.source = source;
      state.startedAt = ctx.currentTime;
      state.lastLoop = -1;
      state.timer = setInterval(() => {
        const loop = Math.floor((ctx.currentTime - state.startedAt) / buffer.duration);
        if (loop !== state.lastLoop) {
          state.lastLoop = loop;
          state.onDrop();
        }
      }, 40);
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
    techno = await createRave();
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
