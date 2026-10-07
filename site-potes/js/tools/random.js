import { createSfx, loadHeads, mountSoundButton, pick } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();

const lists = {
  pays: ["Japon", "Islande", "Mexique", "Portugal", "Norvège", "Canada", "Égypte", "Pérou", "Nouvelle-Zélande", "Maroc", "Vietnam", "Grèce", "Brésil", "Écosse", "Kenya", "Thaïlande"],
  animal: ["Capybara", "Pingouin", "Lama", "Hérisson", "Loutre", "Flamant rose", "Panda roux", "Koala", "Axolotl", "Pieuvre", "Suricate", "Paresseux", "Fennec", "Tapir"],
  plat: ["Raclette", "Sushis", "Tacos", "Lasagnes", "Crêpes", "Pad thaï", "Burger maison", "Couscous", "Ramen", "Quiche", "Falafels", "Paella", "Pizza ananas (courage)", "Croque-monsieur"],
  boisson: ["Limonade", "Thé glacé", "Chocolat chaud", "Smoothie mangue", "Café latte", "Sirop de grenadine", "Jus de pomme", "Eau pétillante citron", "Milkshake", "Menthe à l'eau"],
  activite: ["Faire une partie de cartes", "Aller au bowling", "Regarder un film nul", "Cuisiner un truc compliqué", "Faire un quiz", "Marcher sans but", "Jouer à cache-cache", "Karaoké à voix basse", "Construire une cabane", "Jeux de société", "Sortir le chien de quelqu'un"],
  defi: ["Parler sans dire « euh » pendant 1 minute", "Faire 20 pompes", "Imiter un pote jusqu'à ce qu'on devine", "Chanter l'hymne d'un pays au hasard", "Manger une cuillère de moutarde (ou de miel)", "Dire l'alphabet à l'envers", "Tenir en équilibre sur une jambe 30 secondes", "Écrire son prénom avec le pied"],
  fait: ["Le miel ne périme pratiquement jamais.", "Une pieuvre a trois cœurs.", "Une banane est botaniquement une baie.", "Les wombats font des crottes en forme de cubes.", "Un jour sur Vénus dure plus longtemps qu'une année sur Vénus.", "La tour Eiffel peut grandir de quelques centimètres en été.", "Les loutres se tiennent la main pour ne pas dériver pendant qu'elles dorment.", "Les pommes flottent, car elles sont composées d'environ 25 % d'air.", "Les flamants roses naissent gris.", "Les abeilles peuvent reconnaître des visages humains."],
  vie: ["Jardinier de nuages", "Testeur officiel de toboggans", "Chef de la mauvaise foi", "Maître chocolatier", "Pilote de montgolfière", "Dresseur de pigeons", "Détective de l'à peu près", "Gardien de phare", "Critique de films nuls", "Dégustateur de pizzas"],
  idee: ["Acheter un poisson rouge et lui donner un prénom de footballeur", "Apprendre trois mots de japonais", "Envoyer un message à quelqu'un qu'on n'a pas vu depuis 1 an", "Faire un pique-nique en plein hiver", "Écrire une lettre à soi-même", "Ranger un tiroir", "Faire le tour du quartier à vélo", "Regarder le lever du soleil"],
  groupe: ["Les Pantoufles Furieuses", "Kebab Sauvage", "Le Wifi Coupé", "Chaussettes d'Acier", "Raclette Révolution", "Les Poulpes Cosmiques", "Mamie Turbo", "Fromage et Chaos", "Les Mauvais Plans", "Tonnerre en Pyjama"],
  film: ["Le Retour du Canapé", "Cours, Pizza, cours", "Mission : Impossible de se lever", "Le Dernier Wifi", "Pote Story 4", "Les Aventures d'un Chargeur", "Rendez-vous à 20 h (il est 22 h)", "Le Parrain de la Raclette"],
  cadeau: ["Une chaussette dépareillée", "Un abonnement à un journal qui n'existe plus", "Un cactus en pot, sans pot", "Un puzzle de 5000 pièces", "Un mug « meilleur collègue »", "Une bougie à l'odeur de pizza", "Un livre de recettes sans les quantités", "Un parapluie troué"],
  pouvoir: ["Parler aux pigeons, mais ils ne répondent que de travers", "Rendre n'importe quel objet un peu tiède", "Toujours savoir l'heure, mais jamais la date", "Faire apparaître une chaise sous quiconque", "Sentir le fromage à 20 km", "Courir très vite en arrière uniquement"],
  mot: ["Brouhaha", "Saperlipopette", "Chaussette", "Ronflement", "Kaléidoscope", "Bouillabaisse", "Zigzag", "Cornichon", "Abracadabra", "Pamplemousse", "Hurluberlu", "Ouistiti", "Brocoli", "Rhinocéros"],
};

const CARDS = ["As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Valet", "Dame", "Roi"];
const SUITS = [["♠", "#111"], ["♥", "#d12"], ["♦", "#d12"], ["♣", "#111"]];
const EMOJIS = ["😀", "😎", "🤡", "👻", "💀", "🐸", "🍕", "🔥", "🦄", "🚀", "🐙", "🧀", "🥔", "🎸", "🛸", "🦆", "🌮", "🧦"];
const hex = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

const GENERATORS = [
  { id: "nombre", title: "Nombre de 1 à 100", run: () => String(1 + Math.floor(Math.random() * 100)), big: true },
  { id: "chiffre", title: "Chiffre porte-bonheur", run: () => String(Math.floor(Math.random() * 10)), big: true },
  { id: "lettre", title: "Lettre de l'alphabet", run: () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)], big: true },
  { id: "de", title: "Lancer de dé", run: () => ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][Math.floor(Math.random() * 6)], big: true },
  { id: "carte", title: "Carte à jouer", run: (node) => { const [suit, color] = pick(SUITS); node.style.color = color; return `${pick(CARDS)} ${suit}`; }, big: true },
  { id: "couleur", title: "Couleur", run: (node) => { const c = hex(); node.style.background = c; node.style.color = "#fff"; node.style.textShadow = "0 1px 3px #000"; return c.toUpperCase(); }, swatch: true },
  { id: "emoji", title: "Émoji", run: () => pick(EMOJIS), big: true },
  { id: "tete", title: "Tête au hasard", run: (node) => { node.innerHTML = ""; const head = pick(heads); const el = document.createElement(head instanceof HTMLCanvasElement ? "canvas" : "img"); if (head instanceof HTMLCanvasElement) { el.width = head.width; el.height = head.height; el.getContext("2d").drawImage(head, 0, 0); } else { el.src = head.src; el.alt = ""; } node.append(el); return ""; }, head: true },
  { id: "pays", title: "Destination de vacances", run: () => pick(lists.pays) },
  { id: "animal", title: "Animal totem", run: () => pick(lists.animal) },
  { id: "plat", title: "Qu'est-ce qu'on mange ?", run: () => pick(lists.plat) },
  { id: "boisson", title: "Boisson", run: () => pick(lists.boisson) },
  { id: "activite", title: "Activité", run: () => pick(lists.activite) },
  { id: "defi", title: "Mini défi", run: () => pick(lists.defi) },
  { id: "fait", title: "Fait inutile", run: () => pick(lists.fait) },
  { id: "vie", title: "Métier de ta prochaine vie", run: () => pick(lists.vie) },
  { id: "idee", title: "Bonne idée du jour", run: () => pick(lists.idee) },
  { id: "groupe", title: "Nom de groupe de musique", run: () => pick(lists.groupe) },
  { id: "film", title: "Titre de film", run: () => pick(lists.film) },
  { id: "cadeau", title: "Cadeau nul", run: () => pick(lists.cadeau) },
  { id: "pouvoir", title: "Pire super-pouvoir", run: () => pick(lists.pouvoir) },
  { id: "mot", title: "Mot rigolo", run: () => pick(lists.mot) },
  { id: "heure", title: "Heure de rendez-vous", run: () => `${String(Math.floor(Math.random() * 24)).padStart(2, "0")} h ${String(Math.floor(Math.random() * 12) * 5).padStart(2, "0")}`, big: true },
];

const grid = document.getElementById("cards");
const runs = [];

for (const gen of GENERATORS) {
  const card = document.createElement("article");
  card.className = "rcard";
  const title = document.createElement("h3");
  title.textContent = gen.title;
  const value = document.createElement("div");
  value.className = `rvalue${gen.big ? " big" : ""}${gen.swatch ? " swatch" : ""}${gen.head ? " head" : ""}`;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-small btn-secondary";
  button.textContent = "Relancer";
  const run = () => {
    value.style.color = "";
    value.style.background = "";
    value.style.textShadow = "";
    const text = gen.run(value);
    if (!gen.head) value.textContent = text;
    value.classList.remove("pop");
    void value.offsetWidth;
    value.classList.add("pop");
  };
  button.addEventListener("click", () => {
    sfx.init();
    sfx.pop();
    run();
  });
  runs.push(run);
  card.append(title, value, button);
  grid.append(card);
  run();
}

document.getElementById("all").addEventListener("click", () => {
  sfx.init();
  sfx.coin();
  runs.forEach((run) => run());
});
