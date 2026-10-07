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

export async function renderMeme(canvas, { head, bg, top = "", bottom = "" }) {
  await ensureMemeFont();
  canvas.width = SIZE;
  canvas.height = SIZE;
  const g = canvas.getContext("2d");
  const palette = BACKGROUNDS.find((item) => item.id === bg) ?? BACKGROUNDS[0];
  const gradient = g.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, palette.a);
  gradient.addColorStop(1, palette.b);
  g.fillStyle = gradient;
  g.fillRect(0, 0, SIZE, SIZE);
  const glow = g.createRadialGradient(SIZE / 2, SIZE * 0.55, 40, SIZE / 2, SIZE * 0.55, SIZE * 0.6);
  glow.addColorStop(0, "rgba(255,255,255,0.28)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, SIZE, SIZE);

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
