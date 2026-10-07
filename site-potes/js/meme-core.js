import { BACKGROUNDS } from "./data.js";

const SIZE = 720;

let fontReady = null;

export function ensureMemeFont() {
  if (!fontReady) {
    fontReady = document.fonts
      ? document.fonts.load("80px Anton").catch(() => undefined)
      : Promise.resolve();
  }
  return fontReady;
}

function wrap(g, text, maxWidth) {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(g, text, anchor) {
  if (!text.trim()) return;
  const maxWidth = SIZE * 0.92;
  let size = 84;
  let lines = [];
  for (; size >= 36; size -= 4) {
    g.font = `${size}px Anton, Impact, "Arial Narrow", sans-serif`;
    lines = wrap(g, text, maxWidth);
    if (lines.length <= 2 && lines.every((l) => g.measureText(l).width <= maxWidth)) break;
  }
  const lineHeight = size * 1.08;
  const block = lines.length * lineHeight;
  const startY = anchor === "top" ? 22 + size * 0.88 : SIZE - 22 - block + size * 0.88;
  g.textAlign = "center";
  g.lineJoin = "round";
  g.lineWidth = Math.max(5, size * 0.13);
  g.strokeStyle = "#000";
  g.fillStyle = "#fff";
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    g.strokeText(line, SIZE / 2, y);
    g.fillText(line, SIZE / 2, y);
  });
}

function paintBackground(g, palette, x, y, w, h) {
  const gradient = g.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, palette.a);
  gradient.addColorStop(1, palette.b);
  g.fillStyle = gradient;
  g.fillRect(x, y, w, h);
  const glow = g.createRadialGradient(x + w / 2, y + h * 0.55, 20, x + w / 2, y + h * 0.55, Math.max(w, h) * 0.6);
  glow.addColorStop(0, "rgba(255,255,255,0.28)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = glow;
  g.fillRect(x, y, w, h);
}

function placeHead(g, head, cx, cy, boxW, boxH, filter = "none") {
  if (!head) return;
  const ratio = head.width / head.height;
  const width = Math.min(boxW, boxH * ratio);
  const height = width / ratio;
  g.save();
  g.filter = filter;
  g.shadowColor = "rgba(0,0,0,0.35)";
  g.shadowBlur = 24;
  g.shadowOffsetY = 10;
  g.drawImage(head, cx - width / 2, cy - height / 2, width, height);
  g.restore();
}

function fitBox(g, text, x, y, w, h, color, family, weight = 800) {
  if (!text.trim()) return;
  let size = 64;
  let lines = [];
  for (; size >= 18; size -= 2) {
    g.font = `${weight} ${size}px ${family}`;
    lines = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (g.measureText(next).width > w && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    if (lines.length * size * 1.15 <= h && lines.every((l) => g.measureText(l).width <= w)) break;
  }
  g.fillStyle = color;
  g.textAlign = "center";
  const total = lines.length * size * 1.15;
  lines.forEach((line, index) => g.fillText(line, x + w / 2, y + (h - total) / 2 + size * 0.95 + index * size * 1.15));
}

export async function renderMeme(canvas, { head, head2 = null, bg, top = "", bottom = "", layout = "classic" }) {
  await ensureMemeFont();
  canvas.width = SIZE;
  canvas.height = SIZE;
  const g = canvas.getContext("2d");
  const palette = BACKGROUNDS.find((item) => item.id === bg) ?? BACKGROUNDS[0];
  const sans = '"Inter", system-ui, sans-serif';

  if (layout === "banniere") {
    paintBackground(g, palette, 0, 0, SIZE, SIZE);
    g.fillStyle = "#fff";
    g.fillRect(0, 0, SIZE, 190);
    fitBox(g, top, 30, 10, SIZE - 60, 170, "#111", sans);
    placeHead(g, head, SIZE / 2, 190 + (SIZE - 190) * 0.52, SIZE * 0.8, (SIZE - 190) * 0.92);
    if (bottom.trim()) {
      g.fillStyle = "rgba(0,0,0,0.55)";
      g.fillRect(0, SIZE - 76, SIZE, 76);
      fitBox(g, bottom, 24, SIZE - 76, SIZE - 48, 76, "#fff", sans, 700);
    }
    return;
  }

  if (layout === "drake") {
    g.fillStyle = "#fff";
    g.fillRect(0, 0, SIZE, SIZE);
    const half = SIZE / 2;
    paintBackground(g, palette, 0, 0, half, half);
    paintBackground(g, palette, 0, half, half, half);
    placeHead(g, head, half / 2, half / 2, half * 0.9, half * 0.9, "grayscale(0.85) contrast(0.9)");
    placeHead(g, head2 || head, half / 2, half + half / 2, half * 0.9, half * 0.9);
    g.fillStyle = "rgba(220,30,30,0.9)";
    g.font = `800 90px ${sans}`;
    g.textAlign = "center";
    g.fillText("✕", 60, 120);
    g.fillStyle = "rgba(30,170,70,0.95)";
    g.fillText("✓", 60, half + 120);
    g.strokeStyle = "#111";
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, SIZE - 3, SIZE - 3);
    g.beginPath();
    g.moveTo(0, half);
    g.lineTo(SIZE, half);
    g.moveTo(half, 0);
    g.lineTo(half, SIZE);
    g.stroke();
    fitBox(g, top, half + 20, 20, half - 40, half - 40, "#111", sans);
    fitBox(g, bottom, half + 20, half + 20, half - 40, half - 40, "#111", sans);
    return;
  }

  paintBackground(g, palette, 0, 0, SIZE, SIZE);

  if (layout === "versus") {
    placeHead(g, head, SIZE * 0.27, SIZE * 0.55, SIZE * 0.46, SIZE * 0.6);
    placeHead(g, head2 || head, SIZE * 0.73, SIZE * 0.55, SIZE * 0.46, SIZE * 0.6);
    g.fillStyle = "#111";
    g.beginPath();
    g.arc(SIZE / 2, SIZE * 0.55, 54, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffd24a";
    g.font = "400 54px Anton, Impact, sans-serif";
    g.textAlign = "center";
    g.fillText("VS", SIZE / 2, SIZE * 0.55 + 19);
    drawText(g, top, "top");
    drawText(g, bottom, "bottom");
    return;
  }

  if (head) {
    const ratio = head.width / head.height;
    const height = SIZE * 0.74;
    const width = Math.min(SIZE * 0.82, height * ratio);
    const drawHeight = width / ratio;
    g.save();
    g.shadowColor = "rgba(0,0,0,0.35)";
    g.shadowBlur = 28;
    g.shadowOffsetY = 12;
    g.drawImage(head, (SIZE - width) / 2, SIZE * 0.5 - drawHeight / 2 + SIZE * 0.02, width, drawHeight);
    g.restore();
  }

  drawText(g, top, "top");
  drawText(g, bottom, "bottom");
}

export function downloadCanvas(canvas, name = "meme") {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}
