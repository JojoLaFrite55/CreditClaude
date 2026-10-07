import { W } from "./scene.js";
import { drawHead, limb, shadow } from "./sprites.js";
import { vehicleStats } from "./waves.js";

const SPECS = {
  moto: { halfW: 24, height: 116, headH: 34, headOffset: 92, wobbleAmp: 46, wobbleSpeed: 2.4, blast: 40 },
  jeep: { halfW: 56, height: 90, headH: 38, headOffset: 66, wobbleAmp: 22, wobbleSpeed: 0.9, blast: 70 },
  truck: { halfW: 76, height: 128, headH: 40, headOffset: 70, wobbleAmp: 12, wobbleSpeed: 0.6, blast: 100 },
  armored: { halfW: 88, height: 118, headH: 30, headOffset: 108, wobbleAmp: 10, wobbleSpeed: 0.5, blast: 120 },
  drone: { halfW: 38, height: 78, headH: 38, headOffset: 56, wobbleAmp: 90, wobbleSpeed: 1.8, blast: 50 },
};

export const VEHICLE_TYPES = Object.keys(SPECS);

export class Vehicle {
  constructor(type, head, x, wave, rand) {
    const spec = SPECS[type];
    const stats = vehicleStats(type, wave);
    this.type = type;
    this.isVehicle = true;
    this.isBoss = false;
    this.head = head;
    this.halfW = spec.halfW;
    this.height = spec.height;
    this.headH = spec.headH;
    this.headOffset = spec.headOffset;
    this.blast = spec.blast;
    this.baseX = Math.min(W - spec.halfW - 20, Math.max(spec.halfW + 20, x));
    this.x = this.baseX;
    this.y = -20;
    this.speed = stats.speed;
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.coins = stats.coins;
    this.points = stats.points;
    this.wobble = rand() * 6.28;
    this.wobbleAmp = spec.wobbleAmp;
    this.wobbleSpeed = spec.wobbleSpeed;
    this.flash = 0;
    this.spin = 0;
    this.unloaded = false;
    this.raged = false;
  }

  headCenter() {
    return { x: this.x, y: this.y - this.headOffset + this.headH / 2 };
  }

  update(dt, time) {
    this.y += this.speed * dt;
    this.spin += dt * 40;
    const margin = this.halfW + 10;
    this.x = Math.min(W - margin, Math.max(margin, this.baseX + Math.sin(time * this.wobbleSpeed + this.wobble) * this.wobbleAmp));
    if (this.flash > 0) this.flash -= dt;
  }

  contains(px, py) {
    return Math.abs(px - this.x) <= this.halfW && py >= this.y - this.height && py <= this.y;
  }

  light(g, x, y, r) {
    const glow = g.createRadialGradient(x, y, 1, x, y, r * 3);
    glow.addColorStop(0, "rgba(255, 244, 170, 0.9)");
    glow.addColorStop(1, "rgba(255, 244, 170, 0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(x, y, r * 3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fffbe0";
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }

  glass(g, x, y, w, h) {
    const grad = g.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "rgba(190, 225, 245, 0.45)");
    grad.addColorStop(1, "rgba(120, 170, 200, 0.2)");
    g.fillStyle = grad;
    g.fillRect(x, y, w, h);
  }

  bar(g) {
    if (this.maxHp < 3) return;
    const w = Math.min(70, this.halfW * 1.4);
    const top = this.y - this.height - 12;
    g.fillStyle = "rgba(0,0,0,0.65)";
    g.fillRect(this.x - w / 2 - 1, top - 1, w + 2, 6);
    g.fillStyle = "#ff8a3d";
    g.fillRect(this.x - w / 2, top, (w * Math.max(0, this.hp)) / this.maxHp, 4);
  }

  draw(g) {
    g.save();
    if (this.flash > 0) g.filter = "brightness(2.2)";
    const { x, y } = this;
    if (this.type === "moto") this.drawMoto(g, x, y);
    else if (this.type === "jeep") this.drawJeep(g, x, y);
    else if (this.type === "truck") this.drawTruck(g, x, y);
    else if (this.type === "armored") this.drawArmored(g, x, y);
    else this.drawDrone(g, x, y);
    g.restore();
    this.bar(g);
  }

  drawMoto(g, x, y) {
    shadow(g, x, y, 26);
    g.fillStyle = "#14161a";
    g.beginPath();
    g.roundRect(x - 7, y - 40, 14, 40, 6);
    g.fill();
    g.fillStyle = "#c0262c";
    g.beginPath();
    g.roundRect(x - 17, y - 62, 34, 28, 9);
    g.fill();
    this.light(g, x, y - 52, 5);
    limb(g, x - 28, y - 68, x + 28, y - 68, 5, "#22262d");
    g.fillStyle = "#1b2a52";
    g.beginPath();
    g.roundRect(x - 15, y - 92, 30, 34, 7);
    g.fill();
    limb(g, x - 15, y - 86, x - 27, y - 68, 6, "#1b2a52");
    limb(g, x + 15, y - 86, x + 27, y - 68, 6, "#1b2a52");
    drawHead(g, this.head, x, y - 84, this.headH);
  }

  drawJeep(g, x, y) {
    shadow(g, x, y, 62);
    g.fillStyle = "#101216";
    g.fillRect(x - 60, y - 26, 16, 26);
    g.fillRect(x + 44, y - 26, 16, 26);
    g.fillStyle = "#3f5127";
    g.beginPath();
    g.roundRect(x - 54, y - 50, 108, 38, 8);
    g.fill();
    g.fillStyle = "#4f6532";
    g.fillRect(x - 54, y - 50, 108, 8);
    g.fillStyle = "#2c3a1b";
    g.fillRect(x - 36, y - 40, 72, 20);
    for (let i = -30; i <= 30; i += 10) {
      g.fillStyle = "#171b10";
      g.fillRect(x + i, y - 38, 4, 16);
    }
    g.fillStyle = "#2b3a1a";
    g.fillRect(x - 46, y - 90, 92, 44);
    drawHead(g, this.head, x, y - 52, this.headH);
    this.glass(g, x - 42, y - 86, 84, 36);
    g.strokeStyle = "#1c2612";
    g.lineWidth = 4;
    g.strokeRect(x - 42, y - 86, 84, 36);
    this.light(g, x - 40, y - 36, 5);
    this.light(g, x + 40, y - 36, 5);
  }

  drawTruck(g, x, y) {
    shadow(g, x, y, 84);
    g.fillStyle = "#8a7b4d";
    g.beginPath();
    g.roundRect(x - 72, y - 128, 144, 70, 10);
    g.fill();
    g.fillStyle = "#74663f";
    for (let i = -48; i <= 48; i += 24) g.fillRect(x + i, y - 126, 3, 66);
    g.fillStyle = "#101216";
    g.fillRect(x - 78, y - 34, 20, 34);
    g.fillRect(x + 58, y - 34, 20, 34);
    g.fillStyle = "#364826";
    g.beginPath();
    g.roundRect(x - 66, y - 82, 132, 56, 8);
    g.fill();
    g.fillStyle = "#26331a";
    g.fillRect(x - 54, y - 50, 108, 22);
    for (let i = -48; i <= 48; i += 12) {
      g.fillStyle = "#12170c";
      g.fillRect(x + i, y - 48, 5, 18);
    }
    drawHead(g, this.head, x, y - 62, this.headH);
    this.glass(g, x - 48, y - 100, 96, 40);
    g.strokeStyle = "#1c2612";
    g.lineWidth = 4;
    g.strokeRect(x - 48, y - 100, 96, 40);
    g.fillStyle = "#555b63";
    g.fillRect(x - 70, y - 24, 140, 10);
    this.light(g, x - 52, y - 40, 6);
    this.light(g, x + 52, y - 40, 6);
  }

  drawArmored(g, x, y) {
    shadow(g, x, y, 94);
    g.fillStyle = "#17191d";
    g.fillRect(x - 90, y - 52, 30, 52);
    g.fillRect(x + 60, y - 52, 30, 52);
    g.strokeStyle = "#31353c";
    g.lineWidth = 2;
    for (let i = 0; i < 52; i += 8) {
      const o = (this.spin * 0.4) % 8;
      g.beginPath();
      g.moveTo(x - 90, y - 52 + ((i + o) % 52));
      g.lineTo(x - 60, y - 52 + ((i + o) % 52));
      g.moveTo(x + 60, y - 52 + ((i + o) % 52));
      g.lineTo(x + 90, y - 52 + ((i + o) % 52));
      g.stroke();
    }
    g.fillStyle = "#4a4f3a";
    g.beginPath();
    g.moveTo(x - 62, y - 14);
    g.lineTo(x + 62, y - 14);
    g.lineTo(x + 52, y - 74);
    g.lineTo(x - 52, y - 74);
    g.closePath();
    g.fill();
    g.fillStyle = "#5b6149";
    g.fillRect(x - 52, y - 74, 104, 10);
    g.fillStyle = "#33372a";
    g.fillRect(x - 6, y - 70, 12, 56);
    g.fillStyle = "#555b63";
    g.beginPath();
    g.arc(x, y - 82, 28, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#6a7078";
    g.beginPath();
    g.arc(x, y - 84, 22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1b1d21";
    g.fillRect(x - 5, y - 82, 10, 44);
    g.fillStyle = "#101214";
    g.fillRect(x - 7, y - 42, 14, 6);
    drawHead(g, this.head, x, y - 82 + 8, this.headH);
    this.light(g, x - 40, y - 28, 5);
    this.light(g, x + 40, y - 28, 5);
  }

  drawDrone(g, x, y) {
    const bob = Math.sin(this.spin * 0.2) * 4;
    const cy = y - 40 + bob;
    g.fillStyle = "rgba(0,0,0,0.28)";
    g.beginPath();
    g.ellipse(x, y + 8, 30, 8, 0, 0, Math.PI * 2);
    g.fill();
    for (const [dx, dy] of [[-36, -16], [36, -16], [-36, 18], [36, 18]]) {
      limb(g, x, cy, x + dx * 0.7, cy + dy * 0.7, 4, "#2a2e35");
      g.fillStyle = "rgba(210, 220, 235, 0.55)";
      g.beginPath();
      g.ellipse(x + dx, cy + dy, 22 * Math.abs(Math.cos(this.spin)) + 6, 5, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#16181c";
      g.beginPath();
      g.arc(x + dx, cy + dy, 4, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#23262c";
    g.beginPath();
    g.arc(x, cy, 31, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.arc(x, cy, 27, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = "#9fd7ee";
    g.fillRect(x - 30, cy - 30, 60, 60);
    drawHead(g, this.head, x, cy + 22, this.headH + 6);
    this.glass(g, x - 30, cy - 30, 60, 60);
    g.restore();
    g.fillStyle = "#ff3b30";
    g.beginPath();
    g.arc(x, cy + 33, 3, 0, Math.PI * 2);
    g.fill();
  }
}
