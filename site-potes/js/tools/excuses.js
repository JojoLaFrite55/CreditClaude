import { createSfx, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);

const DATA = {
  retard: {
    intro: ["Écoute,", "Franchement,", "Ça va te paraître fou mais", "Je te jure sur la tête de mes parents :", "Avant que tu dises quoi que ce soit,"],
    cause: [
      "mon réveil a décidé de partir en grève",
      "un pigeon a bloqué ma porte d'entrée",
      "mon GPS m'a emmené dans une autre ville",
      "j'ai croisé un ancien prof qui m'a raconté sa vie",
      "mon tram s'est arrêté pour « raisons mystérieuses »",
      "j'ai cherché mes clés dans la mauvaise veste pendant 40 minutes",
      "mon chat s'est assis sur mes chaussures et je n'ai pas osé le déranger",
      "j'ai rejoué trois fois la même partie « juste une dernière »",
    ],
    twist: ["et en plus ma batterie est morte.", "et je suis presque arrivé, promis.", "et c'est clairement pas ma faute.", "donc en vrai j'ai même été ponctuel.", "mais j'arrive dans 5 minutes."],
  },
  message: {
    intro: ["Désolé pour le vent,", "Je viens de voir ton message :", "Pas ghosté, juste occupé :", "Je comptais répondre mais"],
    cause: [
      "mon téléphone était en mode avion depuis mardi",
      "j'ai répondu dans ma tête et j'ai cru l'avoir envoyé",
      "Discord m'a avalé tous mes messages",
      "j'étais en pleine méditation profonde",
      "mon pouce a eu une crampe",
      "j'ai lu le message en story par erreur",
      "j'étais en train de sauver le monde sur mon canapé",
    ],
    twist: ["mais là je suis de retour.", "mais je te réponds dès que possible.", "et franchement c'est pas moi, c'est le réseau.", "donc techniquement c'est toi qui m'as laissé en vu."],
  },
  sous: {
    intro: ["Alors, petit souci :", "Bonne nouvelle : c'est ma tournée.", "Sans pression,", "Pour la tournée,"],
    cause: [
      "ma carte bancaire est en vacances",
      "mon porte-monnaie est resté dans un autre pantalon",
      "j'ai investi toutes mes économies dans des skins",
      "mon appli de banque refuse de s'ouvrir",
      "j'ai prêté mes derniers euros à un inconnu sympa",
      "je viens de payer mon abonnement à 14 services de streaming",
    ],
    twist: ["mais je te rembourse le mois prochain, promis juré.", "donc je paie la prochaine, c'est dit.", "mais je t'offre ma gratitude éternelle.", "et c'est pour ça que tu es mon meilleur pote."],
  },
};

const SIGNS = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
const HORO = {
  love: ["Aujourd'hui, un message que tu attendais arrive… mais pas de la bonne personne.", "Une belle rencontre t'attend à la boulangerie. Prends de la monnaie.", "Tu vas dire « je t'aime » à ta pizza. Elle le mérite."],
  money: ["Une dépense imprévue arrive : prépare ton sourire de façade.", "Ne prête rien aujourd'hui, ni sous, ni chargeur, ni crayon.", "Tu trouveras 2 euros dans une vieille veste. Dépense-les mal."],
  health: ["Ta chaise gamer te réclame un massage.", "Bois de l'eau. Pas du soda. De l'eau. Enfin, essaie.", "Ton pouce va faire de grandes choses aujourd'hui."],
  advice: ["Évite de répondre « j'arrive » avant d'être réellement parti.", "Aujourd'hui, la solution à tout est un câlin ou une pizza.", "Ne fais pas confiance au mec qui dit « c'est facile ».", "Prends l'initiative : propose un plan. Il ne se fera pas, mais tu auras proposé."],
};

const tabs = [...document.querySelectorAll("[data-tab]")];
const panels = [...document.querySelectorAll("[data-panel]")];
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    sfx.init();
    sfx.click();
    tabs.forEach((other) => other.setAttribute("aria-selected", String(other === tab)));
    panels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== tab.dataset.tab));
  }),
);

const excuse = document.getElementById("excuse");
const kind = document.getElementById("kind");

function makeExcuse() {
  const set = DATA[kind.value];
  excuse.textContent = `${pick(set.intro)} ${pick(set.cause)}, ${pick(set.twist)}`;
}

document.getElementById("new-excuse").addEventListener("click", () => {
  sfx.init();
  sfx.pop();
  makeExcuse();
});
document.getElementById("copy-excuse").addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText(excuse.textContent);
    event.target.textContent = "Copié !";
    setTimeout(() => (event.target.textContent = "Copier"), 1400);
  } catch {
    event.target.textContent = "Copie impossible";
  }
});
kind.addEventListener("change", makeExcuse);
makeExcuse();

const signSelect = document.getElementById("sign");
SIGNS.forEach((sign) => signSelect.append(new Option(sign, sign)));
const stars = document.getElementById("stars");
const horo = document.getElementById("horo");

function seeded(sign) {
  const day = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (const c of `${sign}${day}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function makeHoro() {
  const rand = seeded(signSelect.value);
  const choose = (list) => list[Math.floor(rand() * list.length)];
  const stat = () => "★".repeat(1 + Math.floor(rand() * 5)).padEnd(5, "☆");
  stars.innerHTML = `<div><dt>Amour</dt><dd>${stat()}</dd></div><div><dt>Argent</dt><dd>${stat()}</dd></div><div><dt>Santé</dt><dd>${stat()}</dd></div>`;
  horo.innerHTML = `<p><strong>Amour.</strong> ${choose(HORO.love)}</p><p><strong>Argent.</strong> ${choose(HORO.money)}</p><p><strong>Santé.</strong> ${choose(HORO.health)}</p><p><strong>Conseil du jour.</strong> ${choose(HORO.advice)}</p>`;
}

signSelect.addEventListener("change", () => {
  sfx.init();
  sfx.pop();
  makeHoro();
});
makeHoro();
