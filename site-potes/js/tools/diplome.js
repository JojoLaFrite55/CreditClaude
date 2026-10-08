import "../arcade/kit.js";
import { loadHeads, pick } from "../arcade/kit.js";

const TITLES = [
  "Diplôme de Docteur en Procrastination",
  "Certificat de Grand Maître du Retard",
  "Médaille d'Or de la Mauvaise Foi",
  "Brevet de Pilote de Canapé",
  "Titre de Meilleur Ami (en cas de pizza)",
  "Diplôme d'Expert en Excuses Bidons",
  "Prix Nobel de la Sieste",
  "Licence en Disparition Soudaine",
  "Certificat d'Aptitude au Chaos",
  "Trophée du Mec qui Répond Jamais",
];
const REASONS = [
  "Pour avoir dit « j'arrive dans 5 minutes » trois heures avant d'arriver.",
  "Pour son courage exemplaire face à la dernière part de pizza.",
  "Pour avoir perdu à un jeu qu'il avait lui-même choisi.",
  "Pour avoir lu le message, regardé le plafond, et n'avoir rien répondu.",
  "Pour sa contribution majeure à l'art de ne rien faire.",
  "Pour avoir transformé une soirée tranquille en légende locale.",
  "Pour sa ponctualité légendaire : toujours dans les temps de quelqu'un d'autre.",
];
const heads = await loadHeads();
const cert = document.getElementById("cert");
const g = cert.getContext("2d");
const who = document.getElementById("who");
const title = document.getElementById("title");
const reason = document.getElementById("reason");
const picker = document.getElementById("picker");
let selected = 0;

TITLES.forEach((text) => {
  const option = document.createElement("option");
  option.textContent = text;
  title.append(option);
});
reason.value = REASONS[0];

heads.forEach((head, i) => {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "head";
  input.checked = i === 0;
  input.setAttribute("aria-label", `Tête ${i + 1}`);
  input.addEventListener("change", () => {
    selected = i;
    draw();
  });
  const c = document.createElement("canvas");
  c.width = 112;
  c.height = 112;
  const cx = c.getContext("2d");
  const k = Math.min(112 / head.width, 112 / head.height);
  cx.drawImage(head, (112 - head.width * k) / 2, (112 - head.height * k) / 2, head.width * k, head.height * k);
  label.append(input, c);
  picker.append(label);
});

function wrap(text, maxWidth, size) {
  g.font = `italic ${size}px Georgia, serif`;
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function draw() {
  const W = 1200;
  const H = 850;
  g.fillStyle = "#fbf5e4";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#b8892b";
  g.lineWidth = 14;
  g.strokeRect(30, 30, W - 60, H - 60);
  g.lineWidth = 3;
  g.strokeRect(54, 54, W - 108, H - 108);
  g.fillStyle = "#b8892b";
  for (const [x, y] of [[54, 54], [W - 54, 54], [54, H - 54], [W - 54, H - 54]]) {
    g.beginPath();
    g.arc(x, y, 14, 0, Math.PI * 2);
    g.fill();
  }
  g.textAlign = "center";
  g.fillStyle = "#6b4e12";
  g.font = "700 30px Georgia, serif";
  g.fillText("— LE QG · ACADÉMIE DES POTES —", W / 2, 130);
  g.fillStyle = "#1c1a14";
  g.font = "800 62px Georgia, serif";
  let y = 225;
  const parts = title.value.length > 30 ? [title.value.slice(0, title.value.lastIndexOf(" ", 30)), title.value.slice(title.value.lastIndexOf(" ", 30) + 1)] : [title.value];
  for (const part of parts) {
    g.fillText(part, W / 2, y);
    y += 70;
  }
  g.fillStyle = "#6b4e12";
  g.font = "italic 30px Georgia, serif";
  g.fillText("est décerné solennellement à", W / 2, y + 20);
  g.fillStyle = "#1c1a14";
  g.font = "800 84px Georgia, serif";
  g.fillText(who.value || "…", W / 2, y + 120);
  g.strokeStyle = "#b8892b";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(W / 2 - 280, y + 142);
  g.lineTo(W / 2 + 280, y + 142);
  g.stroke();
  g.fillStyle = "#3a3224";
  const rl = wrap(reason.value, 820, 34);
  g.font = "italic 34px Georgia, serif";
  rl.slice(0, 3).forEach((line, i) => g.fillText(line, W / 2, y + 205 + i * 44));
  const head = heads[selected];
  g.save();
  g.beginPath();
  g.arc(210, 670, 100, 0, Math.PI * 2);
  g.fillStyle = "#e7d8aa";
  g.fill();
  g.lineWidth = 8;
  g.strokeStyle = "#b8892b";
  g.stroke();
  g.clip();
  const k = 190 / Math.min(head.width, head.height);
  g.drawImage(head, 210 - (head.width * k) / 2, 670 - (head.height * k) / 2 + 14, head.width * k, head.height * k);
  g.restore();
  g.fillStyle = "#8c1d1d";
  g.beginPath();
  g.arc(W - 220, 660, 74, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#e8b4b4";
  g.lineWidth = 4;
  g.beginPath();
  g.arc(W - 220, 660, 60, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#f6dede";
  g.font = "800 26px Georgia, serif";
  g.fillText("OFFICIEL", W - 220, 656);
  g.font = "700 18px Georgia, serif";
  g.fillText("(mais non)", W - 220, 684);
  g.fillStyle = "#6b4e12";
  g.font = "italic 26px Georgia, serif";
  g.textAlign = "center";
  g.fillText(`Fait le ${new Date().toLocaleDateString("fr-FR")}, devant témoins consentants`, W / 2, H - 90);
}

for (const el of [who, title, reason]) el.addEventListener("input", draw);
document.getElementById("random").addEventListener("click", () => {
  title.selectedIndex = Math.floor(Math.random() * TITLES.length);
  reason.value = pick(REASONS);
  selected = Math.floor(Math.random() * heads.length);
  picker.querySelectorAll("input")[selected].checked = true;
  draw();
});
document.getElementById("download").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `diplome-${(who.value || "pote").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
  link.href = cert.toDataURL("image/png");
  link.click();
});
draw();
