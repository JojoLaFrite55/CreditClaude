import { createSfx } from "../arcade/kit.js";

const sfx = createSfx();
const { tone, noise } = sfx;

const SOUNDS = [
  { name: "Corne de brume", play: () => [0, 0.02, 0.04].forEach((d) => tone("sawtooth", 440 + d * 400, 430, 1.0, 0.12, d)) },
  { name: "Trombone triste", play: () => [[311, 0], [294, 0.4], [277, 0.8], [247, 1.2]].forEach(([f, d], i) => tone("sawtooth", f, i === 3 ? f * 0.85 : f, i === 3 ? 1.1 : 0.38, 0.2, d)) },
  { name: "Vine boom", play: () => { tone("sine", 90, 28, 1.2, 1); noise(0.6, 0.7, "lowpass", 2500, 90); } },
  { name: "Bruh", play: () => { tone("sawtooth", 160, 95, 0.55, 0.28); tone("square", 330, 190, 0.4, 0.1); } },
  { name: "Ba-dum-tss", play: () => { tone("sine", 140, 60, 0.12, 0.7); tone("sine", 140, 60, 0.12, 0.7, 0.18); noise(0.5, 0.35, "highpass", 6000, 4000, 0.4); } },
  { name: "Applaudissements", play: () => { for (let i = 0; i < 40; i++) noise(0.06, 0.18, "bandpass", 1800 + Math.random() * 2500, 2500, i * 0.05 + Math.random() * 0.04, 1.2); } },
  { name: "Sirène de police", play: () => { for (let i = 0; i < 4; i++) { tone("sawtooth", 650, 900, 0.35, 0.16, i * 0.7); tone("sawtooth", 900, 650, 0.35, 0.16, i * 0.7 + 0.35); } } },
  { name: "Erreur", play: () => { tone("square", 660, 660, 0.12, 0.15); tone("square", 440, 440, 0.2, 0.15, 0.14); } },
  { name: "Prout royal", play: () => { tone("sawtooth", 90, 55, 0.7, 0.4); tone("square", 70, 40, 0.8, 0.25); noise(0.7, 0.25, "lowpass", 400, 120); } },
  { name: "Boing", play: () => tone("sine", 160, 760, 0.45, 0.35) },
  { name: "Pièce", play: () => { tone("square", 988, 988, 0.08, 0.14); tone("square", 1319, 1319, 0.4, 0.14, 0.08); } },
  { name: "Game over", play: () => [392, 330, 262, 196, 165].forEach((f, i) => tone("triangle", f, f * 0.96, 0.3, 0.22, i * 0.22)) },
  { name: "Victoire", play: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone("square", f, f, 0.14, 0.12, i * 0.12)) },
  { name: "Laser", play: () => { tone("sawtooth", 1800, 120, 0.4, 0.22); } },
  { name: "Explosion", play: () => { noise(1.3, 0.9, "lowpass", 3200, 70); tone("sine", 90, 24, 1.1, 1); } },
  { name: "Suspense", play: () => { for (let i = 0; i < 6; i++) { tone("sine", 70, 70, 0.3, 0.5, i * 0.5); tone("sine", 74, 74, 0.3, 0.4, i * 0.5 + 0.22); } } },
  { name: "Tada", play: () => { [523, 659, 784].forEach((f, i) => tone("triangle", f, f, 0.12, 0.2, i * 0.09)); tone("triangle", 1047, 1047, 0.9, 0.22, 0.3); tone("sine", 523, 523, 0.9, 0.2, 0.3); } },
  { name: "Téléphone", play: () => { for (let i = 0; i < 8; i++) { tone("square", 1400, 1400, 0.05, 0.1, i * 0.1); tone("square", 1700, 1700, 0.05, 0.1, i * 0.1 + 0.05); } } },
  { name: "Hélicoptère", play: () => { for (let i = 0; i < 20; i++) noise(0.05, 0.4, "lowpass", 250, 150, i * 0.075); } },
  { name: "Coup de gong", play: () => { tone("sine", 110, 108, 2.6, 0.5); tone("sine", 233, 230, 2.2, 0.25); tone("sine", 340, 338, 1.8, 0.15); noise(0.15, 0.4, "bandpass", 900, 600); } },
];

const grid = document.getElementById("pads");
SOUNDS.forEach((sound, index) => {
  const pad = document.createElement("button");
  pad.type = "button";
  pad.className = "pad";
  pad.innerHTML = `<span class="pad-key">${index < 9 ? index + 1 : ""}</span><span>${sound.name}</span>`;
  const play = () => {
    sfx.init();
    sound.play();
    pad.classList.add("hit");
    setTimeout(() => pad.classList.remove("hit"), 140);
  };
  pad.addEventListener("click", play);
  pad.dataset.index = index;
  grid.append(pad);
});

addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  const n = Number(event.key);
  if (n >= 1 && n <= 9) grid.children[n - 1].click();
});

const mute = document.getElementById("sound");
const label = () => (mute.textContent = sfx.isMuted() ? "Son : coupé" : "Son : activé");
label();
mute.addEventListener("click", () => {
  sfx.init();
  sfx.toggle();
  label();
});
