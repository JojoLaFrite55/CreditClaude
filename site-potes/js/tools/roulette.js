import { createSfx, mountSoundButton, setupCanvas } from "../arcade/kit.js";

const KEY = "qg-roulette";
const SIZE = 640;
const COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#8e44ad", "#e9c46a", "#06d6a0", "#ef476f", "#118ab2", "#ff8fab"];
const canvas = document.getElementById("wheel");
const g = setupCanvas(canvas, SIZE, SIZE);
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const input = document.getElementById("options");
const result = document.getElementById("result");
const history = document.getElementById("history");
const spinButton = document.getElementById("spin");
const removeBox = document.getElementById("remove");

let saved = "Pote 1\nPote 2\nPote 3\nPote 4\nPote 5";
try {
  saved = localStorage.getItem(KEY) ?? saved;
} catch {
  saved = saved;
}
input.value = saved;

const state = { angle: 0, spinning: false };
const options = () => input.value.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 24);

function draw() {
  const list = options();
  const c = SIZE / 2;
  g.clearRect(0, 0, SIZE, SIZE);
  if (!list.length) {
    g.fillStyle = "#999";
    g.font = '600 22px "Inter", system-ui, sans-serif';
    g.textAlign = "center";
    g.fillText("Ajoute des choix à droite", c, c);
    return;
  }
  const slice = (Math.PI * 2) / list.length;
  g.save();
  g.translate(c, c);
  g.rotate(state.angle);
  list.forEach((label, index) => {
    g.fillStyle = COLORS[index % COLORS.length];
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, c - 14, index * slice, (index + 1) * slice);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 3;
    g.stroke();
    g.save();
    g.rotate(index * slice + slice / 2);
    g.textAlign = "right";
    g.fillStyle = "#fff";
    g.font = `700 ${list.length > 14 ? 16 : 22}px "Inter", system-ui, sans-serif`;
    g.shadowColor = "rgba(0,0,0,0.4)";
    g.shadowBlur = 4;
    g.fillText(label.length > 20 ? `${label.slice(0, 19)}…` : label, c - 36, 7);
    g.restore();
  });
  g.restore();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(c, c, 34, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#121212";
  g.lineWidth = 4;
  g.stroke();
  g.fillStyle = "#121212";
  g.beginPath();
  g.moveTo(c + c - 4, c);
  g.lineTo(c + c - 46, c - 18);
  g.lineTo(c + c - 46, c + 18);
  g.closePath();
  g.fill();
}

function spin() {
  sfx.init();
  const list = options();
  if (state.spinning || list.length < 2) {
    if (list.length < 2) result.textContent = "Il faut au moins 2 choix.";
    return;
  }
  state.spinning = true;
  spinButton.disabled = true;
  result.textContent = "…";
  const slice = (Math.PI * 2) / list.length;
  const winner = Math.floor(Math.random() * list.length);
  const pointerAngle = (winner + 0.5 + (Math.random() - 0.5) * 0.6) * slice;
  const target = (((-pointerAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const turns = 6 + Math.floor(Math.random() * 4);
  const start = state.angle;
  const startMod = ((start % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const end = start + turns * Math.PI * 2 + ((target - startMod + Math.PI * 2) % (Math.PI * 2));
  const duration = 5200;
  const t0 = performance.now();
  let lastIndex = -1;
  const frame = (now) => {
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - (1 - t) ** 4;
    state.angle = start + (end - start) * eased;
    const pointerAngle = ((-state.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const index = Math.floor(pointerAngle / slice) % list.length;
    if (index !== lastIndex) {
      lastIndex = index;
      sfx.tick();
    }
    draw();
    if (t < 1) requestAnimationFrame(frame);
    else finish(list, index);
  };
  requestAnimationFrame(frame);
}

function finish(list, index) {
  state.spinning = false;
  spinButton.disabled = false;
  const winner = list[index];
  result.textContent = winner;
  sfx.win();
  const item = document.createElement("li");
  item.textContent = winner;
  history.prepend(item);
  while (history.children.length > 8) history.lastChild.remove();
  if (removeBox.checked) {
    const left = options();
    left.splice(left.indexOf(winner), 1);
    input.value = left.join("\n");
    persist();
    setTimeout(draw, 600);
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, input.value);
  } catch {
    return;
  }
}

input.addEventListener("input", () => {
  persist();
  draw();
});
spinButton.addEventListener("click", spin);
canvas.addEventListener("click", spin);
document.getElementById("shuffle").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  const list = options().sort(() => Math.random() - 0.5);
  input.value = list.join("\n");
  persist();
  draw();
});
draw();
