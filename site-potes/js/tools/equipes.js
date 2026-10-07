import { createSfx, mountSoundButton, shuffle } from "../arcade/kit.js";

const KEY = "qg-teams";
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const input = document.getElementById("names");
const count = document.getElementById("count");
const out = document.getElementById("teams");
let saved = "Pote 1\nPote 2\nPote 3\nPote 4\nPote 5\nPote 6\nPote 7";
try {
  saved = localStorage.getItem(KEY) ?? saved;
} catch {
  saved = saved;
}
input.value = saved;

const TEAM_NAMES = ["Les Requins", "Les Tornades", "Les Fusées", "Les Gorilles", "Les Pirates", "Les Ninjas", "Les Dragons", "Les Pandas"];

function split() {
  sfx.init();
  const names = input.value.split("\n").map((line) => line.trim()).filter(Boolean);
  const total = Math.max(2, Math.min(8, Number(count.value) || 2));
  if (names.length < 2) {
    out.innerHTML = '<p class="muted">Ajoute au moins deux noms.</p>';
    return;
  }
  try {
    localStorage.setItem(KEY, input.value);
  } catch {
    total;
  }
  const teams = Array.from({ length: Math.min(total, names.length) }, () => []);
  shuffle(names).forEach((name, index) => teams[index % teams.length].push(name));
  const labels = shuffle(TEAM_NAMES);
  out.innerHTML = "";
  teams.forEach((members, index) => {
    const card = document.createElement("article");
    card.className = "team";
    const captain = members[Math.floor(Math.random() * members.length)];
    card.innerHTML = `<h3>${labels[index]}</h3><ul>${members.map((m) => `<li>${m}${m === captain ? ' <span class="tag">capitaine</span>' : ""}</li>`).join("")}</ul>`;
    card.style.animationDelay = `${index * 80}ms`;
    out.append(card);
  });
  sfx.win();
}

document.getElementById("split").addEventListener("click", split);
document.getElementById("copy").addEventListener("click", async (event) => {
  const text = [...out.querySelectorAll(".team")].map((team) => `${team.querySelector("h3").textContent} : ${[...team.querySelectorAll("li")].map((li) => li.childNodes[0].textContent.trim()).join(", ")}`).join("\n");
  try {
    await navigator.clipboard.writeText(text);
    event.target.textContent = "Copié !";
  } catch {
    event.target.textContent = "Copie impossible";
  }
  setTimeout(() => (event.target.textContent = "Copier le résultat"), 1400);
});
split();
