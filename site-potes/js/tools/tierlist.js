import { downloadCanvas } from "../meme-core.js";
import { createSfx, loadMemeModels, mountSoundButton } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const models = await loadMemeModels();

const TIERS = [
  { label: "S", color: "#ff7f7f" },
  { label: "A", color: "#ffbf7f" },
  { label: "B", color: "#ffdf7f" },
  { label: "C", color: "#bfff7f" },
  { label: "D", color: "#7fbfff" },
];

const board = document.getElementById("board");
const pool = document.getElementById("pool");
const title = document.getElementById("tier-title");
let dragged = null;
let selected = null;

TIERS.forEach((tier) => {
  const row = document.createElement("div");
  row.className = "tier-row";
  const label = document.createElement("div");
  label.className = "tier-label";
  label.contentEditable = "true";
  label.spellcheck = false;
  label.style.background = tier.color;
  label.textContent = tier.label;
  const items = document.createElement("div");
  items.className = "tier-items";
  items.dataset.drop = "true";
  row.append(label, items);
  board.append(row);
});

function dataUrl(image) {
  if (image instanceof HTMLCanvasElement) return image.toDataURL("image/png");
  return image.src;
}

function makeItem(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.draggable = true;
  img.className = "tier-item";
  img.addEventListener("dragstart", (event) => {
    dragged = img;
    event.dataTransfer?.setData("text/plain", "tete");
    setTimeout(() => img.classList.add("dragging"), 0);
  });
  img.addEventListener("dragend", () => {
    img.classList.remove("dragging");
    dragged = null;
  });
  img.addEventListener("click", (event) => {
    event.stopPropagation();
    sfx.init();
    sfx.click();
    selected?.classList.remove("selected");
    selected = selected === img ? null : img;
    selected?.classList.add("selected");
  });
  return img;
}

models.forEach((image) => pool.append(makeItem(dataUrl(image))));

function bindZone(zone) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("over");
    if (dragged) {
      zone.append(dragged);
      sfx.init();
      sfx.pop();
    }
  });
  zone.addEventListener("click", () => {
    if (!selected) return;
    zone.append(selected);
    selected.classList.remove("selected");
    selected = null;
    sfx.init();
    sfx.pop();
  });
}

document.querySelectorAll("[data-drop]").forEach(bindZone);

document.getElementById("file").addEventListener("change", (event) => {
  const files = [...(event.target.files ?? [])].slice(0, 12);
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const reader = new FileReader();
    reader.onload = () => pool.append(makeItem(String(reader.result)));
    reader.readAsDataURL(file);
  }
  event.target.value = "";
});

document.getElementById("reset").addEventListener("click", () => {
  sfx.init();
  sfx.click();
  board.querySelectorAll(".tier-item").forEach((item) => pool.append(item));
});

document.getElementById("export").addEventListener("click", async () => {
  sfx.init();
  sfx.click();
  await document.fonts?.load("40px Anton").catch(() => undefined);
  const rows = [...board.querySelectorAll(".tier-row")];
  const W = 1000;
  const ROW = 120;
  const canvas = document.createElement("canvas");
  const header = 90;
  canvas.width = W;
  canvas.height = header + rows.length * ROW;
  const g = canvas.getContext("2d");
  g.fillStyle = "#121212";
  g.fillRect(0, 0, W, canvas.height);
  g.fillStyle = "#fff";
  g.font = '400 52px Anton, Impact, sans-serif';
  g.textAlign = "center";
  g.fillText((title.value || "Tier list").toUpperCase(), W / 2, 62);
  rows.forEach((row, index) => {
    const y = header + index * ROW;
    const label = row.querySelector(".tier-label");
    g.fillStyle = label.style.background || "#999";
    g.fillRect(0, y, ROW, ROW - 4);
    g.fillStyle = "#111";
    g.font = '400 44px Anton, Impact, sans-serif';
    g.fillText(label.textContent.trim().slice(0, 6), ROW / 2, y + ROW / 2 + 14);
    g.fillStyle = "#1e1f24";
    g.fillRect(ROW, y, W - ROW, ROW - 4);
    row.querySelectorAll(".tier-item").forEach((img, i) => {
      const size = ROW - 20;
      const ratio = img.naturalWidth / img.naturalHeight || 1;
      const w = Math.min(size, size * ratio);
      const h = w / ratio;
      g.drawImage(img, ROW + 10 + i * (size + 8) + (size - w) / 2, y + 8 + (size - h) / 2, w, h);
    });
  });
  downloadCanvas(canvas, "tier-list");
});
