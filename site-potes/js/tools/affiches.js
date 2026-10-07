import { downloadCanvas } from "../meme-core.js";
import { createSfx, loadMemeModels, mountSoundButton } from "../arcade/kit.js";

const W = 720;
const H = 960;
const canvas = document.getElementById("poster");
canvas.width = W;
canvas.height = H;
const g = canvas.getContext("2d");
const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();

const modelBox = document.getElementById("models");
const templateSel = document.getElementById("template");
const nameInput = document.getElementById("name");
const extraInput = document.getElementById("extra");
const extraLabel = document.getElementById("extra-label");
let current = 0;

const TEMPLATES = {
  wanted: { label: "Récompense (en $)", extra: "5 000 000", name: "Le pote en question" },
  employee: { label: "Mois", extra: "Octobre", name: "Le pote en question" },
  certificate: { label: "Pour avoir…", extra: "avoir dit « j'arrive » depuis 3 heures", name: "Le pote en question" },
  pasdispo: { label: "Message d'absence", extra: "Injoignable jusqu'à nouvel ordre", name: "Le pote en question" },
  film: { label: "Slogan", extra: "Cet été, personne ne sera à l'heure", name: "Le Retour du Retardataire" },
  disparu: { label: "Dernière fois vu…", extra: "au moment de payer l'addition", name: "Le pote en question" },
  election: { label: "Promesse de campagne", extra: "Pizza gratuite tous les vendredis", name: "Le pote en question" },
  identite: { label: "Profession", extra: "Professionnel de la procrastination", name: "Le pote en question" },
  avendre: { label: "Prix (en €)", extra: "1", name: "Pote en bon état" },
  alerte: { label: "Titre de l'info", extra: "Il n'a toujours pas répondu au groupe", name: "Le pote en question" },
};

function wrapText(text, maxWidth, font) {
  g.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function face(image, cx, cy, height, filter = "none") {
  const ratio = image.width / image.height;
  const width = Math.min(height * ratio, W * 0.7);
  const h = width / ratio;
  g.save();
  g.filter = filter;
  g.drawImage(image, cx - width / 2, cy - h / 2, width, h);
  g.restore();
}

function centered(text, y, font, color, maxWidth = W - 100, lineHeight = 1.15) {
  const size = parseInt(font.match(/(\d+)px/)[1], 10);
  const lines = wrapText(text, maxWidth, font);
  g.font = font;
  g.fillStyle = color;
  g.textAlign = "center";
  lines.forEach((line, index) => g.fillText(line, W / 2, y + index * size * lineHeight));
  return y + lines.length * size * lineHeight;
}

function single(text, y, size, family, color, maxWidth = W - 120, minSize = 30) {
  let current = size;
  g.font = `400 ${current}px ${family}`;
  while (g.measureText(text).width > maxWidth && current > minSize) {
    current -= 2;
    g.font = `400 ${current}px ${family}`;
  }
  g.fillStyle = color;
  g.textAlign = "center";
  g.fillText(text, W / 2, y);
}

const ANTON = "Anton, Impact, sans-serif";

const draws = {
  wanted(image, name, extra) {
    const paper = g.createLinearGradient(0, 0, W, H);
    paper.addColorStop(0, "#e9d3a0");
    paper.addColorStop(1, "#cfae6e");
    g.fillStyle = paper;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = `rgba(90,60,20,${Math.random() * 0.06})`;
      g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    g.strokeStyle = "#4a2f12";
    g.lineWidth = 10;
    g.strokeRect(30, 30, W - 60, H - 60);
    g.lineWidth = 3;
    g.strokeRect(46, 46, W - 92, H - 92);
    g.font = '400 140px Anton, Impact, sans-serif';
    g.textAlign = "center";
    g.fillStyle = "#3a230c";
    g.fillText("WANTED", W / 2, 190);
    single("RECHERCHÉ — MORT OU VIF (SURTOUT VIF)", 240, 36, ANTON, "#3a230c", W - 130, 22);
    g.fillStyle = "#f4e4bb";
    g.fillRect(110, 270, W - 220, 380);
    g.strokeStyle = "#3a230c";
    g.lineWidth = 6;
    g.strokeRect(110, 270, W - 220, 380);
    g.save();
    g.beginPath();
    g.rect(112, 272, W - 224, 376);
    g.clip();
    face(image, W / 2, 460, 350, "sepia(0.85) contrast(1.1)");
    g.restore();
    single((name || "INCONNU").toUpperCase(), 735, 64, ANTON, "#3a230c");
    g.font = '400 30px Anton, Impact, sans-serif';
    g.fillStyle = "#3a230c";
    g.fillText("RÉCOMPENSE", W / 2, 820);
    g.font = '400 80px Anton, Impact, sans-serif';
    g.fillText(`${extra || "0"} $`, W / 2, 895);
  },
  employee(image, name, extra) {
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1b3b6f");
    bg.addColorStop(1, "#0d1f40");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#e0b84a";
    g.lineWidth = 14;
    g.strokeRect(34, 34, W - 68, H - 68);
    g.lineWidth = 3;
    g.strokeRect(56, 56, W - 112, H - 112);
    g.fillStyle = "#e0b84a";
    g.font = '400 84px Anton, Impact, sans-serif';
    g.textAlign = "center";
    g.fillText("EMPLOYÉ", W / 2, 160);
    g.fillText("DU MOIS", W / 2, 245);
    g.fillStyle = "#fff";
    g.fillRect(150, 290, W - 300, 380);
    g.strokeStyle = "#e0b84a";
    g.lineWidth = 8;
    g.strokeRect(150, 290, W - 300, 380);
    g.save();
    g.beginPath();
    g.rect(152, 292, W - 304, 376);
    g.clip();
    g.fillStyle = "#cfe3ff";
    g.fillRect(150, 290, W - 300, 380);
    face(image, W / 2, 480, 360);
    g.restore();
    single((name || "Anonyme").toUpperCase(), 755, 62, ANTON, "#ffffff");
    single(`— ${(extra || "").toUpperCase()} —`, 835, 40, ANTON, "#e0b84a", W - 140, 22);
    g.fillStyle = "#e0b84a";
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      const cx = W / 2 - 100 + i * 50;
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 7 : 16;
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        g.lineTo(cx + Math.cos(a) * r, 880 + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
    }
  },
  certificate(image, name, extra) {
    g.fillStyle = "#fbf6e6";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#8a6d1d";
    g.lineWidth = 16;
    g.strokeRect(30, 30, W - 60, H - 60);
    g.lineWidth = 3;
    g.strokeRect(58, 58, W - 116, H - 116);
    g.fillStyle = "#6b5212";
    g.textAlign = "center";
    g.font = '400 70px Anton, Impact, sans-serif';
    g.fillText("CERTIFICAT", W / 2, 170);
    g.font = '400 44px Anton, Impact, sans-serif';
    g.fillText("OFFICIEL DE NULLITÉ", W / 2, 230);
    face(image, W / 2, 400, 230);
    g.fillStyle = "#3a2e0a";
    g.font = 'italic 400 32px "Inter", Georgia, serif';
    g.fillText("Il est solennellement décerné à", W / 2, 560);
    single((name || "Anonyme").toUpperCase(), 640, 66, ANTON, "#3a2e0a", W - 140);
    g.font = 'italic 400 32px "Inter", Georgia, serif';
    g.fillStyle = "#3a2e0a";
    g.fillText("pour avoir brillamment réussi à", W / 2, 745);
    centered(extra || "…", 800, 'italic 700 36px "Inter", Georgia, serif', "#6b1f1f", W - 150, 1.25);
    g.strokeStyle = "#6b5212";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(110, 890);
    g.lineTo(300, 890);
    g.moveTo(W - 300, 890);
    g.lineTo(W - 110, 890);
    g.stroke();
    g.font = '400 20px "Inter", sans-serif';
    g.fillStyle = "#6b5212";
    g.fillText("Le comité", 205, 915);
    g.fillText("Le QG", W - 205, 915);
    g.fillStyle = "#b8860b";
    g.beginPath();
    g.arc(W / 2, 880, 36, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff6c8";
    g.font = '400 30px Anton, sans-serif';
    g.fillText("QG", W / 2, 891);
  },
  pasdispo(image, name, extra) {
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#2b2d42");
    bg.addColorStop(1, "#8d99ae");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#ef233c";
    g.fillRect(0, 70, W, 110);
    g.fillStyle = "#fff";
    g.font = '400 78px Anton, Impact, sans-serif';
    g.textAlign = "center";
    g.fillText("INDISPONIBLE", W / 2, 150);
    face(image, W / 2, 440, 400, "grayscale(0.7) contrast(1.1)");
    g.save();
    g.translate(W / 2, 450);
    g.rotate(-0.25);
    g.strokeStyle = "#ef233c";
    g.lineWidth = 18;
    g.beginPath();
    g.arc(0, 0, 210, 0, Math.PI * 2);
    g.moveTo(-150, -150);
    g.lineTo(150, 150);
    g.stroke();
    g.restore();
    single((name || "Anonyme").toUpperCase(), 770, 64, ANTON, "#fff");
    centered(extra || "", 840, '600 34px "Inter", sans-serif', "#ffd6da", W - 140, 1.25);
  },

  film(image, name, extra) {
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#04040c");
    bg.addColorStop(0.55, "#1a0b2e");
    bg.addColorStop(1, "#4a1a0a");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W / 2, 470, 20, W / 2, 470, 360);
    glow.addColorStop(0, "rgba(255,170,60,0.55)");
    glow.addColorStop(1, "rgba(255,170,60,0)");
    g.fillStyle = glow;
    g.fillRect(0, 100, W, 740);
    g.textAlign = "center";
    g.fillStyle = "#ffd9a0";
    g.font = '400 24px "Inter", sans-serif';
    g.fillText("LE QG FILMS PRÉSENTE", W / 2, 70);
    face(image, W / 2, 430, 520);
    g.fillStyle = "rgba(0,0,0,0.0)";
    single((name || "TITRE").toUpperCase(), 760, 78, ANTON, "#ffd24a", W - 80, 36);
    centered(extra || "", 810, 'italic 500 28px "Inter", Georgia, serif', "#ffe9c4", W - 140, 1.3);
    g.fillStyle = "#b8a58a";
    g.font = '400 20px "Inter", sans-serif';
    g.fillText("AVEC LES POTES · SORTIE EN SALLES QUAND ILS SERONT PRÊTS", W / 2, 910);
  },
  disparu(image, name, extra) {
    g.fillStyle = "#f6f6f0";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#111";
    g.fillRect(0, 0, W, 170);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = '400 100px Anton, Impact, sans-serif';
    g.fillText("DISPARU", W / 2, 128);
    g.fillStyle = "#fff";
    g.fillRect(130, 210, W - 260, 400);
    g.strokeStyle = "#111";
    g.lineWidth = 6;
    g.strokeRect(130, 210, W - 260, 400);
    g.save();
    g.beginPath();
    g.rect(132, 212, W - 264, 396);
    g.clip();
    face(image, W / 2, 410, 380, "grayscale(1) contrast(1.15)");
    g.restore();
    single((name || "INCONNU").toUpperCase(), 690, 64, ANTON, "#111");
    g.font = '600 26px "Inter", sans-serif';
    g.fillStyle = "#444";
    g.fillText("DERNIÈRE FOIS VU", W / 2, 745);
    centered(extra || "", 795, '700 36px "Inter", sans-serif', "#111", W - 150, 1.25);
    g.font = '500 22px "Inter", sans-serif';
    g.fillStyle = "#666";
    g.fillText("Si vous l'avez vu, ne le prévenez pas.", W / 2, 910);
  },
  election(image, name, extra) {
    g.fillStyle = "#fff";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#1d4ed8";
    g.fillRect(0, 0, W, 330);
    g.fillStyle = "#fff";
    g.fillRect(0, 330, W, 40);
    g.fillStyle = "#dc2626";
    g.fillRect(0, 370, W, 40);
    g.textAlign = "center";
    g.fillStyle = "#fff";
    g.font = '400 64px Anton, Impact, sans-serif';
    g.fillText("VOTEZ", W / 2, 150);
    single((name || "").toUpperCase(), 250, 84, ANTON, "#fff", W - 100, 34);
    g.fillStyle = "#e9eefb";
    g.fillRect(150, 440, W - 300, 330);
    g.strokeStyle = "#1d4ed8";
    g.lineWidth = 8;
    g.strokeRect(150, 440, W - 300, 330);
    g.save();
    g.beginPath();
    g.rect(152, 442, W - 304, 326);
    g.clip();
    face(image, W / 2, 610, 320);
    g.restore();
    g.fillStyle = "#1d4ed8";
    g.font = '400 36px Anton, Impact, sans-serif';
    g.fillText("MON PROGRAMME", W / 2, 830);
    centered(extra || "", 880, '700 30px "Inter", sans-serif', "#111", W - 120, 1.2);
  },
  identite(image, name, extra) {
    g.fillStyle = "#e9f1ff";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#2b4a8b";
    g.fillRect(0, 0, W, 140);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = '400 54px Anton, Impact, sans-serif';
    g.fillText("CARTE D'IDENTITÉ DU QG", W / 2, 90);
    g.fillStyle = "#fff";
    g.fillRect(60, 200, 280, 360);
    g.strokeStyle = "#2b4a8b";
    g.lineWidth = 5;
    g.strokeRect(60, 200, 280, 360);
    g.save();
    g.beginPath();
    g.rect(62, 202, 276, 356);
    g.clip();
    face(image, 200, 380, 340);
    g.restore();
    g.textAlign = "left";
    g.fillStyle = "#2b4a8b";
    g.font = '600 20px "Inter", sans-serif';
    const rows = [["NOM", (name || "").toUpperCase()], ["PROFESSION", extra || ""], ["TAILLE", "Assez grand"], ["SIGNE PARTICULIER", "Dit « j'arrive »"], ["NATIONALITÉ", "Du QG"]];
    let y = 235;
    for (const [label, value] of rows) {
      g.fillStyle = "#6a7fb0";
      g.font = '600 16px "Inter", sans-serif';
      g.fillText(label, 380, y);
      let size = 28;
      g.font = `700 ${size}px "Inter", sans-serif`;
      while (g.measureText(value).width > W - 410 && size > 14) {
        size -= 2;
        g.font = `700 ${size}px "Inter", sans-serif`;
      }
      g.fillStyle = "#111";
      g.fillText(value, 380, y + 32);
      y += 78;
    }
    g.fillStyle = "#cfd9ef";
    g.fillRect(60, 640, W - 120, 120);
    g.fillStyle = "#2b4a8b";
    g.font = '700 28px monospace';
    const code = `IDQG<<${(name || "X").toUpperCase().replace(/[^A-Z]/g, "<").slice(0, 20).padEnd(20, "<")}`;
    g.fillText(code, 80, 690);
    g.fillText("0000000000QG<<<<<<<<<<<<<<<<<<<<<0", 80, 735);
    g.textAlign = "center";
    g.fillStyle = "#6a7fb0";
    g.font = '500 20px "Inter", sans-serif';
    g.fillText("Document sans aucune valeur légale", W / 2, 880);
  },
  avendre(image, name, extra) {
    g.fillStyle = "#fff59d";
    g.fillRect(0, 0, W, H);
    g.textAlign = "center";
    single("À VENDRE", 190, 150, ANTON, "#c62828", W - 80, 60);
    g.fillStyle = "#fff";
    g.fillRect(140, 235, W - 280, 380);
    g.strokeStyle = "#111";
    g.lineWidth = 6;
    g.strokeRect(140, 235, W - 280, 380);
    g.save();
    g.beginPath();
    g.rect(142, 237, W - 284, 376);
    g.clip();
    face(image, W / 2, 430, 360);
    g.restore();
    single((name || "").toUpperCase(), 695, 60, ANTON, "#111", W - 100, 28);
    g.fillStyle = "#c62828";
    g.font = '400 120px Anton, Impact, sans-serif';
    g.fillText(`${extra || "0"} €`, W / 2, 830);
    g.fillStyle = "#333";
    g.font = '600 20px "Inter", sans-serif';
    g.fillText("Fonctionne sans piles · Non repris ni échangé", W / 2, 900);
  },
  alerte(image, name, extra) {
    g.fillStyle = "#0b1b4d";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#c8102e";
    g.fillRect(0, 0, W, 90);
    g.fillStyle = "#fff";
    g.textAlign = "left";
    g.font = '400 48px Anton, Impact, sans-serif';
    g.fillText("ALERTE INFO", 40, 64);
    g.textAlign = "right";
    g.font = '600 24px "Inter", sans-serif';
    g.fillText("EN DIRECT", W - 40, 60);
    g.fillStyle = "#13265f";
    g.fillRect(60, 130, W - 120, 470);
    g.save();
    g.beginPath();
    g.rect(60, 130, W - 120, 470);
    g.clip();
    face(image, W / 2, 380, 460);
    g.restore();
    g.fillStyle = "#ffd400";
    g.fillRect(0, 640, W, 190);
    g.textAlign = "center";
    const lines = wrapText((extra || "").toUpperCase(), W - 100, '400 46px Anton, Impact, sans-serif');
    g.fillStyle = "#0b1b4d";
    g.font = '400 46px Anton, Impact, sans-serif';
    lines.slice(0, 3).forEach((line, index) => g.fillText(line, W / 2, 698 + index * 54));
    g.fillStyle = "#fff";
    g.fillRect(0, 850, W, 110);
    g.fillStyle = "#c8102e";
    g.fillRect(0, 850, 190, 110);
    g.fillStyle = "#fff";
    g.font = '400 36px Anton, sans-serif';
    g.fillText("LE QG", 95, 918);
    g.textAlign = "left";
    g.fillStyle = "#0b1b4d";
    g.font = '700 28px "Inter", sans-serif';
    let size = 28;
    const text = `${name || ""} · édition spéciale`;
    while (g.measureText(text).width > W - 240 && size > 14) {
      size -= 2;
      g.font = `700 ${size}px "Inter", sans-serif`;
    }
    g.fillText(text, 215, 915);
  },
};

async function render() {
  await document.fonts?.load("80px Anton").catch(() => undefined);
  g.clearRect(0, 0, W, H);
  g.textBaseline = "alphabetic";
  draws[templateSel.value](models[current], nameInput.value, extraInput.value);
}

function applyTemplate() {
  const t = TEMPLATES[templateSel.value];
  extraLabel.textContent = t.label;
  extraInput.value = t.extra;
  nameInput.value = t.name;
  render();
}

models.forEach((image, index) => {
  const label = document.createElement("label");
  label.className = "model";
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "model";
  radio.checked = index === 0;
  radio.setAttribute("aria-label", `Modèle ${index + 1}`);
  radio.addEventListener("change", () => {
    current = index;
    render();
  });
  const thumb = document.createElement(image instanceof HTMLCanvasElement ? "canvas" : "img");
  if (image instanceof HTMLCanvasElement) {
    thumb.width = image.width;
    thumb.height = image.height;
    thumb.getContext("2d").drawImage(image, 0, 0);
  } else {
    thumb.src = image.src;
    thumb.alt = "";
  }
  label.append(radio, thumb);
  modelBox.append(label);
});

templateSel.addEventListener("change", applyTemplate);
nameInput.addEventListener("input", render);
extraInput.addEventListener("input", render);
document.getElementById("download").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  downloadCanvas(canvas, `affiche-${templateSel.value}`);
});
applyTemplate();
