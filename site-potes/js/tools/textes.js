import { createSfx, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);

const L = {
  intro: ["Franchement,", "Sans rancune mais", "Écoute-moi bien :", "Dis donc,", "Honnêtement,", "Avec tout mon respect,", "Je ne dis pas ça pour te vexer, mais", "Soyons clairs :", "Petite info :", "Entre nous,"],
  nom: ["cornichon", "grille-pain", "tabouret", "pigeon voyageur", "routeur wifi", "poulpe", "sandwich triangle", "ventilateur", "radiateur", "caddie", "trombone", "rond-point", "ficus", "tupperware", "escabeau", "paillasson", "sèche-cheveux", "tourniquet", "gobelet", "micro-ondes", "parasol", "tapis de souris", "cintre", "pot de yaourt"],
  adj: ["à roulettes", "en promotion", "périmé depuis mardi", "de compétition", "en mode économie d'énergie", "sans piles", "sous-titré", "à moitié chargé", "de luxe", "en cours de mise à jour", "fraîchement sorti du four", "version démo", "légèrement tiède", "au rabais", "en pleine crise d'identité", "monté à l'envers", "qui boite un peu", "format familial"],
  objet: ["un chargeur cassé", "un parapluie troué", "un mot de passe oublié", "un ticket de cinéma périmé", "un stylo sans encre", "un GPS en panne", "un wifi de gare", "un plan B sans plan A", "un manuel d'instructions", "une lampe sans ampoule", "un frigo vide", "un réveil en mode silencieux", "une chaussette orpheline", "une clé qui ne ferme rien"],
  qualite: ["charisme", "courage", "sens de l'orientation", "talent culinaire", "ponctualité", "sens de l'humour", "mémoire", "sens du rythme", "style vestimentaire", "autorité"],
  ordre: ["d'un ficus", "d'une chaussette seule", "d'un poisson rouge", "d'un cactus", "d'un canapé", "d'un escargot sous somnifères", "d'un parapluie en été", "d'un stylo bille vide"],
  verbe: ["mérites", "obtiens", "remportes", "reçois"],
  trophee: ["la médaille du pire retard", "le titre d'ambassadeur du « j'arrive »", "le trophée de la blague ratée", "le diplôme de procrastination avancée", "la coupe du faux départ", "le badge du dernier arrivé", "l'écharpe du roi de la mauvaise foi", "la médaille d'or de l'excuse bancale"],
  ca: ["chargeur qui marche du premier coup", "wifi qui ne coupe jamais", "dernier morceau de pizza offert", "parking gratuit en centre-ville", "canapé sans bosse", "mot de passe dont on se souvient", "réveil qui sonne au bon moment", "sandwich encore tiède", "bus qui arrive à l'heure", "coussin avec le côté frais"],
  comp1: ["Tu as le charisme d'un", "Tu es aussi précieux qu'un", "Tu es meilleur qu'un", "Tu es plus rassurant qu'un", "Franchement, tu vaux plus qu'un", "T'es aussi rare qu'un"],
  comp2: ["Et ça, c'est un fait.", "Personne ne te le dit assez.", "Garde ça pour toi, ça risque de te monter à la tête.", "Voilà, je l'ai dit.", "Ne me demande pas de le répéter.", "Le groupe te remercie."],
  titre: ["Maître", "Baron", "Capitaine", "Professeur", "Seigneur", "Comte", "Docteur", "Roi", "Chevalier", "Duc", "Amiral", "Grand Vizir"],
  mid: ["Baguette", "Pantoufle", "Câlin", "Tonnerre", "Raclette", "Kebab", "Ventilo", "Gaufre", "Piment", "Chaussette", "Bouillotte", "Cacahuète", "Moustache", "Pigeon", "Pastèque", "Brioche"],
  fin: ["du Dimanche", "de la Tournée", "des Retards", "du Frigo", "le Magnifique", "Sans Batterie", "du Dernier Moment", "des Bons Plans", "du Canapé", "à Moitié Réveillé", "Troisième du Nom", "de la Dernière Heure"],
  pword: ["Shadow", "Turbo", "Croquette", "Ninja", "Kebab", "Pixel", "Mamba", "Fromage", "Spectre", "Banane", "Chaos", "Zinzin", "Panda", "Vortex", "Nugget", "Baguette"],
  ptail: ["TheOne", "FR", "_off", "420", "Pro", "Le_Vrai", "2k", "Officiel", "Gaming", "OnFire", "xX", "_YT", "Reborn", "007"],
  accroche: ["Tu as un plan de table ?", "Est-ce que tu es un forfait illimité ?", "Tu t'appelles Wi-Fi ?", "T'as pas un chargeur ?", "Tu veux voir un truc incroyable ?", "On se connaît ?", "Excuse-moi, je cherche mon téléphone.", "Tu viens souvent ici ?", "Ça te dérange si je te regarde ?", "Dis, t'as l'heure ?", "Tu es allergique à quoi ?", "Tu as pris un ticket ?"],
  chute: ["Parce que tu as pris toute la place dans ma tête.", "Parce que je ne veux plus te quitter.", "Parce que je ressens une connexion.", "Parce que tu me donnes de l'énergie.", "Parce que ma pizza est moins bonne sans toi.", "Mais le dernier morceau, c'est pour toi.", "Parce que tu es en 5G dans mon cœur.", "Parce que ma batterie est à 1 % et ça me dit de te parler.", "Parce que tu es le dernier épisode que je n'ai pas vu.", "Parce que tu as battu mon record de gentillesse.", "Mais c'est toi que je garde en favori.", "Parce que tu es la preuve que le wifi gratuit existe."],
  quand: ["Dans 3 jours", "Ce week-end", "Au prochain apéro", "Dans exactement 11 minutes", "Avant la fin du mois", "Demain matin", "Pendant la prochaine pause", "Dès que tu auras sommeil", "Un mardi", "Quand tu t'y attendras le moins"],
  quoi: ["tu perdras quelque chose que tu portes sur toi", "quelqu'un te demandera si « ça va » et tu répondras faux", "tu diras « j'arrive » depuis ton canapé", "tu recevras un mème qui parle exactement de toi", "tu t'apercevras que tu avais raison, mais personne ne le saura", "tu paieras plus que prévu en disant « laisse, c'est bon »", "une pizza changera ton destin", "tu renverseras quelque chose de non essentiel", "tu auras une idée géniale que tu oublieras aussitôt", "tu croiseras un pigeon qui te jugera"],
  suite: ["et personne ne te croira.", "mais tu le garderas pour toi.", "et tout le monde fera semblant de ne rien voir.", "mais ça se passera mieux que prévu.", "et le groupe en parlera pendant des semaines.", "et tu en rigoleras plus tard.", "et ce sera ta faute, mais personne ne le dira."],
  relance1: ["Alors, t'es mort ou t'as juste le téléphone qui capte pas ?", "Je te rappelle que tu me dois une réponse depuis la semaine dernière.", "Coucou. Je sais que tu lis ça.", "Allô la Terre ? Ici le groupe.", "On est trois à t'attendre.", "Petit rappel amical :", "Message automatique, mais sincère :", "Ceci est ta dernière chance :"],
  relance2: ["On te laisse trente secondes.", "Un d'entre nous commence à te détester.", "Si tu réponds pas, on réserve ton siège à un chien.", "Dernière tentative avant de prévenir ta famille.", "Réponds avant que j'envoie un pigeon.", "On ne bougera pas sans toi, mais ça devient long.", "Je te laisse le choix : répondre ou être cité dans le groupe.", "Et n'oublie pas d'apporter à manger."],
  sujet: ["un hot-dog", "un cornichon", "une pizza ananas", "un poisson rouge", "le lundi", "un canapé", "un pigeon", "une chaussette", "un croissant", "le wifi", "la raclette", "une tartine de Nutella", "un grille-pain", "un sandwich triangle"],
  question: ["est-il un sandwich ? Défends-toi.", "peut-il être considéré comme un sport ?", "a-t-il un avenir en politique ?", "est-il plus intelligent qu'un humain à 7 h du matin ?", "mérite-t-il un jour férié ?", "pourrait-il gagner un combat contre un canard ?", "est-il vraiment ce qu'il prétend être ?", "devrait-il avoir le droit de vote ?", "est-il de gauche ou de droite ?", "serait-il un bon colocataire ?"],
  faute: ["tu arrives en retard", "tu manges le dernier morceau", "tu me laisses en vu", "tu spoiles la fin", "tu dis « j'arrive » sans bouger", "tu oublies mon anniversaire", "tu me prêtes une idée nulle", "tu touches à ma manette", "tu changes la playlist sans demander", "tu rates ton tour au jeu"],
  sanction: ["je raconte ta pire anecdote au groupe", "je te surnomme « Gaufre » pour les dix prochaines années", "je mets ta photo en fond d'écran de tout le monde", "je révèle ton mot de passe wifi à un pigeon", "je ne te prête plus jamais mon chargeur", "je te chante une chanson pendant tout le trajet", "je t'offre un cactus", "je prends ta place sur le canapé", "je dis à ta mère que tu n'as pas mangé de légumes", "je t'invite à un karaoké obligatoire"],
  motiv1: ["Le succès, c'est tomber sept fois et se relever huit… sauf si t'as un canapé.", "Crois en toi.", "Aujourd'hui est un nouveau jour.", "Rien n'est impossible.", "Les grandes choses commencent petit.", "Chaque champion a un jour dit « je n'ai pas envie »."],
  motiv2: ["Et si ça ne marche pas, mange une pizza.", "Mais demain, c'est le début du week-end, probablement.", "Surtout après une sieste.", "Mais personne n'a dit que tu devais le faire aujourd'hui.", "Et si ça rate, accuse le wifi.", "Respire, hydrate-toi, procrastine."],
  toastA: ["À ceux qui arrivent à l'heure,", "À ceux qui ont apporté à boire,", "À celui qui a oublié les verres,", "À la bande,", "Aux absents qui ont quand même répondu,", "À nos bonnes décisions,"],
  toastB: ["qu'on voit trop rarement.", "même si on ne le dit jamais.", "qui n'ont rien fait de la soirée.", "et à celui qui a encore oublié de payer.", "parce que sans vous, il n'y aurait que des chaises vides.", "ce soir, on est invincibles."],
  toastC: ["Santé !", "Tchin !", "À la nôtre !", "On remet ça la semaine prochaine !", "Et que le wifi nous soit favorable !"],
};

const more = (key, items) => (L[key] = [...(L[key] ?? []), ...items]);
more("ca", ["bonus de dernière minute", "coin de canapé inoccupé", "mot de passe qui marche du premier coup", "chargeur qui n'est pas à 3 %", "ticket de caisse sans mauvaise surprise", "dimanche sans lessive"]);
more("comp1", ["Tu es plus utile qu'un", "Je préfère vraiment ta compagnie à un", "Honnêtement, tu égales un", "Tu es la version humaine d'un", "T'es à peu près aussi cool qu'un"]);
more("comp2", ["Je ne plaisante qu'à moitié.", "Tu peux me citer.", "C'est un compliment, ne cherche pas plus loin.", "Maintenant, tu me dois une pizza.", "Tu l'as bien mérité."]);
more("pword", ["Latte", "Cactus", "Tornade", "Moustique", "Gaufre", "Pastèque", "Boomerang", "Flocon"]);
more("accroche", ["T'as un GPS ? Je me perds dans tes yeux.", "Tu crois au coup de foudre ou je repasse ?", "T'es un cadeau ou une erreur de livraison ?", "Tu fais de la magie ?", "Pardon, tu aurais un sourire à me prêter ?", "Tu es tombée du ciel ?", "Tu joues à quoi en ce moment ?", "Tu as un moment pour parler de pizza ?"]);
more("chute", ["Mais je te promets d'être à l'heure, une fois.", "Parce que tu m'as fait oublier mon mot de passe.", "Parce que tu es mon seul onglet ouvert.", "Mais je te laisse choisir le film.", "Parce que même mon chat est d'accord.", "Parce que tu fais mieux que le wifi.", "Mais attention, je ronfle.", "Parce que ton prénom est le seul que je n'ai pas oublié."]);
more("relance1", ["Hého ?", "Un petit signe de vie ?", "Alors, on fait quoi ?", "Je reformule :", "Message numéro quatre :", "Je me répète, mais"]);
more("relance2", ["Une réponse ou une pizza, au choix.", "Je commence à parler à ta photo de profil.", "On te garde une place, mais pas pour toujours.", "J'ai prévenu tes voisins.", "Réponds, on dirait que tu fais exprès.", "Même un emoji, ça nous suffit."]);
more("salut", ["Salut,", "Re,", "Hello,", "Yo,", "Coucou,", "Bonsoir,"]);
more("sujet", ["un tupperware", "un parapluie", "le dimanche soir", "une raclette", "un chargeur", "une trottinette", "un ananas", "un moustique", "le café", "une paire de chaussettes"]);
more("question", ["est-il plus rapide qu'un escargot motivé ?", "devrait-il être remboursé par la Sécu ?", "est-il un bon sujet de conversation à un mariage ?", "a-t-il déjà trahi quelqu'un ?", "mérite-t-il sa propre série ?", "est-il capable de garder un secret ?", "est-il la preuve qu'on vit dans une simulation ?", "pourrait-il diriger un pays ?"]);
more("faute", ["tu me spoiles encore", "tu prends mon fauteuil", "tu touches à mon assiette", "tu changes de sujet pour ne pas payer", "tu réponds « on verra »", "tu dis « je te rappelle » sans rappeler", "tu parles pendant mon film", "tu laisses la porte du frigo ouverte"]);
more("sanction", ["je poste ta photo de classe", "je lis tes vieux messages à voix haute", "je te fais écouter ma playlist pendant 3 heures", "je t'appelle « chouchou » en public", "je te réserve la pire place du canapé", "je raconte l'histoire du poulpe à tout le monde", "je t'envoie des mèmes à 3 h du matin", "je te mets en admin du groupe pour que tu gères tout"]);
more("danger", ["Je te préviens :", "Dernier avertissement :", "Attention :", "Règle numéro 1 :"]);
more("motiv1", ["Un voyage de mille lieues commence par un pas… ou par une sieste.", "Tu as déjà survécu à 100 % de tes pires journées.", "Les obstacles ne sont que des occasions de s'asseoir.", "Le courage, c'est d'y aller même quand on a faim.", "Sois le changement… mais après le café.", "Ce n'est pas la chute qui compte, c'est l'atterrissage sur un coussin.", "Personne n'est parfait, sauf peut-être la raclette.", "Tout vient à point à qui sait attendre sa commande.", "Le meilleur moment pour commencer, c'était hier. Le deuxième meilleur, c'est après la pause.", "Tu es plus fort que tu ne le crois, mais moins que ton canapé."]);
more("motiv2", ["Alors fais-le, ou fais semblant, c'est pareil.", "Et n'oublie pas de boire de l'eau.", "Je crois en toi, à 60 % au moins.", "Et si tu échoues, dis que c'était volontaire.", "Voilà, tu peux retourner te coucher.", "Et prends un en-cas, ça aide.", "Le reste, c'est des détails.", "Demain, tu feras mieux. Ou pas."]);
more("motiv3", ["Signé : ton coach imaginaire.", "Merci de ne pas me demander de preuves.", "Cette citation est certifiée sans valeur scientifique.", "À méditer sous la couette.", "Ou pas, je ne suis pas ta mère.", "Reviens quand tu auras mangé.", "(Source : un mug trouvé dans un bureau.)", "Fin du message d'encouragement."]);
more("toastA", ["À la raclette,", "À celui qui conduit (donc qui ne boit pas),", "À la dernière part de gâteau,", "Aux souvenirs qu'on ne racontera jamais devant la famille,", "À nos groupes de discussion silencieux,", "À ceux qui ont ramené des chips,"]);
more("toastB", ["qui rend tout meilleur.", "sans qui on s'ennuierait tous un peu.", "qu'on aimerait revoir plus souvent.", "même quand elle n'est pas drôle.", "et qui n'a jamais refusé un apéro.", "qu'on adore sans trop savoir pourquoi."]);
more("toastC", ["Que la fête commence !", "Vive nous !", "Bon appétit !"]);
more("quand", ["Dans une semaine pile", "Au prochain anniversaire", "Pendant ton café", "Quand le téléphone sonnera", "Dès ce soir"]);
more("quoi", ["tu apprendras un fait totalement inutile", "ton chargeur se cachera exprès", "tu seras invité à une soirée que tu regretteras d'avoir ratée", "quelqu'un te dira « t'as grossi » ou « t'as maigri » sans raison", "tu trouveras de l'argent dans une poche oubliée", "un inconnu te saluera comme un ami"]);
more("suite", ["mais tu ne le sauras qu'après.", "et ça deviendra une légende du groupe.", "et tu feras semblant que c'était prévu."]);
more("trophee", ["le trophée du plus beau fiasco", "la médaille de la ponctualité inversée", "la couronne du roi des excuses", "le ruban bleu du meilleur faux plan", "le certificat du « j'arrive » le plus faux", "la palme du retardataire", "le prix Nobel de la sieste", "le bonnet d'âne de la soirée"]);
more("motif", ["pour ton sens du timing.", "grâce à ta mauvaise foi exemplaire.", "pour avoir survécu à ta dernière blague.", "sans que personne ne sache pourquoi.", "pour ton obstination remarquable.", "parce que le jury a faim.", "malgré toutes tes tentatives pour y échapper.", "au nom du groupe entier.", "et c'est mérité.", "avec les félicitations du poulpe.", "parce que le règlement l'exige.", "en dépit de ton air innocent."]);

const T = (...args) => args;
const SPECS = {
  insulte: [
    T("{intro} espèce de {nom} {adj}."),
    T("T'as l'air d'un {nom} {adj}."),
    T("Tu es aussi utile que {objet}."),
    T("Tu as le {qualite} {ordre}."),
  ],
  compliment: [T("{comp1} {ca}. {comp2}")],
  surnom: [T("{titre} {mid} {fin}")],
  pseudo: [T("xX_{pword}_Xx"), T("{pword}{ptail}"), T("Le{pword}Masqué_{ptail}"), T("{pword}_{pword}")],
  drague: [T("{accroche} {chute}"), T("{salut} {accroche} {chute}")],
  prediction: [T("{quand}, {quoi}, {suite}")],
  relance: [T("{relance1} {relance2}"), T("{salut} {relance1} {relance2}")],
  debat: [T("Débat : {sujet} {question}"), T("Combat : {sujet} contre {sujet}. Qui gagne ?")],
  menace: [T("Si {faute}, {sanction}."), T("{danger} si {faute}, {sanction}.")],
  motivation: [T("{motiv1} {motiv2}"), T("{motiv1} {motiv2} {motiv3}")],
  toast: [T("{toastA} {toastB} {toastC}")],
  trophee: [T("Tu {verbe} {trophee} {motif}"), T("{intro} tu {verbe} {trophee} {motif}")],
};

const slotsOf = (template) => [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
const countOf = (specs) => specs.reduce((sum, [template]) => sum + slotsOf(template).reduce((product, slot) => product * L[slot].length, 1), 0);
const fill = (specs) => {
  const [template] = pick(specs);
  return template.replace(/\{(\w+)\}/g, (_, slot) => pick(L[slot]));
};

const GENERATORS = Object.fromEntries(Object.entries(SPECS).map(([key, specs]) => [key, () => fill(specs)]));
const COUNTS = Object.fromEntries(Object.entries(SPECS).map(([key, specs]) => [key, countOf(specs)]));
const NAMED = ["insulte", "compliment", "prediction", "relance", "menace", "trophee"];

const type = document.getElementById("type");
const out = document.getElementById("output");
const who = document.getElementById("who");
const history = document.getElementById("history");
const countEl = document.getElementById("count");

function generate() {
  countEl.textContent = `${COUNTS[type.value].toLocaleString("fr-FR")} combinaisons possibles`;
  const text = GENERATORS[type.value]();
  const target = who.value.trim();
  const needsName = NAMED.includes(type.value);
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
