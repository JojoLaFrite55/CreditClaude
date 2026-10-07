import { createSfx, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);

const GENERATORS = {
  insulte: () => {
    const nom = ["cornichon", "grille-pain", "tabouret", "pigeon voyageur", "routeur wifi", "poulpe", "sandwich triangle", "ventilateur", "radiateur", "caddie", "trombone", "rond-point"];
    const adj = ["à roulettes", "en promotion", "périmé depuis mardi", "de compétition", "en mode économie d'énergie", "sans piles", "sous-titré", "à moitié chargé", "de luxe", "en cours de mise à jour"];
    return `Espèce de ${pick(nom)} ${pick(adj)}.`;
  },
  compliment: () => {
    const a = ["Tu as le charisme d'un", "Tu es aussi précieux qu'un", "Tu es la preuve qu'un", "Franchement, tu es meilleur qu'un"];
    const b = ["chargeur qui marche du premier coup", "wifi qui ne coupe jamais", "dernier morceau de pizza offert", "parking gratuit en centre-ville", "canapé qui n'a pas de bosse", "mot de passe dont on se souvient"];
    return `${pick(a)} ${pick(b)}.`;
  },
  surnom: () => {
    const nom = ["Maître", "Baron", "Capitaine", "Professeur", "Seigneur", "Comte", "Docteur", "Roi"];
    const mid = ["Baguette", "Pantoufle", "Câlin", "Tonnerre", "Raclette", "Kebab", "Ventilo", "Gaufre", "Piment", "Chaussette"];
    const end = ["du Dimanche", "de la Tournée", "des Retards", "du Frigo", "le Magnifique", "Sans Batterie", "du Dernier Moment"];
    return `${pick(nom)} ${pick(mid)} ${pick(end)}`;
  },
  pseudo: () => {
    const word = ["Shadow", "Turbo", "Croquette", "Ninja", "Kebab", "Pixel", "Mamba", "Fromage", "Spectre", "Banane", "Chaos", "Zinzin"];
    const tail = ["TheOne", "FR", "_off", "420", "Pro", "Le_Vrai", "2k", "Officiel", "Gaming", "OnFire"];
    const style = Math.floor(Math.random() * 4);
    const w = pick(word);
    const t = pick(tail);
    return [`xX_${w}_Xx`, `${w}${t}`, `${w}_${t}${Math.floor(Math.random() * 99)}`, `Le${w}Masqué`][style];
  },
  drague: () =>
    pick([
      "Tu as un plan de table ? Parce que tu as pris toute la place dans ma tête.",
      "Est-ce que tu es un forfait illimité ? Parce que je ne veux plus te quitter.",
      "Tu t'appelles Wi-Fi ? Je ressens une connexion.",
      "Tu es allergique à quoi ? Parce que moi je ne suis pas allergique à toi.",
      "Je ne suis pas un monstre, mais je suis prêt à te laisser le dernier morceau.",
      "T'as pas un chargeur ? Parce que tu me donnes de l'énergie.",
      "Si t'étais une pizza, je serais déjà à ta table.",
      "On se connaît ? Ah non, c'est juste que tu as une tête de gagnant.",
      "Tu veux qu'on regarde les étoiles ? Je connais un plafond qui en a.",
      "Est-ce que ça te dérange si je t'invite à ne pas répondre à mon message ?",
    ]),
  prediction: () => {
    const when = ["Dans 3 jours", "Ce week-end", "Au prochain apéro", "Dans exactement 11 minutes", "Avant la fin du mois", "Demain matin"];
    const what = ["tu perdras quelque chose que tu portes sur toi", "quelqu'un te demandera si « ça va » et tu répondras faux", "tu diras « j'arrive » depuis ton canapé", "tu recevras un mème qui parle exactement de toi", "tu t'apercevras que tu avais raison, mais personne ne le saura", "tu paieras plus que prévu en disant « laisse, c'est bon »", "une pizza changera ton destin"];
    return `${pick(when)}, ${pick(what)}.`;
  },
  relance: () =>
    pick([
      "Alors, t'es mort ou t'as juste le téléphone qui capte pas ?",
      "Je te rappelle que tu me dois une réponse depuis la semaine dernière.",
      "Coucou. Je sais que tu lis ça. On te laisse trente secondes.",
      "On est trois à t'attendre. Un d'entre nous commence à te détester.",
      "Allô la Terre ? Ici le groupe. Tu viens oui ou non ?",
      "Si tu réponds pas, on réserve ton siège à quelqu'un d'autre. Un chien, peut-être.",
      "Dernière tentative avant de prévenir ta famille.",
    ]),
  debat: () =>
    pick([
      "Un hot-dog est-il un sandwich ? Défends-toi.",
      "Vaut-il mieux se battre contre 100 canards de la taille d'un cheval ou 1 cheval de la taille d'un canard ?",
      "Mettre le lait avant les céréales : crime ou génie ?",
      "Est-ce qu'un cornichon est un légume, un fruit, ou une opinion ?",
      "Qui a décidé que le lundi commençait si tôt ?",
      "Si on mélange Pâques et Noël, on obtient quoi ? Argumente.",
      "Peut-on être en retard à un rendez-vous qu'on a soi-même décalé ?",
    ]),
};

const type = document.getElementById("type");
const out = document.getElementById("output");
const who = document.getElementById("who");
const history = document.getElementById("history");

function generate() {
  const text = GENERATORS[type.value]();
  const target = who.value.trim();
  const needsName = ["insulte", "compliment", "prediction", "relance"].includes(type.value);
  out.textContent = needsName && target ? `${target} : ${text}` : text;
  const item = document.createElement("li");
  item.textContent = out.textContent;
  history.prepend(item);
  while (history.children.length > 6) history.lastChild.remove();
}

document.getElementById("new").addEventListener("click", () => {
  sfx.init();
  sfx.pop();
  generate();
});
type.addEventListener("change", generate);
document.getElementById("copy").addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText(out.textContent);
    event.target.textContent = "Copié !";
  } catch {
    event.target.textContent = "Copie impossible";
  }
  setTimeout(() => (event.target.textContent = "Copier"), 1400);
});
generate();
