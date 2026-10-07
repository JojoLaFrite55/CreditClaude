import { createSfx, mountSoundButton, pick } from "../arcade/kit.js";

const WORDS = `ABEJA ACIER ACTIF ADIEU AGILE AIGLE ALBUM ALLER AMOUR ANGLE ANNEE APPEL ARBRE ARGENT ARMEE ASILE ATOME AUTRE AVION AVOIR BAGUE BALLE BANDE BARBE BASSE BATON BETON BIERE BILAN BLANC BLEUS BOIRE BOITE BONUS BORNE BOULE BRAVO BRUIT BRUME BULLE BUREAU CABLE CADRE CAFES CALME CANAL CARTE CASSE CHAIR CHAMP CHANT CHAOS CHAUD CHIEN CHOSE CIBLE CIGALE CLASSE CLOWN COEUR COLLE COMTE COURS CRAIE CREME CRISE CROIX CYCLE DANSE DEBUT DENSE DEPOT DIGNE DOUCE DRAME DROIT DUVET ECHEC ECRAN EFFET ELITE EMAIL ENFER ENTRE EPAIS EPOUX EQUIPE ERREUR ETAGE ETUDE FABLE FAIRE FAUNE FERME FETES FIBRE FILET FILMS FLAMME FLEUR FLUTE FORCE FORET FORME FOULE FRAIS FRERE FRUIT FUMEE GAMME GARDE GENIE GIVRE GLACE GLOBE GOUTS GRAIN GRAND GRAVE GREVE GUIDE HABIT HAUTE HEROS HIBOU HOTEL HUMOUR IDEAL IMAGE INDEX JAMBE JARDIN JAUNE JETON JOUER JOUET JUGER JUSTE KARMA KOALA LAINE LAPIN LARGE LASER LEGER LIBRE LIEUX LIGNE LISTE LIVRE LOURD LUEUR LUNES LUTTE MAGIE MAINS MAIRE MARCHE MASSE MATCH MAUVE MERCI METAL MIROIR MODE MONDE MONTE MORAL MOTEUR MOUCHE MUSEE NAGER NERFS NIVEAU NOBLE NOIRE NOTES NUAGE OCEAN OFFRE OMBRE ONDES OPERA ORAGE ORDRE OUTIL PAIRE PAPIER PARTI PATTE PAUSE PEINE PERLE PHARE PHOTO PIANO PIECE PILOTE PIRATE PISTE PIZZA PLAGE PLANTE PLUME POINT POIRE POMME PORTE POSTE POUCE PRIME PRIX PROIE PUCES PUITS QUART RADIO RAISIN RAPIDE REGLE REINE RENDU RESTE RETOUR REVER RIVAL ROBOT ROCHE ROUGE ROUTE ROYAL RUBAN SABLE SALLE SALON SAUCE SAULE SCENE SERIE SIGNE SOLDE SONGE SORTE SOUPE SOURD SPORT STADE STYLE SUCRE SUITE SUPER SURFS TABLE TACHE TALON TASSE TEMPS TERRE TEXTE THEME TIGRE TITRE TOILE TOMBE TORCHE TOUCHE TOURS TRACE TRAIN TRAIT TRIBU TRONC TUYAU UNION USAGE VAGUE VALET VALSE VELOS VENTE VERRE VIDEO VILLE VIRUS VISAGE VITRE VIVRE VOEUX VOILE VOLER VOTRE VOYAGE ZEBRE ZESTE ZONES`
  .split(/\s+/)
  .filter((word) => word.length === 5 && /^[A-Z]+$/.test(word));

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const grid = document.getElementById("wgrid");
const keyboard = document.getElementById("wkeys");
const info = document.getElementById("winfo");
const modeSel = document.getElementById("mode");
const ROWS = 6;
const COLS = 5;

const daily = () => {
  const day = Math.floor(Date.now() / 86400000);
  return WORDS[(day * 7919) % WORDS.length];
};

const state = { answer: "", row: 0, col: 0, letters: [], done: false, marks: {} };

function build() {
  grid.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "wrow";
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "wcell";
      row.append(cell);
    }
    grid.append(row);
  }
  keyboard.innerHTML = "";
  for (const line of ["AZERTYUIOP", "QSDFGHJKLM", "↵WXCVBN⌫"]) {
    const row = document.createElement("div");
    row.className = "wkrow";
    for (const key of line) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wkey";
      button.dataset.key = key;
      button.textContent = key;
      button.addEventListener("click", () => press(key));
      row.append(button);
    }
    keyboard.append(row);
  }
}

function reset() {
  state.answer = modeSel.value === "daily" ? daily() : pick(WORDS);
  Object.assign(state, { row: 0, col: 0, letters: Array.from({ length: ROWS }, () => Array(COLS).fill("")), done: false, marks: {} });
  build();
  info.textContent = modeSel.value === "daily" ? "Mot du jour : le même pour toute la bande, il change à minuit." : "Partie libre : un mot au hasard.";
}

const cell = (r, c) => grid.children[r].children[c];

function press(key) {
  sfx.init();
  if (state.done) return;
  if (key === "⌫" || key === "BACKSPACE") {
    if (state.col > 0) {
      state.col -= 1;
      state.letters[state.row][state.col] = "";
      cell(state.row, state.col).textContent = "";
      cell(state.row, state.col).classList.remove("filled");
    }
    return;
  }
  if (key === "↵" || key === "ENTER") {
    submit();
    return;
  }
  if (/^[A-Z]$/.test(key) && state.col < COLS) {
    state.letters[state.row][state.col] = key;
    const node = cell(state.row, state.col);
    node.textContent = key;
    node.classList.add("filled");
    state.col += 1;
    sfx.tick();
  }
}

function evaluate(guess) {
  const result = Array(COLS).fill("absent");
  const pool = state.answer.split("");
  guess.split("").forEach((letter, i) => {
    if (letter === state.answer[i]) {
      result[i] = "correct";
      pool[i] = null;
    }
  });
  guess.split("").forEach((letter, i) => {
    if (result[i] === "correct") return;
    const at = pool.indexOf(letter);
    if (at !== -1) {
      result[i] = "present";
      pool[at] = null;
    }
  });
  return result;
}

function submit() {
  if (state.col < COLS) {
    grid.children[state.row].classList.add("shake");
    setTimeout(() => grid.children[state.row].classList.remove("shake"), 400);
    sfx.tone("square", 180, 120, 0.1, 0.1);
    return;
  }
  const guess = state.letters[state.row].join("");
  const result = evaluate(guess);
  const rank = { absent: 0, present: 1, correct: 2 };
  const currentRow = state.row;
  result.forEach((mark, i) => {
    setTimeout(() => {
      cell(currentRow, i).classList.add(mark, "flip");
      sfx.tone("triangle", 400 + i * 60, 400 + i * 60, 0.08, 0.08);
    }, i * 220);
    if ((state.marks[guess[i]] ?? -1) < rank[mark]) state.marks[guess[i]] = rank[mark];
  });
  setTimeout(() => {
    Object.entries(state.marks).forEach(([letter, value]) => {
      const key = keyboard.querySelector(`[data-key="${letter}"]`);
      key?.classList.remove("absent", "present", "correct");
      key?.classList.add(["absent", "present", "correct"][value]);
    });
  }, COLS * 220);
  if (guess === state.answer) {
    state.done = true;
    setTimeout(() => {
      sfx.win();
      info.innerHTML = `<strong>Bravo !</strong> Trouvé en ${state.row} essai${state.row > 1 ? "s" : ""}. <button class="btn btn-small btn-secondary" id="share" type="button">Copier le résultat</button>`;
      document.getElementById("share").addEventListener("click", copyResult);
    }, COLS * 220 + 100);
  } else if (state.row === ROWS - 1) {
    state.done = true;
    setTimeout(() => {
      sfx.lose();
      info.innerHTML = `Perdu ! Le mot était <strong>${state.answer}</strong>.`;
    }, COLS * 220 + 100);
  }
  state.row += 1;
  state.col = 0;
}

const history = [];
function copyResult(event) {
  const lines = [...grid.children].slice(0, state.row).map((row) => [...row.children].map((c) => (c.classList.contains("correct") ? "🟩" : c.classList.contains("present") ? "🟨" : "⬛")).join(""));
  navigator.clipboard?.writeText(`Mot-Tête ${lines.length}/${ROWS}\n${lines.join("\n")}`).then(
    () => (event.target.textContent = "Copié !"),
    () => (event.target.textContent = "Copie impossible"),
  );
  history.push(lines.length);
}

addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof HTMLSelectElement) return;
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key.toUpperCase();
  if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
    event.preventDefault();
    press(key);
  }
});

modeSel.addEventListener("change", () => {
  sfx.init();
  sfx.click();
  reset();
});
document.getElementById("again").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  modeSel.value = "free";
  reset();
});
reset();
