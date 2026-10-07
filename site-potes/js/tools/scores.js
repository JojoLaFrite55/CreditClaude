import { createSfx, mountSoundButton } from "../arcade/kit.js";

const KEY = "qg-scores";
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const list = document.getElementById("players");
const form = document.getElementById("add-form");
const nameInput = document.getElementById("player-name");
const titleInput = document.getElementById("game-title");

let state = { title: "Soirée jeux", players: [] };
try {
  state = { ...state, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
} catch {
  state = { title: "Soirée jeux", players: [] };
}
titleInput.value = state.title;

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
};

function render() {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  list.innerHTML = "";
  if (!ranked.length) {
    list.innerHTML = '<li class="muted empty">Ajoute des joueurs pour commencer.</li>';
    return;
  }
  ranked.forEach((player, index) => {
    const row = document.createElement("li");
    row.className = `score-row rank-${Math.min(index + 1, 4)}`;
    row.innerHTML = `<span class="rank">${index + 1}</span><span class="pname">${player.name.replace(/</g, "&lt;")}</span><strong class="pscore">${player.score}</strong>`;
    const controls = document.createElement("div");
    controls.className = "controls";
    for (const [label, delta] of [["−1", -1], ["+1", 1], ["+5", 5], ["+10", 10]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-small btn-secondary";
      button.textContent = label;
      button.addEventListener("click", () => {
        sfx.init();
        player.score += delta;
        delta > 0 ? sfx.coin() : sfx.tone("square", 300, 200, 0.08, 0.1);
        save();
        render();
      });
      controls.append(button);
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-small btn-secondary";
    remove.setAttribute("aria-label", `Retirer ${player.name}`);
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      state.players = state.players.filter((p) => p !== player);
      save();
      render();
    });
    controls.append(remove);
    row.append(controls);
    list.append(row);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  sfx.init();
  sfx.pop();
  state.players.push({ name: name.slice(0, 24), score: 0 });
  nameInput.value = "";
  save();
  render();
});
titleInput.addEventListener("input", () => {
  state.title = titleInput.value;
  save();
});
document.getElementById("reset-scores").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  state.players.forEach((player) => (player.score = 0));
  save();
  render();
});
document.getElementById("clear-all").addEventListener("click", () => {
  if (!confirm("Supprimer tous les joueurs ?")) return;
  state.players = [];
  save();
  render();
});
render();
