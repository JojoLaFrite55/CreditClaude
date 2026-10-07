import { createSfx, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);

const TRUTH = [
  "Quelle est la chose la plus gênante que tu aies faite devant tout le monde ?",
  "Quel est ton plus gros mensonge pour échapper à une soirée ?",
  "Quelle appli passes-tu le plus de temps à ouvrir sans raison ?",
  "Quel est le dernier truc que tu as googlé et dont tu n'es pas fier ?",
  "Quelle chanson connais-tu par cœur et tu le caches ?",
  "Quel est ton plus gros fail en cuisine ?",
  "Quelle est la pire excuse que tu aies déjà donnée pour être en retard ?",
  "Quel personnage de fiction es-tu secrètement ?",
  "Quel est ton talent le plus inutile ?",
  "Qui, dans cette bande, répondrait le plus vite à un message à 3 h du matin ?",
  "Quelle est ta pire honte sur un réseau social ?",
  "Si tu devais effacer un jeu vidéo de ta vie, lequel ?",
];
const DARE = [
  "Parle avec l'accent d'un présentateur météo pendant les trois prochains tours.",
  "Fais ton meilleur cri de victoire de joueur pro.",
  "Imite un pote de la bande, les autres doivent deviner qui.",
  "Raconte ta journée uniquement en chantant.",
  "Garde une voix de robot pendant deux minutes.",
  "Fais dix pompes ou dix squats, au choix.",
  "Mets un verre d'eau sur ta tête et tiens 30 secondes.",
  "Fais un discours de remerciement comme si tu gagnais un Oscar.",
  "Dis l'alphabet à l'envers, sans te tromper si possible.",
  "Invente un slogan publicitaire pour un objet choisi par le groupe.",
  "Danse sur la chanson que le groupe choisit pendant 20 secondes.",
  "Fais le tour de la pièce en marchant comme un pingouin.",
];

const card = document.getElementById("card");
const kicker = document.getElementById("kicker");
const prompt = document.getElementById("prompt");
const used = { truth: new Set(), dare: new Set() };

function draw(type) {
  sfx.init();
  const source = type === "truth" ? TRUTH : DARE;
  if (used[type].size >= source.length) used[type].clear();
  let text;
  do text = pick(source);
  while (used[type].has(text));
  used[type].add(text);
  card.classList.remove("pop");
  void card.offsetWidth;
  card.classList.add("pop");
  card.dataset.type = type;
  kicker.textContent = type === "truth" ? "Vérité" : "Action";
  prompt.textContent = text;
  sfx.pop();
}

document.getElementById("truth").addEventListener("click", () => draw("truth"));
document.getElementById("dare").addEventListener("click", () => draw("dare"));
document.getElementById("random").addEventListener("click", () => draw(Math.random() < 0.5 ? "truth" : "dare"));
