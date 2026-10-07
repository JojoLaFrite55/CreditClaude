export const W = 1280;
export const H = 800;
const BASE_H = 640;
const DY = H - BASE_H;
export const BORDER_Y = 490 + DY;

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function farLand(g, rand) {
  const grad = g.createLinearGradient(0, 0, 0, BORDER_Y);
  grad.addColorStop(0, "#0c1612");
  grad.addColorStop(1, "#243322");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, BORDER_Y);

  for (let i = 0; i < Math.round(26 * (W * BORDER_Y) / (960 * 490)); i++) {
    const x = rand() * W;
    const y = rand() * BORDER_Y;
    g.fillStyle = `rgba(70, 60, 40, ${0.08 + rand() * 0.1})`;
    g.beginPath();
    g.ellipse(x, y, 40 + rand() * 90, 12 + rand() * 30, rand() * 0.4, 0, Math.PI * 2);
    g.fill();
  }

  g.lineCap = "round";
  for (let i = 0; i < Math.round(1500 * (W * BORDER_Y) / (960 * 490)); i++) {
    const x = rand() * W;
    const y = rand() * BORDER_Y;
    const height = 3 + rand() * 7;
    g.strokeStyle = `rgba(${60 + rand() * 40}, ${110 + rand() * 60}, ${60 + rand() * 30}, ${0.12 + (y / BORDER_Y) * 0.3})`;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rand() - 0.5) * 3, y - height);
    g.stroke();
  }

  for (let i = 0; i < Math.round(18 * (W * BORDER_Y) / (960 * 490)); i++) {
    const x = rand() * W;
    const y = 40 + rand() * (BORDER_Y - 160);
    const size = 10 + rand() * 18;
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.beginPath();
    g.ellipse(x, y + size * 0.55, size * 1.1, size * 0.4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = `rgb(${24 + rand() * 20}, ${52 + rand() * 30}, ${30 + rand() * 20})`;
    g.beginPath();
    g.arc(x, y, size, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.05)";
    g.beginPath();
    g.arc(x - size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
    g.fill();
  }

  g.save();
  g.font = '800 150px "Inter", system-ui, sans-serif';
  g.textAlign = "center";
  g.fillStyle = "rgba(255, 150, 60, 0.07)";
  g.fillText("ZONE B", W / 2, 190);
  g.font = '600 20px "Inter", system-ui, sans-serif';
  g.fillStyle = "rgba(255, 150, 60, 0.14)";
  g.fillText("TERRITOIRE B — FRANCHISSEMENT INTERDIT", W / 2, 230);
  g.restore();

  const fog = g.createLinearGradient(0, 0, 0, 160);
  fog.addColorStop(0, "rgba(8,12,16,0.7)");
  fog.addColorStop(1, "rgba(8,12,16,0)");
  g.fillStyle = fog;
  g.fillRect(0, 0, W, 160);
}

function sandStrip(g, rand) {
  g.fillStyle = "#6d6247";
  g.fillRect(0, 438, W, 40);
  const grad = g.createLinearGradient(0, 430, 0, 438);
  grad.addColorStop(0, "rgba(36,51,34,0)");
  grad.addColorStop(1, "rgba(109,98,71,1)");
  g.fillStyle = grad;
  g.fillRect(0, 430, W, 8);
  g.strokeStyle = "rgba(0,0,0,0.18)";
  g.lineWidth = 1;
  for (let y = 442; y < 476; y += 4) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  for (let i = 0; i < 70; i++) {
    g.fillStyle = `rgba(0,0,0,${0.08 + rand() * 0.12})`;
    g.beginPath();
    g.ellipse(rand() * W, 440 + rand() * 34, 5, 2.2, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = "rgba(255, 70, 70, 0.55)";
  g.setLineDash([14, 10]);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 440);
  g.lineTo(W, 440);
  g.stroke();
  g.setLineDash([]);
}

function wire(g, y, rand) {
  g.strokeStyle = "rgba(200, 205, 215, 0.9)";
  g.lineWidth = 1.4;
  g.beginPath();
  for (let x = 0; x <= W; x += 6) {
    const wave = Math.sin(x * 0.18) * 4;
    if (x === 0) g.moveTo(x, y + wave);
    else g.lineTo(x, y + wave);
  }
  g.stroke();
  for (let x = 4; x < W; x += 16) {
    const wave = Math.sin(x * 0.18) * 4;
    g.beginPath();
    g.moveTo(x - 3, y + wave - 3);
    g.lineTo(x + 3, y + wave + 3);
    g.moveTo(x + 3, y + wave - 3);
    g.lineTo(x - 3, y + wave + 3);
    g.stroke();
  }
  return rand;
}

function fence(g, rand) {
  g.fillStyle = "rgba(0,0,0,0.45)";
  g.fillRect(0, 495, W, 14);

  g.strokeStyle = "rgba(190, 200, 215, 0.28)";
  g.lineWidth = 1;
  for (let x = -40; x < W + 40; x += 12) {
    g.beginPath();
    g.moveTo(x, 466);
    g.lineTo(x + 40, 496);
    g.moveTo(x + 40, 466);
    g.lineTo(x, 496);
    g.stroke();
  }

  g.fillStyle = "#3a3f47";
  g.fillRect(0, 494, W, 16);
  for (let x = -20; x < W + 20; x += 36) {
    g.fillStyle = "#f2c200";
    g.beginPath();
    g.moveTo(x, 494);
    g.lineTo(x + 18, 494);
    g.lineTo(x + 6, 510);
    g.lineTo(x - 12, 510);
    g.closePath();
    g.fill();
  }

  for (let x = 12; x < W; x += 54) {
    g.fillStyle = "#555c66";
    g.fillRect(x, 458, 5, 40);
    g.fillStyle = "#7d8591";
    g.fillRect(x, 458, 2, 40);
  }
  wire(g, 462, rand);
  wire(g, 470, rand);
}

function tower(g, x, flag) {
  g.fillStyle = "#23272e";
  g.fillRect(x - 22, 392, 8, 108);
  g.fillRect(x + 14, 392, 8, 108);
  g.strokeStyle = "#323843";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x - 18, 500);
  g.lineTo(x + 18, 396);
  g.moveTo(x + 18, 500);
  g.lineTo(x - 18, 396);
  g.stroke();
  g.fillStyle = "#2d333c";
  g.fillRect(x - 34, 364, 68, 34);
  g.fillStyle = "#ffd978";
  g.fillRect(x - 28, 372, 56, 14);
  g.fillStyle = "#1a1e24";
  g.beginPath();
  g.moveTo(x - 40, 364);
  g.lineTo(x, 340);
  g.lineTo(x + 40, 364);
  g.closePath();
  g.fill();
  g.strokeStyle = "#999";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, 340);
  g.lineTo(x, 296);
  g.stroke();
  g.fillStyle = flag.a;
  g.fillRect(x, 298, 38, 11);
  g.fillStyle = flag.b;
  g.fillRect(x, 309, 38, 11);
}

function sign(g, x, y, label, arrow, color) {
  g.fillStyle = "#222831";
  g.fillRect(x - 3, y, 6, 36);
  g.fillStyle = color;
  g.fillRect(x - 64, y - 30, 128, 36);
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 2;
  g.strokeRect(x - 60, y - 26, 120, 28);
  g.fillStyle = "#fff";
  g.font = '700 16px "Inter", system-ui, sans-serif';
  g.textAlign = "center";
  g.fillText(`${label} ${arrow}`, x, y - 7);
}

function asphalt(g, rand) {
  const grad = g.createLinearGradient(0, 510, 0, BASE_H);
  grad.addColorStop(0, "#23262d");
  grad.addColorStop(1, "#12141a");
  g.fillStyle = grad;
  g.fillRect(0, 510, W, BASE_H - 510);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,255,255,${rand() * 0.04})`;
    g.fillRect(rand() * W, 510 + rand() * (BASE_H - 510), 2, 2);
  }
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.lineWidth = 3;
  g.setLineDash([34, 26]);
  g.beginPath();
  g.moveTo(0, 548);
  g.lineTo(W, 548);
  g.stroke();
  g.setLineDash([]);

  g.save();
  g.font = '800 70px "Inter", system-ui, sans-serif';
  g.textAlign = "center";
  g.fillStyle = "rgba(0, 210, 190, 0.08)";
  g.fillText("ZONE A", W / 2, 626);
  g.restore();

  for (const x of [0, W - 120]) {
    g.fillStyle = "#5b616b";
    g.fillRect(x, 520, 120, 18);
    g.fillStyle = "#454a53";
    g.fillRect(x, 536, 120, 6);
  }
  for (const x of [W * 0.2, W * 0.8]) {
    const glow = g.createRadialGradient(x, 575, 6, x, 575, 190);
    glow.addColorStop(0, "rgba(255, 224, 150, 0.2)");
    glow.addColorStop(1, "rgba(255, 224, 150, 0)");
    g.fillStyle = glow;
    g.fillRect(x - 190, 510, 380, 130);
    g.fillStyle = "#2d323b";
    g.fillRect(x - 2, 560, 4, 20);
    g.fillStyle = "#ffe3a0";
    g.beginPath();
    g.arc(x, 558, 6, 0, Math.PI * 2);
    g.fill();
  }
}

export function createBackground(scale) {
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const g = canvas.getContext("2d");
  g.scale(scale, scale);
  const rand = rng(1337);
  farLand(g, rand);
  g.save();
  g.translate(0, DY);
  sandStrip(g, rand);
  fence(g, rand);
  asphalt(g, rand);
  tower(g, 48, { a: "#ff8a1f", b: "#3b1d00" });
  tower(g, W - 48, { a: "#00c9b1", b: "#ffffff" });
  sign(g, 220, 452, "ZONE B", "↑", "#d9690f");
  sign(g, W - 220, 452, "ZONE A", "↓", "#00917f");
  g.restore();
  return canvas;
}

export const TOWERS = [
  { x: 48, y: 368 + DY },
  { x: W - 48, y: 368 + DY },
];
