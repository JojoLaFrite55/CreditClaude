import { H, W } from "./scene.js";
import { drawHead, limb, shadow } from "./sprites.js";

export const PLAYER = {
  feetY: H - 18,
  speed: 470,
  cooldown: 0.17,
  legH: 22,
  torsoH: 32,
  headH: 56,
};

export class Player {
  constructor(cop) {
    this.cop = cop;
    this.reset();
  }

  reset() {
    this.x = W / 2;
    this.moving = 0;
    this.phase = 0;
    this.flash = 0;
    this.recoil = 0;
    this.cool = 0;
  }

  get muzzle() {
    return { x: this.x, y: PLAYER.feetY - PLAYER.legH - PLAYER.torsoH - 22 };
  }

  update(dt, direction) {
    this.x = Math.min(W - 34, Math.max(34, this.x + direction * PLAYER.speed * dt));
    this.moving = direction;
    if (direction) this.phase += dt * 14;
    if (this.flash > 0) this.flash -= dt;
    if (this.recoil > 0) this.recoil -= dt * 9;
    if (this.cool > 0) this.cool -= dt;
  }

  draw(g) {
    const { feetY, legH, torsoH, headH } = PLAYER;
    const hipY = feetY - legH;
    const topTorso = hipY - torsoH;
    const kick = Math.max(0, this.recoil) * 5;
    const swing = this.moving ? Math.sin(this.phase) * 6 : 0;
    shadow(g, this.x, feetY, 24);
    limb(g, this.x - 7, hipY, this.x - 7 + swing, feetY, 9, "#14233f");
    limb(g, this.x + 7, hipY, this.x + 7 - swing, feetY, 9, "#14233f");
    g.fillStyle = "#050505";
    g.fillRect(this.x - 14 + swing, feetY - 3, 12, 5);
    g.fillRect(this.x + 2 - swing, feetY - 3, 12, 5);

    const handY = topTorso - 10 + kick;
    limb(g, this.x - 15, topTorso + 6, this.x - 4, handY, 7, "#1f3b73");
    limb(g, this.x + 15, topTorso + 6, this.x + 4, handY, 7, "#1f3b73");
    g.fillStyle = "#e0b08a";
    g.beginPath();
    g.arc(this.x - 3, handY, 4.5, 0, Math.PI * 2);
    g.arc(this.x + 3, handY, 4.5, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = "#222";
    g.beginPath();
    g.roundRect(this.x - 4, handY - 20 + kick * 0.4, 8, 22, 2);
    g.fill();
    g.fillStyle = "#555";
    g.fillRect(this.x - 2, handY - 20 + kick * 0.4, 4, 5);

    g.fillStyle = "#1f3b73";
    g.beginPath();
    g.roundRect(this.x - 17, topTorso, 34, torsoH + 2, 6);
    g.fill();
    g.fillStyle = "#14233f";
    g.fillRect(this.x - 17, hipY - 4, 34, 6);
    g.fillStyle = "#f2c200";
    g.fillRect(this.x - 4, hipY - 4, 8, 6);
    g.fillStyle = "#f2c200";
    g.beginPath();
    g.moveTo(this.x + 6, topTorso + 7);
    g.lineTo(this.x + 12, topTorso + 7);
    g.lineTo(this.x + 12, topTorso + 14);
    g.lineTo(this.x + 9, topTorso + 17);
    g.lineTo(this.x + 6, topTorso + 14);
    g.closePath();
    g.fill();

    const width = drawHead(g, this.cop.image, this.x, topTorso + 8, headH);
    if (this.cop.fallback) {
      g.fillStyle = "#14233f";
      g.beginPath();
      g.ellipse(this.x, topTorso + 8 - headH + 8, width * 0.52, 14, 0, Math.PI, 0);
      g.fill();
      g.fillRect(this.x - width * 0.52, topTorso + 8 - headH + 7, width * 1.04, 5);
      g.fillStyle = "#f2c200";
      g.beginPath();
      g.arc(this.x, topTorso + 8 - headH + 2, 3.5, 0, Math.PI * 2);
      g.fill();
    }

    if (this.flash > 0) {
      const m = this.muzzle;
      const y = m.y + kick - 2;
      const glow = g.createRadialGradient(m.x, y, 2, m.x, y, 46);
      glow.addColorStop(0, "rgba(255, 220, 120, 0.9)");
      glow.addColorStop(1, "rgba(255, 160, 40, 0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(m.x, y, 46, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff6c8";
      g.beginPath();
      g.moveTo(m.x, y - 30);
      g.lineTo(m.x + 6, y - 4);
      g.lineTo(m.x + 14, y - 10);
      g.lineTo(m.x + 6, y + 4);
      g.lineTo(m.x - 6, y + 4);
      g.lineTo(m.x - 14, y - 10);
      g.lineTo(m.x - 6, y - 4);
      g.closePath();
      g.fill();
    }
  }
}
