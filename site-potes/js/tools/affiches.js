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
