import { rand } from "./noise.js";

export const KNIFE = { w: 140, h: 560, tipX: 70, tipY: 548 };

export function drawKnife(bloody = false) {
  const canvas = document.createElement("canvas");
  canvas.width = KNIFE.w;
  canvas.height = KNIFE.h;
  const g = canvas.getContext("2d");
  const cx = KNIFE.w / 2;

  g.save();
  g.filter = "blur(5px)";
  g.fillStyle = "rgba(0,0,0,0.35)";
  g.beginPath();
  g.moveTo(cx - 24, 150);
  g.lineTo(cx + 34, 150);
  g.lineTo(cx + 4, 556);
  g.closePath();
  g.fill();
  g.restore();

  const bladeTop = 190;
  const tip = 548;
  const blade = new Path2D();
  blade.moveTo(cx - 25, bladeTop);
  blade.lineTo(cx + 25, bladeTop);
  blade.lineTo(cx + 24, bladeTop + 40);
  blade.bezierCurveTo(cx + 22, bladeTop + 190, cx + 14, bladeTop + 290, cx, tip);
  blade.bezierCurveTo(cx - 14, bladeTop + 290, cx - 22, bladeTop + 190, cx - 24, bladeTop + 40);
  blade.closePath();
  const steel = g.createLinearGradient(cx - 25, 0, cx + 25, 0);
  steel.addColorStop(0, "#5e646b");
  steel.addColorStop(0.22, "#c9ced4");
  steel.addColorStop(0.45, "#f4f7fa");
  steel.addColorStop(0.5, "#8e959c");
  steel.addColorStop(0.78, "#b7bdc4");
  steel.addColorStop(1, "#444a50");
  g.fillStyle = steel;
  g.fill(blade);
  g.save();
  g.clip(blade);
  const rnd = rand(5);
  for (let i = 0; i < 160; i++) {
    const x = cx - 25 + rnd() * 50;
    const y = bladeTop + rnd() * 360;
    g.strokeStyle = `rgba(${rnd() < 0.5 ? "255,255,255" : "40,45,52"},${0.05 + rnd() * 0.1})`;
    g.lineWidth = 0.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rnd() - 0.5) * 3, y + 10 + rnd() * 30);
    g.stroke();
  }
  g.fillStyle = "rgba(255,255,255,0.65)";
  g.beginPath();
  g.moveTo(cx - 14, bladeTop + 14);
  g.lineTo(cx - 9, bladeTop + 14);
  g.bezierCurveTo(cx - 8, bladeTop + 170, cx - 4, bladeTop + 280, cx - 1, tip - 20);
  g.lineTo(cx - 3, tip - 20);
  g.bezierCurveTo(cx - 8, bladeTop + 270, cx - 12, bladeTop + 160, cx - 14, bladeTop + 14);
  g.fill();
  g.fillStyle = "rgba(20,24,30,0.45)";
  g.fillRect(cx + 10, bladeTop, 16, 380);
  g.restore();
  g.strokeStyle = "rgba(20,24,30,0.9)";
  g.lineWidth = 1.5;
  g.stroke(blade);

  g.fillStyle = "#7a6a3a";
  g.beginPath();
  g.roundRect(cx - 28, bladeTop - 22, 56, 24, 4);
  g.fill();
  const bol = g.createLinearGradient(0, bladeTop - 22, 0, bladeTop + 2);
  bol.addColorStop(0, "rgba(255,240,180,0.5)");
  bol.addColorStop(1, "rgba(0,0,0,0.5)");
  g.fillStyle = bol;
  g.beginPath();
  g.roundRect(cx - 28, bladeTop - 22, 56, 24, 4);
  g.fill();

  const handle = new Path2D();
  handle.moveTo(cx - 19, bladeTop - 22);
  handle.lineTo(cx + 19, bladeTop - 22);
  handle.bezierCurveTo(cx + 24, 100, cx + 22, 50, cx + 16, 22);
  handle.lineTo(cx - 16, 22);
  handle.bezierCurveTo(cx - 22, 50, cx - 24, 100, cx - 19, bladeTop - 22);
  handle.closePath();
  const wood = g.createLinearGradient(cx - 24, 0, cx + 24, 0);
  wood.addColorStop(0, "#1a0d06");
  wood.addColorStop(0.3, "#5a3318");
  wood.addColorStop(0.5, "#7a4a24");
  wood.addColorStop(0.75, "#3f220f");
  wood.addColorStop(1, "#150a05");
  g.fillStyle = wood;
  g.fill(handle);
  g.save();
  g.clip(handle);
  for (let i = 0; i < 90; i++) {
    const x = cx - 24 + rnd() * 48;
    g.strokeStyle = `rgba(${rnd() < 0.5 ? "20,8,2" : "150,100,60"},${0.1 + rnd() * 0.2})`;
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x, 24 + rnd() * 20);
    g.bezierCurveTo(x + (rnd() - 0.5) * 6, 80, x + (rnd() - 0.5) * 6, 130, x + (rnd() - 0.5) * 4, 168);
    g.stroke();
  }
  g.restore();
  g.fillStyle = "#c9a85a";
  for (const y of [60, 110, 150]) {
    g.beginPath();
    g.arc(cx, y, 4.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.6)";
    g.beginPath();
    g.arc(cx - 1.4, y - 1.4, 1.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#c9a85a";
  }
  g.fillStyle = "#33210f";
  g.beginPath();
  g.ellipse(cx, 24, 17, 6, 0, 0, Math.PI * 2);
  g.fill();

  if (bloody) {
    g.save();
    g.clip(blade);
    const wash = g.createLinearGradient(0, bladeTop + 80, 0, tip);
    wash.addColorStop(0, "rgba(120,0,0,0)");
    wash.addColorStop(0.35, "rgba(110,0,0,0.65)");
    wash.addColorStop(1, "rgba(70,0,0,0.92)");
    g.fillStyle = wash;
    g.fillRect(cx - 30, bladeTop + 60, 60, 400);
    for (let i = 0; i < 6; i++) {
      const x = cx - 18 + rnd() * 36;
      const len = 40 + rnd() * 120;
      g.strokeStyle = "rgba(120,6,6,0.9)";
      g.lineWidth = 2 + rnd() * 3;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(x, tip - len - 120);
      g.lineTo(x + (rnd() - 0.5) * 3, tip - 120 + len * 0.6);
      g.stroke();
    }
    g.fillStyle = "rgba(255,160,150,0.4)";
    g.fillRect(cx - 12, bladeTop + 200, 3, 200);
    g.restore();
    g.fillStyle = "rgba(90,0,0,0.85)";
    g.beginPath();
    g.ellipse(cx, bladeTop + 6, 26, 8, 0, 0, Math.PI * 2);
    g.fill();
  }
  return canvas;
}
