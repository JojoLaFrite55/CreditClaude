import { rand, valueNoise } from "./noise.js";

export function blobPoints(cx, cy, r, seed, lumps = 26, wobble = 0.35) {
  const rnd = rand(seed);
  const phase = rnd() * 10;
  const pts = [];
  for (let i = 0; i < lumps; i++) {
    const a = (i / lumps) * Math.PI * 2;
    const n = valueNoise(Math.cos(a) * 2.2 + phase, Math.sin(a) * 2.2 + phase, seed) - 0.5;
    const spike = rnd() < 0.12 ? 1 + rnd() * 0.55 : 1;
    const rr = r * (1 + n * wobble * 2) * spike * (0.94 + rnd() * 0.1);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

export function blobPath(g, pts) {
  const n = pts.length;
  g.beginPath();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  g.moveTo(start[0], start[1]);
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  g.closePath();
}

export function drawBlob(g, cx, cy, r, seed, { alpha = 1, wet = 1, squash = 1 } = {}) {
  g.save();
  g.translate(cx, cy);
  g.scale(1, squash);
  g.translate(-cx, -cy);
  g.globalAlpha = alpha;
  const outer = blobPoints(cx, cy, r, seed);
  blobPath(g, outer);
  const grad = g.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.05, cx, cy, r * 1.05);
  grad.addColorStop(0, "#8e0c0c");
  grad.addColorStop(0.45, "#6c0808");
  grad.addColorStop(0.85, "#430404");
  grad.addColorStop(1, "#2a0202");
  g.fillStyle = grad;
  g.fill();
  g.lineWidth = Math.max(1, r * 0.04);
  g.strokeStyle = "rgba(20,0,0,0.55)";
  g.stroke();
  const inner = blobPoints(cx + r * 0.06, cy + r * 0.04, r * 0.55, seed + 9, 18, 0.3);
  blobPath(g, inner);
  g.fillStyle = "rgba(40,0,0,0.45)";
  g.fill();
  if (wet > 0) {
    g.globalCompositeOperation = "screen";
    const spec = g.createRadialGradient(cx - r * 0.38, cy - r * 0.42, 0, cx - r * 0.38, cy - r * 0.42, r * 0.45);
    spec.addColorStop(0, `rgba(255,170,160,${0.5 * wet})`);
    spec.addColorStop(0.4, `rgba(255,90,80,${0.18 * wet})`);
    spec.addColorStop(1, "rgba(255,60,60,0)");
    g.fillStyle = spec;
    g.fillRect(cx - r * 1.4, cy - r * 1.4, r * 2.8, r * 2.8);
    g.strokeStyle = `rgba(255,210,200,${0.35 * wet})`;
    g.lineWidth = Math.max(1, r * 0.035);
    g.beginPath();
    g.arc(cx, cy, r * 0.78, Math.PI * 1.08, Math.PI * 1.42);
    g.stroke();
    g.globalCompositeOperation = "source-over";
  }
  g.restore();
}

export function splat(g, x, y, size, seed, { drops = 8, wet = 1, directional = null } = {}) {
  const rnd = rand(seed);
  drawBlob(g, x, y, size, seed, { wet });
  for (let i = 0; i < drops; i++) {
    const a = directional ? directional + (rnd() - 0.5) * 1.4 : rnd() * Math.PI * 2;
    const d = size * (1.1 + rnd() * 2.6);
    const r = size * (0.08 + rnd() * 0.22);
    drawBlob(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, r, seed + i * 3 + 1, { wet: wet * 0.7 });
    if (rnd() < 0.5) {
      g.strokeStyle = "rgba(90,6,6,0.85)";
      g.lineWidth = Math.max(1, r * 0.5);
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(x + Math.cos(a) * size * 0.7, y + Math.sin(a) * size * 0.7);
      g.lineTo(x + Math.cos(a) * (d - r), y + Math.sin(a) * (d - r) * 0.9);
      g.stroke();
    }
  }
}

export function streak(g, x1, y1, x2, y2, width) {
  g.save();
  g.lineCap = "round";
  g.strokeStyle = "#3d0404";
  g.lineWidth = width + 2;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
  g.strokeStyle = "#8a0b0b";
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
  g.strokeStyle = "rgba(255,150,140,0.45)";
  g.lineWidth = Math.max(1, width * 0.25);
  g.beginPath();
  g.moveTo(x1 - width * 0.22, y1);
  g.lineTo(x2 - width * 0.22, y2);
  g.stroke();
  g.restore();
}

export function bloodStroke(g, from, to, width) {
  g.save();
  g.lineCap = "round";
  g.lineJoin = "round";
  const j = () => (Math.random() - 0.5) * width * 0.25;
  g.strokeStyle = "#2c0202";
  g.lineWidth = width + 6;
  g.beginPath();
  g.moveTo(from[0], from[1]);
  g.lineTo(to[0], to[1]);
  g.stroke();
  g.strokeStyle = "#7d0909";
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(from[0] + j(), from[1] + j());
  g.lineTo(to[0] + j(), to[1] + j());
  g.stroke();
  g.strokeStyle = "#a31010";
  g.lineWidth = width * 0.55;
  g.beginPath();
  g.moveTo(from[0], from[1]);
  g.lineTo(to[0], to[1]);
  g.stroke();
  g.strokeStyle = "rgba(255,170,160,0.5)";
  g.lineWidth = Math.max(1.5, width * 0.18);
  g.beginPath();
  g.moveTo(from[0] - width * 0.2, from[1] - width * 0.2);
  g.lineTo(to[0] - width * 0.2, to[1] - width * 0.2);
  g.stroke();
  if (Math.random() < 0.08) {
    const a = Math.random() * Math.PI * 2;
    drawBlob(g, to[0] + Math.cos(a) * width * 1.1, to[1] + Math.sin(a) * width * 1.1, width * (0.18 + Math.random() * 0.2), (Math.random() * 1e6) | 0, { wet: 0.8 });
  }
  g.restore();
}

export function bloodStrokeLayers(layers, from, to, width) {
  const draw = (g, color, w, dx = 0, dy = 0, jitter = 0) => {
    g.save();
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = color;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(from[0] + dx + (Math.random() - 0.5) * jitter, from[1] + dy + (Math.random() - 0.5) * jitter);
    g.lineTo(to[0] + dx + (Math.random() - 0.5) * jitter, to[1] + dy + (Math.random() - 0.5) * jitter);
    g.stroke();
    g.restore();
  };
  draw(layers.dark, "#2a0202", width + 7);
  draw(layers.mid, "#780808", width, 0, 0, width * 0.2);
  draw(layers.core, "#a51111", width * 0.55);
  draw(layers.hi, "rgba(255,175,165,0.55)", Math.max(1.5, width * 0.16), -width * 0.2, -width * 0.2);
  if (Math.random() < 0.07) {
    const a = Math.random() * Math.PI * 2;
    drawBlob(layers.dark, to[0] + Math.cos(a) * width * 1.1, to[1] + Math.sin(a) * width * 1.1, width * (0.18 + Math.random() * 0.2), (Math.random() * 1e6) | 0, { wet: 0.8 });
  }
}
