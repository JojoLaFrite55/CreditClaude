import { DIFFS, readBest, saveBest } from "./songs.js";

const COLORS = ["#c24b99", "#12c4e8", "#12fa05", "#f9393f"];
const ANGLES = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];
const KEYS = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };

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

const rankFor = (acc) => (acc >= 0.95 ? "S" : acc >= 0.85 ? "A" : acc >= 0.7 ? "B" : acc >= 0.5 ? "C" : "D");

export function createRhythm(root, { song, charts, diffKey = "normal", onExit, closable = false }) {
  root.innerHTML = `
    <div class="mic-box">
      <div class="mic-video">
        <video playsinline preload="auto"><source src="${song.mp4}" type="video/mp4"><source src="${song.webm}" type="video/webm"></video>
        <div class="mic-play">
          <strong class="mic-title">${song.title}</strong>
          <div class="mic-diffs" data-diffs></div>
          <button type="button" data-start>▶ Jouer</button>
          <span class="mic-hint">← ↓ ↑ → ou touche les colonnes</span>
        </div>
        <div class="mic-count" hidden></div>
        <button class="mic-close" type="button" aria-label="Fermer" ${closable ? "" : "hidden"}>✕</button>
      </div>
      <div class="mic-stage">
        <canvas></canvas>
        <div class="mic-hud"><span data-score>0</span><span data-combo></span></div>
        <div class="mic-end">
          <div class="rank" data-rank>S</div>
          <p data-result></p>
          <div class="row"><button type="button" class="ghost" data-down>▼ Plus facile</button><button type="button" data-again>Rejouer</button><button type="button" class="ghost" data-up>▲ Plus dur</button></div>
          <div class="row"><button type="button" class="ghost" data-quit>${closable ? "Fermer" : "Menu"}</button></div>
        </div>
      </div>
    </div>`;

  const video = root.querySelector("video");
  const playLayer = root.querySelector(".mic-play");
  const countEl = root.querySelector(".mic-count");
  const stage = root.querySelector(".mic-stage");
  const canvas = root.querySelector("canvas");
  const scoreEl = root.querySelector("[data-score]");
  const comboEl = root.querySelector("[data-combo]");
  const endEl = root.querySelector(".mic-end");
  const diffsEl = root.querySelector("[data-diffs]");
  const audio = song.audio ? new Audio(song.audio) : null;
  if (audio) {
    video.muted = true;
    video.loop = true;
  }
  const clock = () => (audio ? audio.currentTime : video.currentTime);
  const setVolume = (value) => {
    (audio || video).volume = value;
  };

  let diff = DIFFS.find((item) => item.key === diffKey) || DIFFS[1];
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
  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  const chartLen = () => charts[diff.key].length;

  const renderDiffs = () => {
    diffsEl.innerHTML = DIFFS.map((item) => `<button type="button" class="${item.key === diff.key ? "on" : ""}" data-diff="${item.key}">${item.label}<small>${charts[item.key].length} notes · ×${item.mult}</small></button>`).join("");
  };
  diffsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-diff]");
    if (!button) return;
    diff = DIFFS.find((item) => item.key === button.dataset.diff);
    renderDiffs();
  });
  renderDiffs();

  const reset = () => {
    notes = charts[diff.key].map(([t, lane]) => ({ t, lane, done: false }));
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
    const t = clock();
    let best = null;
    for (const note of notes) {
      if (note.done || note.lane !== lane) continue;
      const d = Math.abs(note.t - t);
      if (d <= diff.win[2] && (!best || d < best.d)) best = { note, d };
    }
    if (!best) return;
    best.note.done = true;
    const kind = best.d <= diff.win[0] ? "parfait" : best.d <= diff.win[1] ? "bien" : "ok";
    counts[kind] += 1;
    combo += 1;
    maxCombo = Math.max(maxCombo, combo);
    score += Math.round(((kind === "parfait" ? 350 : kind === "bien" ? 200 : 100) + Math.min(combo, 30) * 5) * diff.mult);
    say(kind === "parfait" ? "PARFAIT" : kind === "bien" ? "BIEN" : "OK", kind === "parfait" ? "#ffe45e" : kind === "bien" ? "#5ee3ff" : "#cfcfcf");
    setVolume(1);
    scoreEl.textContent = String(score);
    comboEl.textContent = combo > 1 ? `${combo} combo` : "";
  };

  const miss = (note) => {
    note.done = true;
    counts.rate += 1;
    combo = 0;
    comboEl.textContent = "";
    say("RATÉ", "#ff5a6a");
    setVolume(0.25);
    missUntil = performance.now() + 450;
  };

  const drawReceptors = (now, rw, ry, size) => {
    for (let lane = 0; lane < 4; lane++) {
      const down = now - pressed[lane] < 130;
      g.save();
      g.translate(rw * lane + rw / 2, ry);
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
    const t = clock();
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
        if (t - note.t > diff.win[2]) {
          miss(note);
          continue;
        }
        const k = (note.t - t) / diff.lead;
        if (k > 1.05) continue;
        g.save();
        g.translate(rw * note.lane + rw / 2, ry - k * (ry + size));
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
        setVolume(1);
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

  const stopMedia = () => {
    video.pause();
    audio?.pause();
  };

  const finish = () => {
    if (state !== "play") return;
    state = "end";
    for (const note of notes) if (!note.done) miss(note);
    stopMedia();
    const total = chartLen();
    const acc = (counts.parfait + counts.bien * 0.7 + counts.ok * 0.4) / total;
    const best = readBest(song.id, diff.key);
    if (score > best) saveBest(song.id, diff.key, score);
    const index = DIFFS.indexOf(diff);
    root.querySelector("[data-rank]").textContent = rankFor(acc);
    root.querySelector("[data-result]").innerHTML = `${diff.label} · ${score} points · ${Math.round(acc * 100)} % de précision<br>Combo max ${maxCombo} · ${counts.parfait} parfaits · ${counts.rate} ratés<br>${score > best ? "Nouveau record !" : `Record : ${best}`}`;
    root.querySelector("[data-down]").disabled = index === 0;
    root.querySelector("[data-up]").disabled = index === DIFFS.length - 1;
    endEl.classList.add("is-on");
  };

  const startRun = () => {
    reset();
    state = "count";
    playLayer.hidden = true;
    stopMedia();
    video.currentTime = 0;
    if (audio) audio.currentTime = 0;
    setVolume(1);
    countEl.hidden = false;
    let n = 3;
    countEl.textContent = String(n);
    clearInterval(countTimer);
    countTimer = setInterval(() => {
      n -= 1;
      if (n > 0) {
        countEl.textContent = String(n);
        return;
      }
      clearInterval(countTimer);
      countEl.hidden = true;
      state = "play";
      video.play().catch(() => {});
      audio?.play().catch(() => {});
    }, 700);
  };

  const shift = (step) => {
    const index = DIFFS.indexOf(diff) + step;
    if (index < 0 || index >= DIFFS.length) return;
    diff = DIFFS[index];
    renderDiffs();
    startRun();
  };

  const onKey = (event) => {
    if (event.key === "Escape") {
      onExit?.();
      return;
    }
    if (event.key in KEYS) {
      event.preventDefault();
      if (!event.repeat) judge(KEYS[event.key]);
    }
  };

  document.addEventListener("keydown", onKey);
  (audio || video).addEventListener("ended", finish);
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = stage.getBoundingClientRect();
    judge(Math.min(3, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * 4))));
  });
  root.querySelector("[data-start]").addEventListener("click", startRun);
  root.querySelector("[data-again]").addEventListener("click", startRun);
  root.querySelector("[data-down]").addEventListener("click", () => shift(-1));
  root.querySelector("[data-up]").addEventListener("click", () => shift(1));
  root.querySelector("[data-quit]").addEventListener("click", () => onExit?.());
  root.querySelector(".mic-close").addEventListener("click", () => onExit?.());

  reset();
  frame();

  return {
    destroy() {
      clearInterval(countTimer);
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("keydown", onKey);
      stopMedia();
      root.innerHTML = "";
    },
  };
}
