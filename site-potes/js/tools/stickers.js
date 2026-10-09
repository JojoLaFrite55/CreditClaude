import { loadHeads, pointer, setupCanvas } from "../arcade/kit.js";

const S = 800;
const heads = await loadHeads();
const canvas = document.getElementById("cv");
const g = setupCanvas(canvas, S, S);
const picker = document.getElementById("heads");
const bgs = document.getElementById("bgs");
const sizeEl = document.getElementById("size");
const rotEl = document.getElementById("rot");
const textEl = document.getElementById("text");
const colorEl = document.getElementById("color");
const upload = document.getElementById("upload");
const PHOTOS = ["casque", "bouche", "tourne-mal", "grimace", "dinguerie", "gros-caca", "chapeau", "cri", "webcam", "moustache", "cri-noir", "lunettes", "concombres", "oasis", "chemise-rose", "canape", "treillis", "filtre-violet"];
const GRADS = [["#0f4c75", "#3282b8"], ["#c0392b", "#f39c12"], ["#1e8449", "#b7e44a"], ["#4a235a", "#af7ac5"], ["#17202a", "#566573"], ["#d63384", "#ffb3d9"]];
const state = { bg: { type: "grad", i: 0 }, bgImg: null, items: [], sel: null, drag: null };

function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function thumb(img, size = 64) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const cx = c.getContext("2d");
  const k = Math.max(size / img.width, size / img.height);
  cx.drawImage(img, (size - img.width * k) / 2, (size - img.height * k) / 2, img.width * k, img.height * k);
  return c;
}

heads.forEach((head, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "st-head";
  b.setAttribute("aria-label", `Ajouter la tête ${i + 1}`);
  const c = document.createElement("canvas");
  c.width = 80;
  c.height = 80;
  const cx = c.getContext("2d");
  const k = Math.min(72 / head.width, 72 / head.height);
  cx.drawImage(head, (80 - head.width * k) / 2, (80 - head.height * k) / 2, head.width * k, head.height * k);
  b.append(c);
  b.addEventListener("click", () => add({ type: "head", img: head, w: 260 * (head.width > head.height ? 1 : head.width / head.height) , h: 260 * (head.width > head.height ? head.height / head.width : 1) }));
  picker.append(b);
});

GRADS.forEach(([a, b2], i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "st-bg";
  b.style.background = `linear-gradient(135deg, ${a}, ${b2})`;
  b.setAttribute("aria-label", `Fond ${i + 1}`);
  b.addEventListener("click", () => {
    state.bg = { type: "grad", i };
    state.bgImg = null;
    render();
  });
  bgs.append(b);
});
for (const name of PHOTOS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "st-bg";
  b.style.background = `center / cover url("assets/photos/${name}.jpg")`;
  b.setAttribute("aria-label", `Photo ${name}`);
  b.addEventListener("click", async () => {
    state.bgImg = await loadImg(`assets/photos/${name}.jpg`);
    state.bg = { type: "img" };
    render();
  });
  bgs.append(b);
}

function add(item) {
  const entry = { x: S / 2 + (Math.random() - 0.5) * 120, y: S / 2 + (Math.random() - 0.5) * 120, scale: 1, rot: 0, flip: 1, ...item };
  state.items.push(entry);
  select(entry);
}

function select(item) {
  state.sel = item;
  if (item) {
    sizeEl.value = Math.round(item.scale * 100);
    rotEl.value = Math.round((item.rot * 180) / Math.PI);
  }
  sizeEl.disabled = rotEl.disabled = !item;
  render();
}

function measure(item) {
  if (item.type === "text") {
    g.font = `800 ${Math.round(70 * item.scale)}px Anton, Impact, "Arial Black", sans-serif`;
    return { w: g.measureText(item.text).width + 20, h: 90 * item.scale };
  }
  return { w: item.w * item.scale, h: item.h * item.scale };
}

function hit(x, y) {
  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    const { w, h } = measure(it);
    const dx = x - it.x;
    const dy = y - it.y;
    const c = Math.cos(-it.rot);
    const s = Math.sin(-it.rot);
    const lx = dx * c - dy * s;
    const ly = dx * s + dy * c;
    if (Math.abs(lx) < w / 2 && Math.abs(ly) < h / 2) return it;
  }
  return null;
}

function render(forExport = false) {
  if (state.bg.type === "grad") {
    const [a, b] = GRADS[state.bg.i];
    const gr = g.createLinearGradient(0, 0, S, S);
    gr.addColorStop(0, a);
    gr.addColorStop(1, b);
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
  } else if (state.bgImg) {
    const k = Math.max(S / state.bgImg.width, S / state.bgImg.height);
    g.fillStyle = "#000";
    g.fillRect(0, 0, S, S);
    g.drawImage(state.bgImg, (S - state.bgImg.width * k) / 2, (S - state.bgImg.height * k) / 2, state.bgImg.width * k, state.bgImg.height * k);
  }
  for (const it of state.items) {
    g.save();
    g.translate(it.x, it.y);
    g.rotate(it.rot);
    g.scale(it.flip, 1);
    if (it.type === "head") {
      g.shadowColor = "rgba(0,0,0,0.35)";
      g.shadowBlur = 14;
      g.drawImage(it.img, (-it.w * it.scale) / 2, (-it.h * it.scale) / 2, it.w * it.scale, it.h * it.scale);
    } else {
      g.font = `800 ${Math.round(70 * it.scale)}px Anton, Impact, "Arial Black", sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineWidth = Math.max(6, 10 * it.scale);
      g.lineJoin = "round";
      g.strokeStyle = "#000";
      g.strokeText(it.text, 0, 0);
      g.fillStyle = it.color;
      g.fillText(it.text, 0, 0);
    }
    g.restore();
  }
  if (!forExport && state.sel) {
    const it = state.sel;
    const { w, h } = measure(it);
    g.save();
    g.translate(it.x, it.y);
    g.rotate(it.rot);
    g.strokeStyle = "#ffffff";
    g.lineWidth = 3;
    g.setLineDash([10, 8]);
    g.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
    g.restore();
  }
}

canvas.addEventListener("pointerdown", (event) => {
  const p = pointer(event, canvas, S, S);
  const it = hit(p.x, p.y);
  select(it);
  if (it) {
    state.drag = { dx: it.x - p.x, dy: it.y - p.y };
    canvas.setPointerCapture(event.pointerId);
    state.items.splice(state.items.indexOf(it), 1);
    state.items.push(it);
  }
});
canvas.addEventListener("pointermove", (event) => {
  if (!state.drag || !state.sel) return;
  const p = pointer(event, canvas, S, S);
  state.sel.x = p.x + state.drag.dx;
  state.sel.y = p.y + state.drag.dy;
  render();
});
canvas.addEventListener("pointerup", () => (state.drag = null));
canvas.addEventListener("wheel", (event) => {
  if (!state.sel) return;
  event.preventDefault();
  state.sel.scale = Math.max(0.2, Math.min(4, state.sel.scale * (event.deltaY < 0 ? 1.06 : 0.94)));
  sizeEl.value = Math.round(state.sel.scale * 100);
  render();
}, { passive: false });
sizeEl.addEventListener("input", () => {
  if (state.sel) state.sel.scale = Number(sizeEl.value) / 100;
  render();
});
rotEl.addEventListener("input", () => {
  if (state.sel) state.sel.rot = (Number(rotEl.value) * Math.PI) / 180;
  render();
});
document.getElementById("flip").addEventListener("click", () => {
  if (state.sel) state.sel.flip *= -1;
  render();
});
document.getElementById("del").addEventListener("click", () => {
  if (!state.sel) return;
  state.items.splice(state.items.indexOf(state.sel), 1);
  select(null);
});
document.getElementById("clear").addEventListener("click", () => {
  state.items = [];
  select(null);
});
document.getElementById("add-text").addEventListener("click", () => {
  const text = textEl.value.trim();
  if (text) add({ type: "text", text: text.toUpperCase(), color: colorEl.value });
});
textEl.addEventListener("keydown", (event) => event.key === "Enter" && document.getElementById("add-text").click());
upload.addEventListener("change", async () => {
  const file = upload.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  state.bgImg = await loadImg(url);
  state.bg = { type: "img" };
  render();
});
document.getElementById("download").addEventListener("click", () => {
  const prev = state.sel;
  state.sel = null;
  render(true);
  const link = document.createElement("a");
  link.download = "montage-qg.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  state.sel = prev;
  render();
});
sizeEl.disabled = rotEl.disabled = true;
await document.fonts?.load?.('800 40px "Anton"').catch(() => {});
render();
void thumb;
