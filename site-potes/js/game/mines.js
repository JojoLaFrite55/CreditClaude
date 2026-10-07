import { BORDER_Y, W } from "./scene.js";

export class Mine {
  constructor(existing) {
    let x = 0;
    for (let i = 0; i < 12; i++) {
      x = 60 + Math.random() * (W - 120);
      if (!existing.some((mine) => Math.abs(mine.x - x) < 44)) break;
    }
    this.x = x;
    this.y = BORDER_Y - 54 + Math.random() * 34;
    this.age = 0;
    this.phase = Math.random() * 6;
  }

  get armed() {
    return this.age > 0.5;
  }

  update(dt) {
    this.age += dt;
  }

  draw(g, time) {
    const grow = Math.min(1, this.age / 0.3);
    const r = 10 * grow;
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.ellipse(this.x, this.y + 4, r * 1.3, r * 0.5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2b2f36";
    g.beginPath();
    g.ellipse(this.x, this.y, r * 1.2, r * 0.7, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#5a606b";
    g.lineWidth = 1.5;
    g.stroke();
    const on = this.armed && Math.sin(time * 5 + this.phase) > 0.35;
    g.fillStyle = on ? "#ff3b30" : "#5a1a16";
    g.beginPath();
    g.arc(this.x, this.y - 1, 2.4 * grow, 0, Math.PI * 2);
    g.fill();
    if (on) {
      const glow = g.createRadialGradient(this.x, this.y - 1, 1, this.x, this.y - 1, 16);
      glow.addColorStop(0, "rgba(255, 59, 48, 0.55)");
      glow.addColorStop(1, "rgba(255, 59, 48, 0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(this.x, this.y - 1, 16, 0, Math.PI * 2);
      g.fill();
    }
  }
}
