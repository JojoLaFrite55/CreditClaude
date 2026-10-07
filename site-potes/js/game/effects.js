import { H, W } from "./scene.js";
import { drawHead } from "./sprites.js";

const BLOOD = ["#8a0303", "#b00000", "#c40d0d", "#6e0000", "#9c1111"];

export class Effects {
  constructor(scale) {
    this.scale = scale;
    this.particles = [];
    this.heads = [];
    this.texts = [];
    this.splat = document.createElement("canvas");
    this.splat.width = W * scale;
    this.splat.height = H * scale;
    this.splatCtx = this.splat.getContext("2d");
    this.splatCtx.scale(scale, scale);
    this.fade = 0;
  }

  reset() {
    this.particles.length = 0;
    this.heads.length = 0;
    this.texts.length = 0;
    this.splatCtx.clearRect(0, 0, W, H);
  }

  blood(x, y, count, power = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 330) * power;
      this.particles.push({
        kind: "blood",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 140 * power,
        r: 1.6 + Math.random() * 3.6,
        life: 0,
        max: 0.5 + Math.random() * 0.7,
        color: BLOOD[Math.floor(Math.random() * BLOOD.length)],
      });
    }
    const g = this.splatCtx;
    for (let i = 0; i < 5; i++) {
      const sx = x + (Math.random() - 0.5) * 70 * power;
      const sy = y + 10 + Math.random() * 46 * power;
      g.fillStyle = `rgba(${90 + Math.random() * 40}, 0, 0, ${0.35 + Math.random() * 0.3})`;
      g.beginPath();
      g.ellipse(sx, sy, 3 + Math.random() * 11 * power, 2 + Math.random() * 7 * power, Math.random() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
  }

  sparks(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
      const speed = 120 + Math.random() * 280;
      this.particles.push({
        kind: "spark",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.2 + Math.random() * 1.6,
        life: 0,
        max: 0.18 + Math.random() * 0.22,
        color: Math.random() < 0.5 ? "#ffd54a" : "#fff3b0",
      });
    }
  }

  flyingHead(image, x, y, height) {
    this.heads.push({
      image,
      x,
      y,
      height,
      vx: (Math.random() - 0.5) * 280,
      vy: -260 - Math.random() * 160,
      rot: 0,
      vr: (Math.random() - 0.5) * 14,
      life: 0,
    });
  }

  text(x, y, value, color = "#ffffff", size = 20) {
    this.texts.push({ x, y, value, color, size, life: 0 });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.max) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += (p.kind === "blood" ? 720 : 520) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = this.heads.length - 1; i >= 0; i--) {
      const h = this.heads[i];
      h.life += dt;
      if (h.life > 1.1) {
        this.heads.splice(i, 1);
        continue;
      }
      h.vy += 900 * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rot += h.vr * dt;
      if (Math.random() < 0.6) {
        this.particles.push({ kind: "blood", x: h.x, y: h.y, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, r: 1.5 + Math.random() * 2, life: 0, max: 0.4, color: "#a00000" });
      }
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life += dt;
      t.y -= 38 * dt;
      if (t.life > 0.9) this.texts.splice(i, 1);
    }
    this.fade += dt;
    if (this.fade > 0.5) {
      this.fade = 0;
      this.splatCtx.save();
      this.splatCtx.globalCompositeOperation = "destination-out";
      this.splatCtx.fillStyle = "rgba(0,0,0,0.03)";
      this.splatCtx.fillRect(0, 0, W, H);
      this.splatCtx.restore();
    }
  }

  drawSplat(g) {
    g.drawImage(this.splat, 0, 0, W, H);
  }

  drawParticles(g) {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.max;
      g.globalAlpha = Math.max(0, alpha);
      g.fillStyle = p.color;
      g.beginPath();
      g.arc(p.x, p.y, p.r * (p.kind === "blood" ? 0.6 + alpha * 0.4 : 1), 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    for (const h of this.heads) {
      g.save();
      g.globalAlpha = Math.max(0, 1 - Math.max(0, h.life - 0.7) / 0.4);
      g.translate(h.x, h.y);
      g.rotate(h.rot);
      drawHead(g, h.image, 0, h.height / 2, h.height);
      g.restore();
    }
  }

  drawTexts(g) {
    g.textAlign = "center";
    for (const t of this.texts) {
      g.globalAlpha = Math.max(0, 1 - t.life / 0.9);
      g.font = `800 ${t.size}px "Inter", system-ui, sans-serif`;
      g.lineWidth = 4;
      g.strokeStyle = "rgba(0,0,0,0.75)";
      g.strokeText(t.value, t.x, t.y);
      g.fillStyle = t.color;
      g.fillText(t.value, t.x, t.y);
    }
    g.globalAlpha = 1;
  }
}
