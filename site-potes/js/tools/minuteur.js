import { createSfx, mountSoundButton } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);

const tabs = [...document.querySelectorAll("[data-tab]")];
const panels = [...document.querySelectorAll("[data-panel]")];
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    sfx.init();
    sfx.click();
    tabs.forEach((other) => other.setAttribute("aria-selected", String(other === tab)));
    panels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== tab.dataset.tab));
  }),
);

const format = (ms, tenths = false) => {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const t = Math.floor((total % 1000) / 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${tenths ? `.${t}` : ""}`;
};

const display = document.getElementById("tdisplay");
const minutes = document.getElementById("mm");
const seconds = document.getElementById("ss");
const startBtn = document.getElementById("tstart");
const timer = { remaining: 60000, end: 0, id: 0, running: false };

function setRemaining(ms) {
  timer.remaining = ms;
  display.textContent = format(ms);
  display.classList.remove("done");
}

function readInputs() {
  const total = (Number(minutes.value) || 0) * 60 + (Number(seconds.value) || 0);
  setRemaining(Math.max(1, total) * 1000);
}

function stopTimer() {
  clearInterval(timer.id);
  timer.running = false;
  startBtn.textContent = "Démarrer";
}

startBtn.addEventListener("click", () => {
  sfx.init();
  if (timer.running) {
    timer.remaining = timer.end - performance.now();
    stopTimer();
    return;
  }
  if (timer.remaining <= 0) readInputs();
  timer.end = performance.now() + timer.remaining;
  timer.running = true;
  startBtn.textContent = "Pause";
  timer.id = setInterval(() => {
    const left = timer.end - performance.now();
    display.textContent = format(Math.ceil(left / 1000) * 1000);
    if (left <= 0) {
      stopTimer();
      timer.remaining = 0;
      display.textContent = "00:00";
      display.classList.add("done");
      let n = 0;
      const beep = setInterval(() => {
        sfx.tone("square", n % 2 ? 660 : 880, n % 2 ? 660 : 880, 0.18, 0.22);
        if (++n > 7) clearInterval(beep);
      }, 260);
    }
  }, 100);
});

document.getElementById("treset").addEventListener("click", () => {
  stopTimer();
  readInputs();
});
document.querySelectorAll("[data-sec]").forEach((button) =>
  button.addEventListener("click", () => {
    const sec = Number(button.dataset.sec);
    minutes.value = Math.floor(sec / 60);
    seconds.value = sec % 60;
    stopTimer();
    readInputs();
  }),
);
minutes.addEventListener("input", () => !timer.running && readInputs());
seconds.addEventListener("input", () => !timer.running && readInputs());
readInputs();

const cdisplay = document.getElementById("cdisplay");
const laps = document.getElementById("laps");
const cstart = document.getElementById("cstart");
const chrono = { base: 0, start: 0, id: 0, running: false };
const elapsed = () => chrono.base + (chrono.running ? performance.now() - chrono.start : 0);

cstart.addEventListener("click", () => {
  sfx.init();
  sfx.click();
  if (chrono.running) {
    chrono.base = elapsed();
    chrono.running = false;
    clearInterval(chrono.id);
    cstart.textContent = "Reprendre";
  } else {
    chrono.start = performance.now();
    chrono.running = true;
    cstart.textContent = "Pause";
    chrono.id = setInterval(() => (cdisplay.textContent = format(elapsed(), true)), 50);
  }
});
document.getElementById("clap").addEventListener("click", () => {
  if (!elapsed()) return;
  sfx.tick();
  const item = document.createElement("li");
  item.innerHTML = `<span>Tour ${laps.children.length + 1}</span><strong>${format(elapsed(), true)}</strong>`;
  laps.prepend(item);
});
document.getElementById("creset").addEventListener("click", () => {
  clearInterval(chrono.id);
  chrono.base = 0;
  chrono.running = false;
  cstart.textContent = "Démarrer";
  cdisplay.textContent = "00:00.0";
  laps.innerHTML = "";
});
