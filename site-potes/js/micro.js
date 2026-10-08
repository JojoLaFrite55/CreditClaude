const LEAD = 1.5;
const HIT = { parfait: 0.065, bien: 0.115, ok: 0.17 };
const COLORS = ["#c24b99", "#12c4e8", "#12fa05", "#f9393f"];
const ANGLES = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];
const KEYS = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
const BEST_KEY = "qg-best-micro";

function loadCss() {
  if (document.querySelector("link[data-mic]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/micro.css", import.meta.url).href;
  link.dataset.mic = "1";
  document.head.append(link);
}

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const saveBest = (value) => {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    return;
  }
};

function arrowPath(g, size) {
  const s = size / 2;
  g.beginPath();
  g.moveTo(s, 0);
  g.lineTo(-s * 0.2, -s);
  g.lineTo(-s * 0.2, -s * 0.45);
  g.lineTo(-s, -s * 0.45);
  g.lineTo(-s, s * 0.45);
  g.lineTo(-s * 0.2, s * 0.45);
  g.lineTo(-s * 0.2, s);
  g.closePath();
}

export async function openMicro() {
  if (document.querySelector(".mic")) return;
  loadCss();
  const base = (name) => new URL(`../assets/secret/${name}`, import.meta.url).href;
  const chart = await fetch(base("micro-chart.json")).then((response) => response.json());

  const modal = document.createElement("div");
  modal.className = "mic";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Micro");
  modal.innerHTML = `
    <div class="mic-box">
      <div class="mic-video">
        <video playsinline preload="auto"><source src="${base("micro.mp4")}" type="video/mp4"><source src="${base("micro.webm")}" type="video/webm"></video>
        <div class="mic-play"><button type="button" data-start>▶ Jouer</button></div>
        <div class="mic-count" hidden></div>
        <button class="mic-close" type="button" aria-label="Fermer">✕</button>
      </div>
      <div class="mic-stage">
        <canvas></canvas>
        <div class="mic-hud"><span data-score>0</span><span data-combo></span></div>
        <div class="mic-end">
          <div class="rank" data-rank>S</div>
          <p data-result></p>
          <div class="row"><button type="button" data-again>Rejouer</button><button type="button" class="ghost" data-quit>Fermer</button></div>
        </div>
      </div>
    </div>`;
  document.body.append(modal);
  document.body.style.overflow = "hidden";

  const video = modal.querySelector("video");
  const playLayer = modal.querySelector(".mic-play");
  const countEl = modal.querySelector(".mic-count");
  const stage = modal.querySelector(".mic-stage");
  const canvas = modal.querySelector("canvas");
  const scoreEl = modal.querySelector("[data-score]");
  const comboEl = modal.querySelector("[data-combo]");
  const endEl = modal.querySelector(".mic-end");
  video.currentTime = 0.05;

  let g = canvas.getContext("2d");
  let W = 320;
  let H = 420;
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = Math.max(1, W * dpr);
    canvas.height = Math.max(1, H * dpr);
    g = canvas.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  let notes = [];
  let state = "idle";
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let counts = { parfait: 0, bien: 0, ok: 0, rate: 0 };
  let pressed = [0, 0, 0, 0];
  let feedback = { text: "", color: "#fff", at: -10 };
  let raf = 0;
  let missUntil = 0;
  let countTimer = 0;

  const reset = () => {
    notes = chart.map(([t, lane]) => ({ t, lane, done: false }));
    score = 0;
    combo = 0;
    maxCombo = 0;
    counts = { parfait: 0, bien: 0, ok: 0, rate: 0 };
    pressed = [0, 0, 0, 0];
    feedback = { text: "", color: "#fff", at: -10 };
    scoreEl.textContent = "0";
    comboEl.textContent = "";
    endEl.classList.remove("is-on");
  };

  const say = (text, color) => {
    feedback = { text, color, at: performance.now() };
  };

  const judge = (lane) => {
    if (state !== "play") return;
    pressed[lane] = performance.now();
    const t = video.currentTime;
    let best = null;
    for (const note of notes) {
      if (note.done || note.lane !== lane) continue;
      const d = Math.abs(note.t - t);
      if (d <= HIT.ok && (!best || d < best.d)) best = { note, d };
    }
    if (!best) return;
    best.note.done = true;
    const kind = best.d <= HIT.parfait ? "parfait" : best.d <= HIT.bien ? "bien" : "ok";
    counts[kind] += 1;
    combo += 1;
    maxCombo = Math.max(maxCombo, combo);
    score += (kind === "parfait" ? 350 : kind === "bien" ? 200 : 100) + Math.min(combo, 30) * 5;
    say(kind === "parfait" ? "PARFAIT" : kind === "bien" ? "BIEN" : "OK", kind === "parfait" ? "#ffe45e" : kind === "bien" ? "#5ee3ff" : "#cfcfcf");
    video.volume = 1;
    scoreEl.textContent = String(score);
    comboEl.textContent = combo > 1 ? `${combo} combo` : "";
  };

  const miss = (note) => {
    note.done = true;
    counts.rate += 1;
    combo = 0;
    comboEl.textContent = "";
    say("RATÉ", "#ff5a6a");
    video.volume = 0.25;
    missUntil = performance.now() + 450;
  };

  const drawReceptors = (now, rw, ry, size) => {
    for (let lane = 0; lane < 4; lane++) {
      const cx = rw * lane + rw / 2;
      const down = now - pressed[lane] < 130;
      g.save();
      g.translate(cx, ry);
      g.rotate(ANGLES[lane]);
      arrowPath(g, size * (down ? 1.08 : 1));
      g.fillStyle = down ? COLORS[lane] : "rgba(255,255,255,0.06)";
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = down ? "#fff" : "rgba(255,255,255,0.45)";
      g.stroke();
      g.restore();
    }
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const t = video.currentTime;
    g.clearRect(0, 0, W, H);
    const rw = W / 4;
    const size = Math.min(rw * 0.78, 64);
    const ry = H - size * 0.9 - 14;
    for (let lane = 1; lane < 4; lane++) {
      g.fillStyle = "rgba(255,255,255,0.05)";
      g.fillRect(rw * lane - 0.5, 0, 1, H);
    }
    drawReceptors(now, rw, ry, size);
    if (state === "play") {
      for (const note of notes) {
        if (note.done) continue;
        if (t - note.t > HIT.ok) {
          miss(note);
          continue;
        }
        const k = (note.t - t) / LEAD;
        if (k > 1.05) continue;
        const y = ry - k * (ry + size);
        g.save();
        g.translate(rw * note.lane + rw / 2, y);
        g.rotate(ANGLES[note.lane]);
        arrowPath(g, size);
        g.fillStyle = COLORS[note.lane];
        g.fill();
        g.lineWidth = 3;
        g.strokeStyle = "rgba(255,255,255,0.9)";
        g.stroke();
        g.restore();
      }
      if (missUntil && now > missUntil) {
        video.volume = 1;
        missUntil = 0;
      }
    }
    const age = now - feedback.at;
    if (age < 600) {
      g.save();
      g.globalAlpha = 1 - age / 600;
      g.font = "900 22px system-ui, sans-serif";
      g.textAlign = "center";
      g.fillStyle = feedback.color;
      g.fillText(feedback.text, W / 2, ry - size * 0.9 - age * 0.03);
      g.restore();
    }
  };

  const rankFor = (acc) => (acc >= 0.95 ? "S" : acc >= 0.85 ? "A" : acc >= 0.7 ? "B" : acc >= 0.5 ? "C" : "D");

  const finish = () => {
    if (state !== "play") return;
    state = "end";
    for (const note of notes) if (!note.done) miss(note);
    const total = chart.length;
    const weighted = counts.parfait + counts.bien * 0.7 + counts.ok * 0.4;
    const acc = weighted / total;
    const best = readBest();
    if (score > best) saveBest(score);
    modal.querySelector("[data-rank]").textContent = rankFor(acc);
    modal.querySelector("[data-result]").innerHTML = `${score} points · ${Math.round(acc * 100)} % de précision<br>Combo max ${maxCombo} · ${counts.parfait} parfaits · ${counts.rate} ratés<br>${score > best ? "Nouveau record !" : `Record : ${best}`}`;
    endEl.classList.add("is-on");
    playLayer.hidden = true;
  };

  const startRun = () => {
    reset();
    state = "count";
    playLayer.hidden = true;
    video.pause();
    video.currentTime = 0;
    video.volume = 1;
    countEl.hidden = false;
    let n = 3;
    countEl.textContent = String(n);
    countTimer = setInterval(() => {
      n -= 1;
      if (n > 0) {
        countEl.textContent = String(n);
        return;
      }
      clearInterval(countTimer);
      countEl.hidden = true;
      state = "play";
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }, 700);
  };

  const onKey = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key in KEYS) {
      event.preventDefault();
      if (!event.repeat) judge(KEYS[event.key]);
    }
  };

  const close = () => {
    clearInterval(countTimer);
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("keydown", onKey);
    video.pause();
    modal.remove();
    document.body.style.overflow = "";
  };

  document.addEventListener("keydown", onKey);
  video.addEventListener("ended", finish);
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = stage.getBoundingClientRect();
    judge(Math.min(3, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * 4))));
  });
  modal.querySelector("[data-start]").addEventListener("click", startRun);
  modal.querySelector("[data-again]").addEventListener("click", startRun);
  modal.querySelector("[data-quit]").addEventListener("click", close);
  modal.querySelector(".mic-close").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });

  reset();
  frame();
}
