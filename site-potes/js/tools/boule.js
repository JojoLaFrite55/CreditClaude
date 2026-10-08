import { createSfx, loadHeads, mountSoundButton, pick } from "../arcade/kit.js";

const ANSWERS = [
  ["Oui, évidemment", "good"], ["Sans aucun doute", "good"], ["C'est écrit dans le ciel", "good"], ["Fonce", "good"], ["Tout à fait", "good"],
  ["Probablement", "good"], ["Les signes sont bons", "good"], ["Oui, mais assume", "good"],
  ["Redemande plus tard", "mid"], ["Impossible à dire", "mid"], ["Concentre-toi et recommence", "mid"], ["Pas maintenant, je mange", "mid"], ["Demande à ta mère", "mid"],
  ["Non", "bad"], ["Même pas en rêve", "bad"], ["Mes sources disent non", "bad"], ["Très peu probable", "bad"], ["Oublie ça", "bad"], ["Non, et c'est gênant", "bad"], ["Absolument pas", "bad"],
];
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
await loadHeads();
const ball = document.getElementById("ball");
const windowEl = document.getElementById("answer");
const verdict = document.getElementById("verdict");
const history = document.getElementById("history");
const q = document.getElementById("q");
let busy = false;

function shake() {
  sfx.init();
  if (busy) return;
  busy = true;
  ball.classList.remove("shake");
  void ball.offsetWidth;
  ball.classList.add("shake");
  windowEl.textContent = "…";
  verdict.textContent = "…";
  for (let i = 0; i < 6; i++) sfx.noise(0.08, 0.2, "bandpass", 400 + i * 120, 900, i * 0.12);
  setTimeout(() => {
    const [text, kind] = pick(ANSWERS);
    windowEl.textContent = text;
    verdict.textContent = text;
    verdict.style.color = kind === "good" ? "#1a9d4a" : kind === "bad" ? "#d63a3a" : "";
    kind === "good" ? sfx.win() : kind === "bad" ? sfx.lose() : sfx.pop();
    const li = document.createElement("li");
    li.textContent = `${q.value.trim() || "(question secrète)"} → ${text}`;
    history.prepend(li);
    while (history.children.length > 8) history.lastChild.remove();
    busy = false;
  }, 950);
}

document.getElementById("shake").addEventListener("click", shake);
ball.addEventListener("click", shake);
ball.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    shake();
  }
});
q.addEventListener("keydown", (event) => {
  if (event.key === "Enter") shake();
});
