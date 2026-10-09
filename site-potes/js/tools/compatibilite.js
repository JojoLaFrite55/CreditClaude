import { createSfx, loadHeads, mountSoundButton } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const a = document.getElementById("a");
const b = document.getElementById("b");
const go = document.getElementById("go");
const result = document.getElementById("result");
const faceA = document.getElementById("face-a");
const faceB = document.getElementById("face-b");
const pctEl = document.getElementById("pct");
const verdict = document.getElementById("verdict");
const detail = document.getElementById("detail");

const VERDICTS = [
  [10, "Incompatibles : même Wi-Fi, même pièce, deux univers."],
  [30, "Compliqué. Mais les meilleures histoires commencent mal."],
  [50, "Moyen : ça passera mieux avec de la pizza."],
  [70, "Pas mal du tout : quelques disputes pour savoir qui choisit le film."],
  [90, "Excellente entente : vous finissez les phrases de l'autre (et son assiette)."],
  [101, "Âmes sœurs : l'univers a littéralement envoyé un SMS."],
];
const CRITERIA = ["Humour", "Mauvaise foi", "Retards", "Appétit", "Chaos"];

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function faceNode(head) {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const cx = c.getContext("2d");
  const k = Math.min(150 / head.width, 150 / head.height);
  cx.drawImage(head, (160 - head.width * k) / 2, (160 - head.height * k) / 2, head.width * k, head.height * k);
  return c;
}

function compute() {
  const na = a.value.trim().toLowerCase();
  const nb = b.value.trim().toLowerCase();
  if (!na || !nb) {
    result.hidden = true;
    return;
  }
  sfx.init();
  const key = [na, nb].sort().join("|");
  const h = hash(key);
  const pct = h % 101;
  result.hidden = false;
  faceA.replaceChildren(faceNode(heads[hash(na) % heads.length]));
  faceB.replaceChildren(faceNode(heads[hash(nb) % heads.length]));
  let n = 0;
  const step = Math.max(1, Math.round(pct / 30));
  const timer = setInterval(() => {
    n = Math.min(pct, n + step);
    pctEl.textContent = `${n} %`;
    pctEl.style.setProperty("--fill", `${n}%`);
    if (n >= pct) clearInterval(timer);
  }, 25);
  verdict.textContent = VERDICTS.find(([limit]) => pct < limit)[1];
  detail.innerHTML = CRITERIA.map((name, i) => {
    const v = hash(`${key}-${i}`) % 101;
    return `<div class="cp-row"><span>${name}</span><div class="cp-bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`;
  }).join("");
  pct >= 70 ? sfx.win() : pct < 30 ? sfx.lose() : sfx.pop();
}

go.addEventListener("click", compute);
for (const el of [a, b]) el.addEventListener("keydown", (event) => event.key === "Enter" && compute());
