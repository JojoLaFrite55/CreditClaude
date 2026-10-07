import { createSfx, loadMemeModels, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();
const MOVES = { pierre: "✊", feuille: "✋", ciseaux: "✌️" };
const BEATS = { pierre: "ciseaux", feuille: "pierre", ciseaux: "feuille" };
const TARGET = 5;
const youEl = document.getElementById("you");
const cpuEl = document.getElementById("cpu");
const youMove = document.getElementById("yourmove");
const cpuMove = document.getElementById("cpumove");
const youScore = document.getElementById("score-you");
const cpuScore = document.getElementById("score-cpu");
const statusEl = document.getElementById("status");
const state = { you: 0, cpu: 0, over: false, busy: false, history: [] };

const face = (container, image) => {
  container.innerHTML = "";
  const node = document.createElement(image instanceof HTMLCanvasElement ? "canvas" : "img");
  if (image instanceof HTMLCanvasElement) {
    node.width = image.width;
    node.height = image.height;
    node.getContext("2d").drawImage(image, 0, 0);
  } else {
    node.src = image.src;
    node.alt = "";
  }
  container.append(node);
};
face(youEl, models[0]);
face(cpuEl, models[1 % models.length]);

function cpuChoice() {
  const last = state.history.at(-1);
  if (last && Math.random() < 0.4) return Object.keys(BEATS).find((m) => BEATS[m] === last);
  return pick(Object.keys(MOVES));
}

function play(move) {
  sfx.init();
  if (state.over || state.busy) return;
  state.busy = true;
  youMove.textContent = "✊";
  cpuMove.textContent = "✊";
  youMove.classList.add("shake");
  cpuMove.classList.add("shake");
  sfx.tick();
  setTimeout(() => {
    youMove.classList.remove("shake");
    cpuMove.classList.remove("shake");
    const cpu = cpuChoice();
    state.history.push(move);
    youMove.textContent = MOVES[move];
    cpuMove.textContent = MOVES[cpu];
    if (move === cpu) {
      statusEl.textContent = "Égalité !";
      sfx.click();
    } else if (BEATS[move] === cpu) {
      state.you += 1;
      statusEl.textContent = `${move} bat ${cpu} : point pour toi !`;
      sfx.coin();
    } else {
      state.cpu += 1;
      statusEl.textContent = `${cpu} bat ${move} : point pour l'ordi.`;
      sfx.bonk();
    }
    youScore.textContent = state.you;
    cpuScore.textContent = state.cpu;
    if (state.you === TARGET || state.cpu === TARGET) {
      state.over = true;
      statusEl.textContent = state.you === TARGET ? "Tu as gagné la manche !" : "L'ordinateur gagne la manche.";
      state.you === TARGET ? sfx.win() : sfx.lose();
      document.getElementById("restart").classList.remove("hidden");
    }
    state.busy = false;
  }, 600);
}

document.querySelectorAll("[data-move]").forEach((button) => button.addEventListener("click", () => play(button.dataset.move)));
document.getElementById("restart").addEventListener("click", (event) => {
  sfx.init();
  sfx.click();
  Object.assign(state, { you: 0, cpu: 0, over: false, history: [] });
  youScore.textContent = "0";
  cpuScore.textContent = "0";
  youMove.textContent = "?";
  cpuMove.textContent = "?";
  statusEl.textContent = `Premier à ${TARGET} points. Fais ton choix.`;
  face(youEl, pick(models));
  face(cpuEl, pick(models));
  event.target.classList.add("hidden");
});
statusEl.textContent = `Premier à ${TARGET} points. Fais ton choix.`;
