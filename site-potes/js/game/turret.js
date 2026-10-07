import { TURRET_WEAPON } from "./weapons.js";
import { H, W } from "./scene.js";

export const TURRET_SLOTS = [
  { x: 140, y: H - 48 },
  { x: W - 140, y: H - 48 },
  { x: W / 2, y: H - 34 },
];

const wrap = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

export class Turret {
  constructor(slot) {
    this.x = slot.x;
    this.y = slot.y;
    this.angle = -Math.PI / 2;
    this.cool = 0.3 + Math.random() * 0.4;
    this.recoil = 0;
    this.flash = 0;
  }

  get muzzle() {
    const reach = 34 - this.recoil * 5;
    return { x: this.x + Math.cos(this.angle) * reach, y: this.y - 14 + Math.sin(this.angle) * reach };
  }

  update(dt, enemies, fire) {
    let target = null;
    for (const enemy of enemies) {
      if (enemy.y - enemy.height * 0.5 < 10) continue;
      if (!target || enemy.y > target.y) target = enemy;
    }
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 8);
    if (this.flash > 0) this.flash -= dt;
    this.cool -= dt;
    if (!target) {
      this.angle += wrap(-Math.PI / 2 - this.angle) * Math.min(1, dt * 3);
      return;
    }
    const aim = Math.atan2(target.y - target.height * 0.55 - (this.y - 14), target.x - this.x);
    const delta = wrap(aim - this.angle);
    this.angle += delta * Math.min(1, dt * 12);
    if (this.cool <= 0 && Math.abs(delta) < 0.12) {
      this.cool = TURRET_WEAPON.cooldown;
      this.recoil = 1;
      this.flash = 0.05;
      fire(this, this.angle);
    }
  }

  draw(g) {
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.ellipse(this.x, this.y + 2, 34, 9, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#6b6350";
    g.beginPath();
    g.ellipse(this.x, this.y - 2, 32, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#8a8064";
    g.beginPath();
    g.ellipse(this.x, this.y - 6, 30, 9, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = "#22303a";
    g.beginPath();
    g.roundRect(this.x - 15, this.y - 24, 30, 18, 5);
    g.fill();
    g.fillStyle = "#00c9b1";
    g.fillRect(this.x - 15, this.y - 12, 30, 3);
    g.save();
    g.translate(this.x, this.y - 14);
    g.rotate(this.angle);
    g.fillStyle = "#11171c";
    g.fillRect(0, -3.5, 30 - this.recoil * 5, 7);
    g.fillStyle = "#3a4650";
    g.fillRect(4, -2, 20 - this.recoil * 5, 2);
    if (this.flash > 0) {
      const glow = g.createRadialGradient(34, 0, 1, 34, 0, 28);
      glow.addColorStop(0, "rgba(180, 250, 255, 0.95)");
      glow.addColorStop(1, "rgba(0, 200, 220, 0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(34, 0, 28, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    g.fillStyle = "#00e0c6";
    g.beginPath();
    g.arc(this.x - 9, this.y - 19, 2, 0, Math.PI * 2);
    g.fill();
  }
}
