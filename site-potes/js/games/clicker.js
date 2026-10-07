import { createSfx, loadHeads, mountSoundButton } from "../arcade/kit.js";

const SAVE = "qg-clicker";
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();

const UPGRADES = [
  { id: "clic", name: "Gros doigts", text: "+1 like par clic", base: 15, grow: 1.5, click: 1 },
  { id: "pote", name: "Un pote qui like", text: "+1 like / seconde", base: 25, grow: 1.16, auto: 1 },
  { id: "groupe", name: "Groupe WhatsApp", text: "+6 likes / seconde", base: 180, grow: 1.17, auto: 6 },
  { id: "insta", name: "Compte Instagram", text: "+30 likes / seconde", base: 1200, grow: 1.18, auto: 30 },
  { id: "tiktok", name: "Vidéo virale", text: "+150 likes / seconde", base: 9000, grow: 1.19, auto: 150 },
  { id: "chaine", name: "Chaîne YouTube", text: "+800 likes / seconde", base: 60000, grow: 1.2, auto: 800 },
  { id: "concert", name: "Concert au Stade", text: "+5 000 likes / seconde", base: 450000, grow: 1.21, auto: 5000 },
];

const fmt = (n) => {
  if (n < 1000) return Math.floor(n).toString();
  const units = ["k", "M", "Md", "Bn"];
  let value = n;
  let unit = -1;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 2 : value < 100 ? 1 : 0).replace(".", ",")} ${units[unit]}`;
};

const state = { likes: 0, total: 0, owned: Object.fromEntries(UPGRADES.map((u) => [u.id, 0])), headIndex: 0, boost: 0 };
try {
  Object.assign(state, JSON.parse(localStorage.getItem(SAVE) ?? "{}"));
  for (const upgrade of UPGRADES) state.owned[upgrade.id] = state.owned[upgrade.id] || 0;
} catch {
  state.likes = 0;
}
state.headIndex = Math.min(state.headIndex || 0, heads.length - 1);

const likesEl = document.getElementById("likes");
const perSecEl = document.getElementById("persec");
const perClickEl = document.getElementById("perclick");
const list = document.getElementById("upgrades");
const button = document.getElementById("big");
const stage = document.getElementById("clicker-stage");
const golden = document.getElementById("golden");

const cost = (upgrade) => Math.ceil(upgrade.base * upgrade.grow ** state.owned[upgrade.id]);
const perClick = () => 1 + UPGRADES.reduce((sum, u) => sum + (u.click ?? 0) * state.owned[u.id], 0);
const perSec = () => UPGRADES.reduce((sum, u) => sum + (u.auto ?? 0) * state.owned[u.id], 0) * (state.boost > 0 ? 7 : 1);

function showHead() {
  button.innerHTML = "";
  const image = heads[state.headIndex];
  const element = document.createElement(image instanceof HTMLCanvasElement ? "canvas" : "img");
  if (image instanceof HTMLCanvasElement) {
    element.width = image.width;
    element.height = image.height;
    element.getContext("2d").drawImage(image, 0, 0);
  } else {
    element.src = image.src;
    element.alt = "Clique sur la tête";
  }
  button.append(element);
}

function renderList() {
  list.innerHTML = "";
  for (const upgrade of UPGRADES) {
    const item = document.createElement("li");
    item.className = "upgrade";
    const price = cost(upgrade);
    item.innerHTML = `<div><h3>${upgrade.name} <span class="muted">x${state.owned[upgrade.id]}</span></h3><p>${upgrade.text}</p></div>`;
    const buy = document.createElement("button");
    buy.type = "button";
    buy.className = "btn btn-small";
    buy.dataset.id = upgrade.id;
    buy.textContent = `${fmt(price)} likes`;
    buy.disabled = state.likes < price;
    buy.addEventListener("click", () => {
      sfx.init();
      if (state.likes < cost(upgrade)) return;
      state.likes -= cost(upgrade);
      state.owned[upgrade.id] += 1;
      sfx.coin();
      renderList();
      refresh();
    });
    item.append(buy);
    list.append(item);
  }
}

function refresh() {
  likesEl.textContent = fmt(state.likes);
  perSecEl.textContent = fmt(perSec());
  perClickEl.textContent = fmt(perClick());
  list.querySelectorAll("button").forEach((buy) => {
    const upgrade = UPGRADES.find((u) => u.id === buy.dataset.id);
    buy.disabled = state.likes < cost(upgrade);
  });
}

function float(text, x, y) {
  const node = document.createElement("span");
  node.className = "float";
  node.textContent = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  stage.append(node);
  setTimeout(() => node.remove(), 900);
}

button.addEventListener("click", (event) => {
  sfx.init();
  const amount = perClick() * (state.boost > 0 ? 7 : 1);
  state.likes += amount;
  state.total += amount;
  sfx.pop();
  const rect = stage.getBoundingClientRect();
  float(`+${fmt(amount)}`, event.clientX - rect.left, event.clientY - rect.top);
  button.classList.remove("bump");
  void button.offsetWidth;
  button.classList.add("bump");
  refresh();
});

document.getElementById("change").addEventListener("click", () => {
  state.headIndex = (state.headIndex + 1) % heads.length;
  sfx.click();
  showHead();
});

document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Tout remettre à zéro ?")) return;
  state.likes = 0;
  state.total = 0;
  state.owned = Object.fromEntries(UPGRADES.map((u) => [u.id, 0]));
  renderList();
  refresh();
});

function spawnGolden() {
  golden.classList.remove("hidden");
  const rect = stage.getBoundingClientRect();
  golden.style.left = `${40 + Math.random() * Math.max(10, rect.width - 120)}px`;
  golden.style.top = `${40 + Math.random() * Math.max(10, rect.height - 120)}px`;
  setTimeout(() => golden.classList.add("hidden"), 7000);
}

golden.addEventListener("click", () => {
  sfx.init();
  golden.classList.add("hidden");
  state.boost = 12;
  sfx.win();
  float("Likes x7 pendant 12 s !", stage.clientWidth / 2, 60);
});

setInterval(() => {
  const gain = perSec() / 10;
  state.likes += gain;
  state.total += gain;
  if (state.boost > 0) state.boost = Math.max(0, state.boost - 0.1);
  document.getElementById("boost").classList.toggle("hidden", state.boost <= 0);
  document.getElementById("boost").textContent = `x7 : ${Math.ceil(state.boost)} s`;
  refresh();
}, 100);

setInterval(() => {
  try {
    localStorage.setItem(SAVE, JSON.stringify(state));
  } catch {
    return;
  }
}, 3000);
addEventListener("beforeunload", () => {
  try {
    localStorage.setItem(SAVE, JSON.stringify(state));
  } catch {
    return;
  }
});

setInterval(() => {
  if (golden.classList.contains("hidden") && Math.random() < 0.5) spawnGolden();
}, 25000);

showHead();
renderList();
refresh();
