import { createSfx, mountSoundButton } from "../arcade/kit.js";

const CASES = [
  "Quelqu'un dit « j'arrive dans 5 minutes »", "Un pote oublie son chargeur", "Le groupe débat 20 minutes pour choisir où manger", "Quelqu'un perd à un jeu et crie à la triche",
  "Une photo floue est postée « artistique »", "Quelqu'un dort avant minuit", "On parle de « la dernière fois »", "Quelqu'un prend la dernière part de pizza",
  "Le wifi coupe en pleine partie", "Un pote répond « vu » sans répondre", "Quelqu'un chante faux, très fort", "On sort un vieux souvenir gênant",
  "Quelqu'un dit « ça ira vite »", "Un pote arrive avec 1 h de retard et une excuse", "On fait un « dernier verre »", "Quelqu'un renverse quelque chose",
  "Un fou rire sans raison", "On cherche un truc qui est dans la poche", "Quelqu'un lance un défi stupide", "Le chien (ou le chat) vole la vedette",
  "On refait le monde à 3 h du matin", "Quelqu'un dit « c'est pas ce que j'ai dit »", "Un pote dit qu'il est en forme et bâille", "Quelqu'un improvise un discours",
  "Un meme est cité à voix haute", "Quelqu'un perd ses clés", "Le plan change trois fois", "Un pote propose de « faire simple » et ça se complique",
  "On commande trop à manger", "Quelqu'un dit « je suis pas bourré »", "Une chanson fait l'unanimité (ou pas)", "Quelqu'un filme tout pour « les souvenirs »",
  "Un pote a un nouveau surnom", "On se perd alors qu'il y a un GPS", "Quelqu'un fait une imitation ratée", "On s'excuse pour le bruit au voisin",
];
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const grid = document.getElementById("grid");
const status = document.getElementById("status");
const countEl = document.getElementById("count");
const seedEl = document.getElementById("seed");

function rng(seed) {
  let h = seed >>> 0 || 1;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

let seed = Number(location.hash.slice(1)) || Math.floor(Math.random() * 1e6);
let marked = new Set([12]);
let done = new Set();

function build() {
  const rand = rng(seed);
  const pool = [...CASES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const cells = pool.slice(0, 24);
  cells.splice(12, 0, "★ Gratuit");
  grid.innerHTML = "";
  cells.forEach((text, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bingo-cell";
    b.textContent = text;
    b.dataset.i = i;
    b.addEventListener("click", () => toggle(i, b));
    grid.append(b);
  });
  marked = new Set([12]);
  done = new Set();
  sync();
  seedEl.textContent = `Grille n°${seed}`;
  try {
    history.replaceState(null, "", `#${seed}`);
  } catch {
    return;
  }
}

function lines() {
  const out = [];
  for (let r = 0; r < 5; r++) out.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) out.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  out.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return out;
}

function sync() {
  const cells = [...grid.children];
  const winning = new Set();
  const found = lines().filter((line) => line.every((i) => marked.has(i)));
  found.forEach((line) => line.forEach((i) => winning.add(i)));
  cells.forEach((b, i) => {
    b.classList.toggle("on", marked.has(i));
    b.classList.toggle("line", winning.has(i));
  });
  countEl.textContent = `${marked.size - 1} cases cochées`;
  if (found.length > done.size) {
    sfx.win();
    status.textContent = found.length === 1 ? "BINGO !" : `BINGO ×${found.length} !`;
  } else status.textContent = found.length ? `${found.length} ligne${found.length > 1 ? "s" : ""} complète${found.length > 1 ? "s" : ""}` : "Coche ce qui arrive pendant la soirée.";
  done = new Set(found.map((_, i) => i));
}

function toggle(i) {
  sfx.init();
  if (i === 12) return;
  marked.has(i) ? marked.delete(i) : marked.add(i);
  sfx.pop();
  sync();
}

document.getElementById("new").addEventListener("click", () => {
  seed = Math.floor(Math.random() * 1e6);
  build();
});
document.getElementById("reset").addEventListener("click", () => {
  marked = new Set([12]);
  done = new Set();
  sync();
});
document.getElementById("copy").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(location.href);
    button.textContent = "Lien copié !";
  } catch {
    button.textContent = "Copie impossible";
  }
  setTimeout(() => (button.textContent = "Copier le lien de la grille"), 1400);
});
build();
