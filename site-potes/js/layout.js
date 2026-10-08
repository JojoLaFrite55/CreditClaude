import { NAV, SITE } from "./data.js";

const current = document.body.dataset.page;

const links = NAV.map(
  (item) =>
    `<a href="${item.href}"${item.page === current ? ' aria-current="page"' : ""}>${item.label}</a>`,
).join("");

const header = `
<div class="announce">${SITE.announce}<button class="egg-67" type="button" aria-label="67">67</button></div>
<header class="site-header">
  <div class="wrap header-grid">
    <a class="brand" href="index.html" aria-label="${SITE.name} — accueil">${SITE.name}</a>
    <nav class="nav" id="nav" aria-label="Navigation principale">${links}</nav>
    <a class="btn btn-small header-cta" href="jeu.html">Jouer</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;

const footer = `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="brand">${SITE.name}</p>
      <p class="muted">${SITE.tagline}</p>
    </div>
    <nav class="footer-links" aria-label="Pied de page">${links}</nav>
  </div>
  <div class="wrap footer-bottom"><p class="muted">© ${new Date().getFullYear()} ${SITE.name} · Fait entre potes, pour de faux.</p><span class="footer-eggs"><button class="mic-egg" type="button" aria-label="Micro">🎤</button><button class="wolf-egg" type="button" aria-label="Loup sigma">🐺</button><button class="car-egg" type="button" aria-label="Un petit tour ?">🚗</button></span></div>
</footer>`;

document.body.insertAdjacentHTML("afterbegin", header);
document.body.insertAdjacentHTML("beforeend", footer);

const burger = document.querySelector(".burger");
const nav = document.getElementById("nav");

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
});

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let progress = 0;
const summon = () => import("./enfer.js").then((module) => module.openHell());

addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
  if (progress === KONAMI.length) {
    progress = 0;
    summon();
  }
});

let taps = 0;
let tapTimer = 0;
document.querySelector(".site-footer .brand").addEventListener("click", () => {
  taps += 1;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => (taps = 0), 2500);
  if (taps >= 6) {
    taps = 0;
    summon();
  }
});

document.querySelector(".car-egg").addEventListener("click", () => import("./voiture.js").then((module) => module.openCar()));

document.querySelector(".egg-67").addEventListener("click", () => import("./soixantesept.js").then((module) => module.open67()));
document.querySelector(".wolf-egg").addEventListener("click", () => import("./soixantesept.js").then((module) => module.openWolf()));
document.querySelector(".mic-egg").addEventListener("click", () => import("./micro.js").then((module) => module.openMicro()));
