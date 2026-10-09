import { createSfx, loadHeads, mountSoundButton } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const PROFILES = {
  chaos: { title: "L'Agent du Chaos", text: "Tu ne planifies rien, tu déclenches tout. Le groupe te remercie et te craint à parts égales.", head: 2 },
  retard: { title: "Le Roi du Retard", text: "Ta notion du temps est une suggestion. « J'arrive dans 5 minutes » veut dire « je cherche mes chaussettes ».", head: 5 },
  chef: { title: "Le Chef du Plan", text: "Tu proposes, organises, relances, réserves. Personne ne suit, mais tu y crois toujours.", head: 1 },
  fan: { title: "Le Supporter Officiel", text: "Tu rigoles à toutes les blagues, même les mauvaises. Une bande sans toi n'est qu'un groupe de discussion.", head: 0 },
  silence: { title: "Le Spectateur Silencieux", text: "Tu lis tout, tu réponds peu, mais ta seule réaction vaut cent messages.", head: 3 },
  gourmand: { title: "Le Gourmand Légendaire", text: "Le vrai plan, c'est le repas. Tu connais chaque carte de la ville et le dernier morceau de pizza t'appartient.", head: 8 },
};
const QUESTIONS = [
  ["Un plan est annoncé pour ce soir, tu…", [["Réponds « chaud » sans lire", "chaos"], ["Cherches la dernière heure possible", "retard"], ["Proposes déjà un programme complet", "chef"], ["Likes le message et regardes", "silence"]]],
  ["Ton arrivée à une soirée ressemble à…", [["Une entrée remarquée avec un truc inattendu", "chaos"], ["Un message « je suis en bas » alors que non", "retard"], ["Tu es là le premier avec les chips", "gourmand"], ["Tu arrives, tu salues, tu restes dans un coin", "silence"]]],
  ["Dans un jeu de société, tu es…", [["Celui qui change les règles", "chaos"], ["Celui qui lit les règles à tout le monde", "chef"], ["Celui qui rigole quoi qu'il arrive", "fan"], ["Celui qui attend le goûter", "gourmand"]]],
  ["Ton message vocal moyen fait…", [["3 minutes, 4 sujets, aucun lien", "chaos"], ["Il n'existe pas, tu appelles", "fan"], ["12 secondes, très précis", "chef"], ["Tu ne fais pas de vocaux", "silence"]]],
  ["Au resto, tu…", [["Commandes pour tout le monde", "chef"], ["Choisis en dernier, après 20 minutes", "retard"], ["Goûtes dans toutes les assiettes", "gourmand"], ["Prends ce que prend ton voisin", "fan"]]],
  ["Ton plus grand défaut ?", [["Je dis oui à tout", "chaos"], ["Je suis toujours en retard", "retard"], ["Je veux tout contrôler", "chef"], ["Je suis difficile à joindre", "silence"]]],
  ["Ta réaction à une très mauvaise blague ?", [["J'en fais une pire", "chaos"], ["Je ris trop fort", "fan"], ["Je regarde mon assiette", "gourmand"], ["Je ne dis rien mais je souris", "silence"]]],
  ["La soirée dure trop longtemps, tu…", [["Relances une idée absurde", "chaos"], ["Es déjà parti sans le dire", "silence"], ["Organises le retour de tout le monde", "chef"], ["Proposes une dernière pizza", "gourmand"]]],
];
const form = document.getElementById("quiz");
const stepEl = document.getElementById("step");
const qEl = document.getElementById("q");
const opts = document.getElementById("opts");
const bar = document.getElementById("bar");
const card = document.getElementById("card");
const restart = document.getElementById("restart");
const state = { i: 0, score: {} };

function show() {
  const [q, answers] = QUESTIONS[state.i];
  stepEl.textContent = `Question ${state.i + 1} / ${QUESTIONS.length}`;
  bar.style.width = `${(state.i / QUESTIONS.length) * 100}%`;
  qEl.textContent = q;
  opts.innerHTML = "";
  answers.forEach(([text, key]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "qp-opt";
    b.textContent = text;
    b.addEventListener("click", () => {
      sfx.init();
      sfx.pop();
      state.score[key] = (state.score[key] || 0) + 1;
      state.i += 1;
      state.i >= QUESTIONS.length ? result() : show();
    });
    opts.append(b);
  });
}

function result() {
  bar.style.width = "100%";
  const best = Object.entries(state.score).sort((a, b) => b[1] - a[1])[0][0];
  const profile = PROFILES[best];
  form.hidden = true;
  card.hidden = false;
  const head = heads[profile.head % heads.length];
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 220;
  const cx = c.getContext("2d");
  const k = Math.min(210 / head.width, 210 / head.height);
  cx.drawImage(head, (220 - head.width * k) / 2, (220 - head.height * k) / 2, head.width * k, head.height * k);
  const total = Object.values(state.score).reduce((a, b) => a + b, 0);
  card.innerHTML = `<p class="eyebrow">Tu es…</p><h2>${profile.title}</h2><p>${profile.text}</p><div class="qp-bars">${Object.entries(PROFILES).map(([k2, p]) => `<div class="cp-row"><span>${p.title}</span><div class="cp-bar"><i style="width:${Math.round(((state.score[k2] || 0) / total) * 100)}%"></i></div><b>${Math.round(((state.score[k2] || 0) / total) * 100)} %</b></div>`).join("")}</div>`;
  card.prepend(c);
  restart.hidden = false;
  sfx.win();
}

restart.addEventListener("click", () => {
  state.i = 0;
  state.score = {};
  card.hidden = true;
  restart.hidden = true;
  form.hidden = false;
  show();
});
show();
