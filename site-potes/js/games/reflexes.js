import { createSfx, getBest, mountSoundButton, setBest } from "../arcade/kit.js";

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

const pad = document.getElementById("rpad");
const rtext = document.getElementById("rtext");
const rlist = document.getElementById("rlist");
const rbest = document.getElementById("rbest");
const ROUNDS = 5;
const state = { phase: "idle", timer: null, start: 0, times: [] };
const best = () => getBest("reflexes");
rbest.textContent = best() ? `${best()} ms` : "—";

function setPad(kind, text) {
  pad.className = `rpad ${kind}`;
  rtext.textContent = text;
}

function arm() {
  state.phase = "wait";
  setPad("wait", "Attends le vert…");
  state.timer = setTimeout(() => {
    state.phase = "go";
    state.start = performance.now();
    setPad("go", "CLIQUE !");
    sfx.tone("square", 880, 880, 0.12, 0.15);
  }, 1200 + Math.random() * 2800);
}

function renderList() {
  rlist.innerHTML = state.times.map((time, index) => `<li><span>Essai ${index + 1}</span><strong>${time} ms</strong></li>`).join("");
}

pad.addEventListener("pointerdown", () => {
  sfx.init();
  if (state.phase === "idle" || state.phase === "done") {
    state.times = [];
    renderList();
    arm();
  } else if (state.phase === "wait") {
    clearTimeout(state.timer);
    state.phase = "early";
    setPad("early", "Trop tôt ! Clique pour recommencer l'essai.");
    sfx.hit();
  } else if (state.phase === "early") {
    arm();
  } else if (state.phase === "go") {
    const time = Math.round(performance.now() - state.start);
    state.times.push(time);
    renderList();
    sfx.pop();
    if (state.times.length >= ROUNDS) {
      const average = Math.round(state.times.reduce((a, b) => a + b, 0) / ROUNDS);
      const record = !best() || average < best();
      if (record) setBest("reflexes", average);
      rbest.textContent = `${best()} ms`;
      state.phase = "done";
      setPad("idle", `Moyenne : ${average} ms${record ? " — nouveau record !" : ""}. Clique pour rejouer.`);
      sfx.win();
    } else {
      state.phase = "between";
      setPad("idle", `${time} ms. Clique pour l'essai suivant.`);
    }
  } else if (state.phase === "between") arm();
});

const cpad = document.getElementById("cpad");
const ctime = document.getElementById("ctime");
const ccount = document.getElementById("ccount");
const cbest = document.getElementById("cbest");
const cstate = { phase: "idle", clicks: 0, start: 0, raf: 0 };
const DURATION = 5;
cbest.textContent = getBest("cps") ? `${(getBest("cps") / 10).toFixed(1).replace(".", ",")} clics/s` : "—";

function tick() {
  const elapsed = (performance.now() - cstate.start) / 1000;
  ctime.textContent = Math.max(0, DURATION - elapsed).toFixed(1);
  if (elapsed >= DURATION) {
    cstate.phase = "idle";
    const cps = cstate.clicks / DURATION;
    const record = Math.round(cps * 10) > getBest("cps");
    if (record) setBest("cps", Math.round(cps * 10));
    cbest.textContent = `${(getBest("cps") / 10).toFixed(1).replace(".", ",")} clics/s`;
    cpad.textContent = `${cstate.clicks} clics, soit ${cps.toFixed(1).replace(".", ",")} par seconde${record ? " — record !" : ""}. Reclique pour rejouer.`;
    sfx.win();
    return;
  }
  cstate.raf = requestAnimationFrame(tick);
}

cpad.addEventListener("pointerdown", () => {
  sfx.init();
  if (cstate.phase === "idle") {
    cstate.phase = "run";
    cstate.clicks = 0;
    cstate.start = performance.now();
    cpad.textContent = "Clique, clique, clique !";
    ccount.textContent = "0";
    tick();
  }
  if (cstate.phase === "run") {
    cstate.clicks += 1;
    ccount.textContent = cstate.clicks;
    sfx.tick();
  }
});
