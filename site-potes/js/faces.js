import { HEADS, MEME_EXTRAS, POLICE } from "./data.js";

const loadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const SKINS = ["#e0b08a", "#d9a37a", "#e8bf9a", "#cf9870"];
const HAIRS = ["#3b2a20", "#1c1613", "#2b2019", "#4a3426"];

function cartoonFace(index) {
  const canvas = document.createElement("canvas");
  canvas.width = 260;
  canvas.height = 320;
  const g = canvas.getContext("2d");
  g.fillStyle = HAIRS[index % 4];
  g.beginPath();
  g.ellipse(130, 120, 106, 100, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = SKINS[index % 4];
  g.beginPath();
  g.ellipse(130, 170, 98, 138, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = HAIRS[index % 4];
  g.beginPath();
  g.ellipse(130, 78, 100, 56, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.ellipse(92, 160, 20, 14, 0, 0, Math.PI * 2);
  g.ellipse(168, 160, 20, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2b1d14";
  g.beginPath();
  g.arc(94, 162, 8, 0, Math.PI * 2);
  g.arc(166, 162, 8, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = HAIRS[index % 4];
  g.lineWidth = 7;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(68, 134 - (index === 2 ? 10 : 0));
  g.lineTo(116, 130);
  g.moveTo(144, 130);
  g.lineTo(192, 134 - (index === 2 ? 10 : 0));
  g.stroke();
  g.strokeStyle = "rgba(0,0,0,0.25)";
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(130, 168);
  g.lineTo(122, 214);
  g.lineTo(138, 216);
  g.stroke();
  g.fillStyle = "#7a2d2d";
  g.strokeStyle = "#5c1f1f";
  g.lineWidth = 4;
  g.beginPath();
  if (index === 0) {
    g.ellipse(130, 262, 44, 28, 0, 0, Math.PI);
    g.fill();
    g.fillStyle = "#fff";
    g.fillRect(92, 258, 76, 9);
  } else if (index === 1) {
    g.moveTo(98, 262);
    g.lineTo(162, 262);
    g.stroke();
  } else if (index === 2) {
    g.ellipse(130, 262, 30, 20, 0, 0, Math.PI);
    g.fill();
    g.fillStyle = "#d9737d";
    g.beginPath();
    g.ellipse(136, 280, 16, 20, 0, 0, Math.PI * 2);
    g.fill();
  } else {
    g.arc(130, 250, 40, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
  }
  return canvas;
}

export async function loadHeads() {
  const loaded = (await Promise.all(HEADS.map(loadImage))).map((image, index) => image ?? cartoonFace(index));
  return loaded;
}

export async function loadMemeModels() {
  const [heads, extras] = await Promise.all([loadHeads(), Promise.all(MEME_EXTRAS.map(loadImage))]);
  return [...heads, ...extras.filter(Boolean)];
}

export async function loadPolice() {
  const loaded = (await Promise.all(POLICE.map(loadImage))).filter(Boolean);
  if (loaded.length) return { image: loaded[Math.floor(Math.random() * loaded.length)], fallback: false };
  return { image: cartoonFace(1), fallback: true };
}
