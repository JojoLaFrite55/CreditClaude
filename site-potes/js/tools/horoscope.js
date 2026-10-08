import "../arcade/kit.js";
import { pick } from "../arcade/kit.js";

const SIGNS = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
const EMOJI = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const AMOUR = [
  "Une personne te fixera dans le bus. Elle essayait juste de lire ton t-shirt.",
  "Tu auras un coup de foudre pour un sandwich. La relation sera courte mais intense.",
  "Ton ex pense à toi. Ou à son chargeur, difficile à dire.",
  "Un message à moitié tapé restera à moitié tapé. C'est mieux comme ça.",
  "Quelqu'un te trouve irrésistible. Ce quelqu'un est ton chien.",
  "Tu croiseras ton crush dans une situation embarrassante. Ça arrive déjà tous les jours, rien ne change.",
];
const ARGENT = [
  "Tu trouveras 2 euros dans un vieux manteau. Dépense-les avant qu'ils ne deviennent un souvenir.",
  "Un achat impulsif te sourit. Ne lui souris pas en retour.",
  "Ton compte en banque fait la tête. Offre-lui un peu de silence.",
  "Quelqu'un te doit de l'argent. Ce quelqu'un ne le sait pas encore.",
  "Une promotion de 20 % te coûtera 80 euros.",
  "Pas de grosse dépense aujourd'hui. Les petites s'en chargeront.",
];
const SANTE = [
  "Ton dos te demande de te redresser. Tu feras semblant de ne pas avoir entendu.",
  "Bois un verre d'eau. Un vrai, pas un soda.",
  "Une sieste de 20 minutes te sauvera. Une sieste de 3 heures te changera à jamais.",
  "Tu auras une énergie incroyable à 23 h 47. Profites-en pour ne rien faire d'utile.",
  "Ton corps réclame des légumes. Tu lui offriras des chips, qui sont des légumes dans l'esprit.",
  "Un petit mal de tête approche. Il s'appelle « lundi ».",
];
const CONSEIL = [
  "Réponds à ce message avant qu'il n'ait un anniversaire.",
  "Ne fais pas confiance à un plan qui commence par « ça ira vite ».",
  "Aujourd'hui, la solution est dans le frigo. Ou pas. Vérifie quand même.",
  "Un ami a besoin de toi. Il ne le dira pas, mais il t'enverra un mème.",
  "Évite les décisions importantes avant le café.",
  "Sois le chaos que tu veux voir dans le groupe.",
  "Ce que tu cherches est dans la poche que tu viens de fouiller.",
];
const COULEURS = ["bleu canard", "rouge pizza", "vert avocat", "jaune banane", "violet raisin", "orange mandarine", "rose bonbon", "noir réglisse", "blanc crème"];

const sign = document.getElementById("sign");
const day = document.getElementById("day");
const card = document.getElementById("card");
SIGNS.forEach((name, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `${EMOJI[i]} ${name}`;
  sign.append(option);
});
day.value = new Date().toISOString().slice(0, 10);

function seeded(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function render() {
  const index = Number(sign.value);
  const rnd = seeded(`${SIGNS[index]}-${day.value}`);
  const choose = (list) => list[Math.floor(rnd() * list.length)];
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const date = new Date(`${day.value}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  card.innerHTML = `<h2>${EMOJI[index]} ${SIGNS[index]}</h2><p class="muted">${date}</p>
    <div class="horo-row"><strong>Amour</strong><span>${choose(AMOUR)}<br>${stars(1 + Math.floor(rnd() * 5))}</span></div>
    <div class="horo-row"><strong>Argent</strong><span>${choose(ARGENT)}<br>${stars(1 + Math.floor(rnd() * 5))}</span></div>
    <div class="horo-row"><strong>Santé</strong><span>${choose(SANTE)}<br>${stars(1 + Math.floor(rnd() * 5))}</span></div>
    <div class="horo-row"><strong>Conseil</strong><span>${choose(CONSEIL)}</span></div>
    <div class="horo-row"><strong>Chiffre</strong><span>${1 + Math.floor(rnd() * 99)}</span></div>
    <div class="horo-row"><strong>Couleur</strong><span>${choose(COULEURS)}</span></div>`;
}

document.getElementById("go").addEventListener("click", render);
sign.addEventListener("change", render);
day.addEventListener("change", render);
document.getElementById("randomsign").addEventListener("click", () => {
  sign.value = Math.floor(Math.random() * 12);
  render();
});
void pick;
render();
