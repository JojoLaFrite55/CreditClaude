import { W } from "./scene.js";
import { drawHead, limb, shadow } from "./sprites.js";
import { COINS } from "./weapons.js";

export const TYPES = {
  normal: { scale: 0.9, speedMul: 1, points: 10 },
  vest: { scale: 1, speedMul: 0.85, points: 30 },
  runner: { scale: 0.78, speedMul: 1.5, points: 20 },
  boss: { scale: 3, speedMul: 1, points: 2000 },
};

const SHIRTS = ["#c0392b", "#2980b9", "#8e44ad", "#d35400", "#16a085", "#7f8c8d", "#d4ac0d"];
const PANTS = ["#2c3e50", "#34495e", "#3b3b3b", "#1f2d3d"];

export class Enemy {
  constructor(type, head, x, speed, hp, rand) {
    const config = TYPES[type];
    this.type = type;
    this.head = head;
    this.baseX = x;
    this.x = x;
    this.y = -30;
    this.speed = Math.min(speed * config.speedMul, 135);
    this.hp = hp;
    this.maxHp = hp;
    this.points = config.points;
    this.coins = COINS[type] ?? 0;
    this.isBoss = type === "boss";
    this.raged = false;
    this.scale = config.scale;
    this.phase = rand() * 6.28;
    this.wobble = rand() * 6.28;
    this.wobbleAmp = 8 + rand() * 20;
    this.wobbleSpeed = 0.8 + rand() * 1.1;
    this.flash = 0;
    this.shirt = SHIRTS[Math.floor(rand() * SHIRTS.length)];
    this.pants = PANTS[Math.floor(rand() * PANTS.length)];
    this.headH = 40 * this.scale;
    this.torsoH = 26 * this.scale;
    this.torsoW = 28 * this.scale;
    this.legH = 20 * this.scale;
    this.height = this.headH + this.torsoH + this.legH;
    this.halfW = Math.max(this.torsoW, this.headH * (head.width / head.height) * 0.9) / 2;
  }

  update(dt, time) {
    this.y += this.speed * dt;
    this.phase += dt * (this.speed / 8);
    const margin = this.halfW + 12;
    this.x = Math.min(W - margin, Math.max(margin, this.baseX + Math.sin(time * this.wobbleSpeed + this.wobble) * this.wobbleAmp));
    if (this.flash > 0) this.flash -= dt;
  }

  headCenter() {
    return { x: this.x, y: this.y - this.height + this.headH / 2 };
  }

  contains(px, py) {
    return Math.abs(px - this.x) <= this.halfW && py >= this.y - this.height && py <= this.y;
  }

  draw(g) {
    const s = this.scale;
    const hipY = this.y - this.legH;
    const shoulderY = hipY - this.torsoH + 4 * s;
    const swing = Math.sin(this.phase);
    if (this.isBoss) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / (this.raged ? 110 : 260));
      const cy = this.y - this.height * 0.55;
      const aura = g.createRadialGradient(this.x, cy, 20, this.x, cy, this.height * 0.8);
      aura.addColorStop(0, `rgba(255, 40, 40, ${(this.raged ? 0.34 : 0.2) + pulse * 0.12})`);
      aura.addColorStop(1, "rgba(255, 40, 40, 0)");
      g.fillStyle = aura;
      g.fillRect(this.x - this.height, cy - this.height, this.height * 2, this.height * 2);
    }
    shadow(g, this.x, this.y, 16 * s);
    limb(g, this.x - 6 * s, hipY, this.x - 6 * s + swing * 8 * s, this.y, 7 * s, this.pants);
    limb(g, this.x + 6 * s, hipY, this.x + 6 * s - swing * 8 * s, this.y, 7 * s, this.pants);
    limb(g, this.x - this.torsoW / 2, shoulderY, this.x - this.torsoW / 2 - 4 * s - swing * 6 * s, shoulderY + 20 * s, 6 * s, "#d9a77c");
    limb(g, this.x + this.torsoW / 2, shoulderY, this.x + this.torsoW / 2 + 4 * s + swing * 6 * s, shoulderY + 20 * s, 6 * s, "#d9a77c");
    g.fillStyle = this.flash > 0 ? "#ffffff" : this.shirt;
    g.beginPath();
    g.roundRect(this.x - this.torsoW / 2, hipY - this.torsoH, this.torsoW, this.torsoH + 2, 5 * s);
    g.fill();
    if (this.type === "vest") {
      g.fillStyle = this.flash > 0 ? "#ffffff" : "#2f353c";
      g.beginPath();
      g.roundRect(this.x - this.torsoW / 2 - 1, hipY - this.torsoH + 2, this.torsoW + 2, this.torsoH - 2, 4 * s);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.14)";
      g.fillRect(this.x - 8 * s, hipY - this.torsoH + 6 * s, 16 * s, 7 * s);
      g.fillRect(this.x - 8 * s, hipY - this.torsoH + 15 * s, 16 * s, 6 * s);
      g.strokeStyle = "#f2c200";
      g.lineWidth = 1.5;
      g.strokeRect(this.x - this.torsoW / 2 - 1, hipY - this.torsoH + 2, this.torsoW + 2, this.torsoH - 2);
    }
    g.save();
    if (this.flash > 0) g.filter = "brightness(2.4)";
    drawHead(g, this.head, this.x, hipY - this.torsoH + 6 * s, this.headH);
    g.restore();
    if (this.type === "vest") {
      const barW = 30 * s;
      const top = this.y - this.height - 8;
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillRect(this.x - barW / 2 - 1, top - 1, barW + 2, 6);
      g.fillStyle = "#f2c200";
      g.fillRect(this.x - barW / 2, top, (barW * this.hp) / this.maxHp, 4);
    }
  }
}
