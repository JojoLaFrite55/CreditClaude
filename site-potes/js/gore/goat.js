import { fbm, rand } from "./noise.js";

const P = {
  body: "M58 252 C78 236 110 205 140 182 C160 168 185 160 208 158 C240 170 280 190 332 204 C380 214 430 212 480 210 C530 208 570 200 610 208 C640 216 656 238 654 266 C652 296 646 326 636 352 C600 372 566 366 548 344 C520 366 470 382 420 384 C360 386 310 384 276 376 C256 360 240 340 230 318 C214 304 190 304 160 296 C130 292 100 288 78 280 C62 276 52 264 58 252 Z",
  legsNear: [
    "M268 372 C276 410 284 440 282 470 L278 500 C276 520 278 534 278 546 L306 546 C306 528 304 512 304 496 L308 466 C314 440 318 410 314 376 Z",
    "M590 338 C640 350 662 380 650 412 C642 434 636 470 638 500 C638 520 634 540 632 548 L606 548 C608 530 610 512 610 496 C610 466 604 440 598 424 C582 410 566 380 570 352 Z",
  ],
  legsFar: [
    "M306 374 C312 410 318 440 316 470 L312 500 C310 520 312 534 312 546 L338 546 C338 528 336 512 336 496 L340 466 C346 440 348 410 344 378 Z",
    "M548 344 C586 356 606 384 596 412 C590 434 584 470 586 500 C586 520 582 540 580 548 L556 548 C558 530 560 512 560 496 C560 466 554 440 548 424 C534 410 524 384 528 358 Z",
  ],
  hooves: ["M276 546 L308 546 L312 562 L274 562 Z", "M630 548 L608 548 L604 564 L636 564 Z", "M310 546 L340 546 L344 562 L308 562 Z", "M578 548 L558 548 L554 564 L584 564 Z"],
  horn: "M200 160 C206 100 250 60 320 52 C360 48 392 70 400 110 C374 84 344 78 316 86 C270 98 238 130 232 168 Z",
  horn2: "M188 158 C190 96 236 52 306 42 C348 36 380 56 390 94 C364 70 334 66 306 74 C258 86 228 124 220 164 Z",
  ear: "M214 170 C240 150 276 150 304 168 C278 178 246 184 218 186 Z",
  torso: "M236 170 C268 184 300 196 332 204 C380 214 430 212 480 210 C530 208 570 200 610 208 C640 216 656 238 654 266 C652 296 646 326 636 352 C600 372 566 366 548 344 C520 366 470 382 420 384 C360 386 310 384 276 376 C256 360 242 340 236 322 C232 290 232 230 236 170 Z",
  head: "M58 252 C78 236 110 205 140 182 C160 168 185 160 208 158 C232 162 262 176 292 190 C304 240 290 292 262 330 C248 328 238 324 230 318 C214 304 190 304 160 296 C130 292 100 288 78 280 C62 276 52 264 58 252 Z",
  headShade: "M58 252 C78 236 110 205 140 182 C160 168 185 160 208 158 C232 162 262 176 292 190 L900 190 L900 330 L262 330 C248 328 238 324 230 318 C214 304 190 304 160 296 C130 292 100 288 78 280 C62 276 52 264 58 252 Z",
  beard: "M92 288 C82 310 84 336 96 354 C108 334 114 312 116 292 Z",
  tail: "M650 236 C666 222 686 226 692 240 C680 238 668 244 656 252 Z",
};

const path = (d) => new Path2D(d);

function furPass(g, clipPath, box, { count, len, width, colorAt, angleAt, seed, alpha = 0.32 }) {
  const r = rand(seed);
  g.save();
  g.clip(clipPath);
  g.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = box[0] + r() * box[2];
    const y = box[1] + r() * box[3];
    const a = angleAt(x, y) + (r() - 0.5) * 0.55;
    const l = len * (0.5 + r());
    const [cr, cg, cb] = colorAt(x, y);
    const j = (r() - 0.5) * 34;
    g.strokeStyle = `rgba(${Math.max(0, Math.min(255, cr + j)) | 0},${Math.max(0, Math.min(255, cg + j)) | 0},${Math.max(0, Math.min(255, cb + j)) | 0},${alpha * (0.5 + r() * 0.8)})`;
    g.lineWidth = width * (0.5 + r());
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 2, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  g.restore();
}

function innerShade(g, clipPath, strength = 34, color = "rgba(0,0,0,0.85)") {
  g.save();
  g.clip(clipPath);
  g.shadowColor = color;
  g.shadowBlur = strength;
  g.shadowOffsetX = 4000;
  g.strokeStyle = "#000";
  g.lineWidth = 16;
  g.translate(-4000, 0);
  g.stroke(clipPath);
  g.restore();
}

function rim(g, clipPath, dx, dy, color, alpha = 0.5) {
  const layer = document.createElement("canvas");
  layer.width = g.canvas.width;
  layer.height = g.canvas.height;
  const l = layer.getContext("2d");
  l.setTransform(g.getTransform());
  l.fillStyle = color;
  l.fill(clipPath);
  l.globalCompositeOperation = "destination-out";
  l.translate(dx, dy);
  l.fill(clipPath);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = alpha;
  g.filter = "blur(1.2px)";
  g.drawImage(layer, 0, 0);
  g.restore();
}

export const POSES = {
  standing: { head: 0, front: [0, 0.04], hind: [0, -0.03], dy: 0, tilt: 0, dead: false },
  dead: { head: -0.5, front: [0.22, -0.14], hind: [-0.2, 0.26], dy: 0, tilt: -0.03, dead: true },
};

const FRONT_PIVOT = [292, 372];
const HIND_PIVOT = [598, 346];
const HEAD_PIVOT = [262, 236];

export function drawGoat(pose = POSES.standing) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 640;
  const g = canvas.getContext("2d");
  g.translate(pose.dead ? 110 : 80, pose.dy - (pose.dead ? 0 : 0));
  g.translate(-0, 0);

  const baseColor = (x, y) => {
    const t = Math.max(0, Math.min(1, (y - 160) / 230));
    const n = fbm(x / 20, y / 20, 3, 5);
    const patch = fbm(x / 70 + 3, y / 70, 3, 21);
    const l = Math.max(0, 1 - Math.hypot(x - 560, y - 200) / 340);
    const k = 0.5 + n * 0.9 + l * 0.55 + patch * 0.35;
    return [(78 - t * 44) * k + 16, (66 - t * 38) * k + 13, (56 - t * 34) * k + 11];
  };

  g.save();
  g.filter = "blur(14px)";
  g.fillStyle = "rgba(0,0,0,0.75)";
  g.beginPath();
  g.ellipse(pose.dead ? 440 : 450, 560 - pose.dy * (pose.dead ? 0.0 : 0), pose.dead ? 330 : 230, pose.dead ? 22 : 14, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();

  g.save();
  if (pose.tilt) {
    g.translate(450, 380);
    g.rotate(pose.tilt);
    g.translate(-450, -380);
  }

  const legFur = (p, seed, dark) => {
    g.fillStyle = dark ? "#1b1611" : "#2a231c";
    g.fill(p);
    furPass(g, p, [250, 330, 420, 240], { count: 2600, len: 13, width: 1.5, colorAt: (x, y) => [(dark ? 40 : 62) + fbm(x / 8, y / 8, 2, 3) * 54, (dark ? 34 : 52) + fbm(x / 8, y / 8, 2, 3) * 44, (dark ? 28 : 44) + fbm(x / 8, y / 8, 2, 3) * 36], angleAt: () => Math.PI / 2, seed, alpha: 0.38 });
    innerShade(g, p, 12, "rgba(0,0,0,0.95)");
  };
  const posedLeg = (d, hoofIndex, pivot, angle, seed, dark) => {
    g.save();
    g.translate(pivot[0], pivot[1]);
    g.rotate(angle);
    g.translate(-pivot[0], -pivot[1]);
    legFur(path(d), seed, dark);
    g.fillStyle = "#0a0806";
    g.fill(path(P.hooves[hoofIndex]));
    g.restore();
  };
  posedLeg(P.legsFar[0], 2, [326, 372], pose.front[1], 100, true);
  posedLeg(P.legsFar[1], 3, [552, 346], pose.hind[1], 101, true);
  posedLeg(P.legsNear[0], 0, FRONT_PIVOT, pose.front[0], 110, false);
  posedLeg(P.legsNear[1], 1, HIND_PIVOT, pose.hind[0], 111, false);

  const body = path(P.torso);
  g.fillStyle = "#322a22";
  g.fill(body);
  furPass(g, body, [230, 160, 440, 240], { count: 70000, len: 15, width: 1.5, colorAt: baseColor, angleAt: (x, y) => (x < 330 && y < 280 ? 0.55 : y > 320 ? Math.PI / 2 : 0.06 + (x - 330) / 1200 + (y - 200) / 500), seed: 7, alpha: 0.36 });
  furPass(g, body, [230, 160, 440, 240], { count: 11000, len: 22, width: 1.1, colorAt: (x, y) => [138 + fbm(x / 8, y / 8, 2, 8) * 70, 122 + fbm(x / 8, y / 8, 2, 8) * 60, 104 + fbm(x / 8, y / 8, 2, 8) * 50], angleAt: (x, y) => (y > 330 ? Math.PI / 2 + 0.2 : 0.4), seed: 9, alpha: 0.2 });
  g.save();
  g.clip(body);
  const lit = g.createRadialGradient(560, 205, 10, 560, 205, 340);
  lit.addColorStop(0, "rgba(255,180,100,0.34)");
  lit.addColorStop(1, "rgba(255,180,100,0)");
  g.fillStyle = lit;
  g.fillRect(200, 140, 500, 260);
  const under = g.createLinearGradient(0, 220, 0, 390);
  under.addColorStop(0, "rgba(0,0,0,0)");
  under.addColorStop(0.6, "rgba(0,0,0,0.25)");
  under.addColorStop(1, "rgba(0,0,0,0.8)");
  g.fillStyle = under;
  g.fillRect(200, 140, 500, 260);
  g.fillStyle = "rgba(190,176,150,0.4)";
  g.beginPath();
  g.moveTo(236, 300);
  g.quadraticCurveTo(250, 380, 300, 390);
  g.lineTo(236, 392);
  g.fill();
  g.restore();
  innerShade(g, body, 28, "rgba(0,0,0,0.95)");
  rim(g, body, -3, 4, "rgba(255,196,130,1)", 0.55);

  const tail = path(P.tail);
  g.fillStyle = "#1c1611";
  g.fill(tail);
  furPass(g, tail, [648, 220, 50, 40], { count: 300, len: 8, width: 1.2, colorAt: () => [60, 50, 42], angleAt: () => -0.4, seed: 34 });

  g.save();
  g.translate(HEAD_PIVOT[0], HEAD_PIVOT[1]);
  g.rotate(pose.head);
  g.translate(-HEAD_PIVOT[0], -HEAD_PIVOT[1]);

  const head = path(P.head);
  const skin = document.createElement("canvas");
  skin.width = g.canvas.width;
  skin.height = g.canvas.height;
  const sk = skin.getContext("2d");
  sk.setTransform(g.getTransform());
  sk.save();
  sk.clip(head);
  sk.fillStyle = "#322a22";
  sk.fill(head);
  furPass(sk, head, [50, 150, 260, 190], { count: 26000, len: 15, width: 1.5, colorAt: baseColor, angleAt: (x, y) => (x < 200 ? 0.35 : 0.55), seed: 8, alpha: 0.36 });
  furPass(sk, head, [50, 150, 260, 190], { count: 4000, len: 14, width: 1.1, colorAt: (x, y) => [138 + fbm(x / 8, y / 8, 2, 8) * 70, 122 + fbm(x / 8, y / 8, 2, 8) * 60, 104 + fbm(x / 8, y / 8, 2, 8) * 50], angleAt: () => 0.4, seed: 10, alpha: 0.2 });
  const face = sk.createRadialGradient(130, 220, 10, 130, 220, 120);
  face.addColorStop(0, "rgba(30,20,14,0.45)");
  face.addColorStop(1, "rgba(30,20,14,0)");
  sk.fillStyle = face;
  sk.fillRect(40, 140, 260, 200);
  sk.fillStyle = "rgba(235,225,205,0.22)";
  sk.beginPath();
  sk.moveTo(160, 176);
  sk.quadraticCurveTo(110, 220, 78, 262);
  sk.lineTo(92, 268);
  sk.quadraticCurveTo(128, 226, 176, 188);
  sk.fill();
  const lit2 = sk.createRadialGradient(560, 205, 10, 560, 205, 340);
  lit2.addColorStop(0, "rgba(255,180,100,0.34)");
  lit2.addColorStop(1, "rgba(255,180,100,0)");
  sk.fillStyle = lit2;
  sk.fillRect(40, 140, 300, 240);
  const under2 = sk.createLinearGradient(0, 220, 0, 340);
  under2.addColorStop(0, "rgba(0,0,0,0)");
  under2.addColorStop(1, "rgba(0,0,0,0.45)");
  sk.fillStyle = under2;
  sk.fillRect(40, 220, 300, 140);
  innerShade(sk, path(P.headShade), 28, "rgba(0,0,0,0.95)");
  rim(sk, path(P.headShade), -3, 4, "rgba(255,196,130,1)", 0.45);
  sk.restore();
  sk.save();
  sk.globalCompositeOperation = "destination-in";
  const mask = sk.createLinearGradient(236, 0, 296, 0);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  sk.fillStyle = mask;
  sk.fillRect(-200, -200, 1400, 1000);
  sk.restore();
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(skin, 0, 0);
  g.restore();

  const beard = path(P.beard);
  g.fillStyle = "#cfc3ac";
  g.fill(beard);
  furPass(g, beard, [78, 286, 44, 74], { count: 800, len: 22, width: 1.6, colorAt: () => [210, 198, 176], angleAt: () => Math.PI / 2 + 0.05, seed: 33, alpha: 0.55 });
  innerShade(g, beard, 8, "rgba(40,30,20,0.8)");

  const earPath = path(P.ear);
  g.save();
  g.translate(pose.dead ? 0 : 0, 0);
  g.fillStyle = "#43382f";
  g.fill(earPath);
  furPass(g, earPath, [210, 148, 100, 42], { count: 900, len: 9, width: 1.2, colorAt: () => [90, 78, 68], angleAt: () => 0.1, seed: 41 });
  g.save();
  g.clip(earPath);
  const inner = g.createLinearGradient(220, 160, 300, 180);
  inner.addColorStop(0, "rgba(176,112,106,0.75)");
  inner.addColorStop(1, "rgba(120,70,66,0.25)");
  g.fillStyle = inner;
  g.beginPath();
  g.moveTo(226, 170);
  g.quadraticCurveTo(262, 160, 292, 170);
  g.quadraticCurveTo(262, 178, 226, 182);
  g.fill();
  g.restore();
  innerShade(g, earPath, 8, "rgba(0,0,0,0.9)");
  g.restore();

  for (const [d, dark] of [[P.horn2, true], [P.horn, false]]) {
    const hp = path(d);
    const grad = g.createLinearGradient(190, 40, 400, 170);
    if (dark) {
      grad.addColorStop(0, "#6a5c44");
      grad.addColorStop(1, "#241d12");
    } else {
      grad.addColorStop(0, "#d8cba8");
      grad.addColorStop(0.55, "#988459");
      grad.addColorStop(1, "#33291a");
    }
    g.fillStyle = grad;
    g.fill(hp);
    g.save();
    g.clip(hp);
    const r = rand(dark ? 77 : 78);
    for (let i = 0; i < 520; i++) {
      const x = 180 + r() * 230;
      const y = 30 + r() * 150;
      g.strokeStyle = `rgba(${40 + r() * 40},${30 + r() * 30},${16 + r() * 20},${0.1 + r() * 0.22})`;
      g.lineWidth = 0.6 + r();
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 6 + r() * 12, y + 3 + r() * 7);
      g.stroke();
    }
    if (!dark) {
      g.strokeStyle = "rgba(255,244,214,0.5)";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(214, 134);
      g.bezierCurveTo(240, 84, 300, 62, 350, 66);
      g.stroke();
      g.strokeStyle = "rgba(30,20,10,0.7)";
      g.lineWidth = 2.4;
      for (const [x, y, dx, dy] of [[220, 126, -8, 22], [232, 104, -10, 18], [252, 86, -12, 18], [280, 72, -8, 20], [310, 66, -4, 22], [340, 64, 0, 22], [368, 74, 8, 20], [386, 94, 12, 16]]) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + dx, y + dy);
        g.stroke();
      }
    }
    g.restore();
    innerShade(g, hp, 6, "rgba(0,0,0,0.95)");
  }

  g.fillStyle = "#070504";
  g.beginPath();
  g.ellipse(70, 254, 8, 5.5, -0.5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.18)";
  g.beginPath();
  g.ellipse(67, 252, 2.5, 1.4, -0.5, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#090605";
  g.lineWidth = 2.8;
  g.beginPath();
  g.moveTo(70, 278);
  g.quadraticCurveTo(116, 292, 170, 296);
  g.stroke();
  g.fillStyle = "rgba(190,130,125,0.35)";
  g.beginPath();
  g.ellipse(84, 274, 18, 4, 0.3, 0, Math.PI * 2);
  g.fill();

  if (pose.dead) {
    g.fillStyle = "#b25a63";
    g.beginPath();
    g.moveTo(92, 284);
    g.quadraticCurveTo(86, 318, 100, 332);
    g.quadraticCurveTo(116, 324, 114, 290);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(60,10,16,0.7)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(102, 290);
    g.lineTo(104, 322);
    g.stroke();
  }

  g.save();
  g.translate(150, 206);
  g.rotate(-0.1);
  if (!pose.dead) {
    const glow = g.createRadialGradient(0, 0, 4, 0, 0, 52);
    glow.addColorStop(0, "rgba(255,150,30,0.55)");
    glow.addColorStop(1, "rgba(255,120,0,0)");
    g.fillStyle = glow;
    g.fillRect(-60, -60, 120, 120);
  }
  g.fillStyle = "#120c07";
  g.beginPath();
  g.ellipse(0, 0, 25, 14, 0, 0, Math.PI * 2);
  g.fill();
  const iris = g.createRadialGradient(-4, -3, 1, 0, 0, 21);
  if (pose.dead) {
    iris.addColorStop(0, "#9a9170");
    iris.addColorStop(0.6, "#5b5436");
    iris.addColorStop(1, "#2a2512");
  } else {
    iris.addColorStop(0, "#fff0a0");
    iris.addColorStop(0.5, "#e0a21a");
    iris.addColorStop(1, "#7a3d00");
  }
  g.fillStyle = iris;
  g.beginPath();
  g.ellipse(0, 0, 21, 11, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#030201";
  g.beginPath();
  g.roundRect(-16, -3.8, 32, pose.dead ? 9 : 7.6, 4);
  g.fill();
  g.strokeStyle = "rgba(0,0,0,0.9)";
  g.lineWidth = 3.4;
  g.beginPath();
  g.ellipse(0, 0, 21, 11, 0, Math.PI, Math.PI * 2);
  g.stroke();
  if (pose.dead) {
    g.fillStyle = "rgba(60,48,40,0.8)";
    g.beginPath();
    g.ellipse(0, -5, 23, 7, 0, Math.PI, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.beginPath();
  g.ellipse(-9, -4.6, 3.4, 1.9, -0.4, 0, Math.PI * 2);
  g.fill();
  if (!pose.dead) {
    g.fillStyle = "rgba(255,170,90,0.55)";
    g.beginPath();
    g.ellipse(9, 4.2, 4.2, 1.7, 0.3, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  g.restore();
  g.restore();

  return canvas;
}

export const drawStandingGoat = () => drawGoat(POSES.standing);
export const drawLyingGoat = () => drawGoat(POSES.dead);
