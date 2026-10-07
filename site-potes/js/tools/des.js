import { createSfx, loadHeads, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();

const diceBox = document.getElementById("dice");
const total = document.getElementById("total");
const kind = document.getElementById("kind");
const qty = document.getElementById("qty");
let rolling = false;

document.getElementById("roll").addEventListener("click", () => {
  sfx.init();
  if (rolling) return;
  rolling = true;
  const sides = Number(kind.value);
  const n = Math.max(1, Math.min(10, Number(qty.value) || 1));
  diceBox.innerHTML = "";
  const faces = [];
  for (let i = 0; i < n; i++) {
    const die = document.createElement("div");
    die.className = "die";
    die.textContent = "?";
    diceBox.append(die);
    faces.push(die);
  }
  let ticks = 0;
  const interval = setInterval(() => {
    ticks += 1;
    faces.forEach((die) => (die.textContent = 1 + Math.floor(Math.random() * sides)));
    sfx.tick();
    if (ticks > 12) {
      clearInterval(interval);
      let sum = 0;
      faces.forEach((die) => {
        const value = 1 + Math.floor(Math.random() * sides);
        die.textContent = value;
        sum += value;
        if (value === sides) die.classList.add("max");
        if (value === 1) die.classList.add("min");
      });
      total.textContent = n > 1 ? `Total : ${sum}` : `Résultat : ${sum}`;
      sfx.coin();
      rolling = false;
    }
  }, 70);
});

const coin = document.getElementById("coin");
const coinResult = document.getElementById("coin-result");
const faceNode = document.getElementById("coin-face");
const head = pick(heads);
if (head instanceof HTMLCanvasElement) {
  const copy = document.createElement("canvas");
  copy.width = head.width;
  copy.height = head.height;
  copy.getContext("2d").drawImage(head, 0, 0);
  faceNode.append(copy);
} else {
  const img = document.createElement("img");
  img.src = head.src;
  img.alt = "";
  faceNode.append(img);
}
let flips = 0;
let coinBusy = false;
document.getElementById("flip").addEventListener("click", () => {
  sfx.init();
  if (coinBusy) return;
  coinBusy = true;
  coinResult.textContent = "…";
  const face = Math.random() < 0.5;
  flips += 1;
  const turns = 5 + Math.floor(Math.random() * 3);
  coin.style.transition = "transform 1.4s cubic-bezier(0.2, 0.7, 0.2, 1)";
  coin.style.transform = `rotateY(${(flips * turns * 360) + (face ? 0 : 180)}deg)`;
  for (let i = 0; i < 6; i++) setTimeout(() => sfx.tick(), i * 200);
  setTimeout(() => {
    coinResult.textContent = face ? "Face !" : "Pile !";
    sfx.win();
    coin.style.transition = "none";
    coin.style.transform = `rotateY(${face ? 0 : 180}deg)`;
    flips = 0;
    coinBusy = false;
  }, 1500);
});
