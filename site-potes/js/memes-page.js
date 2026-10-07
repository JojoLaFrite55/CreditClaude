import "./layout.js";
import { BACKGROUNDS, MEMES } from "./data.js";
import { loadHeads } from "./faces.js";
import { downloadCanvas, renderMeme } from "./meme-core.js";

const heads = await loadHeads();

const preview = document.getElementById("preview");
const topInput = document.getElementById("top");
const bottomInput = document.getElementById("bottom");
const models = document.getElementById("models");
const swatches = document.getElementById("swatches");
const gallery = document.getElementById("gallery");

const state = { head: 0, bg: BACKGROUNDS[0].id };

const thumb = (head) => {
  const element = document.createElement(head instanceof HTMLCanvasElement ? "canvas" : "img");
  if (head instanceof HTMLCanvasElement) {
    element.width = head.width;
    element.height = head.height;
    element.getContext("2d").drawImage(head, 0, 0);
  } else {
    element.src = head.src;
    element.alt = "";
  }
  return element;
};

function draw() {
  return renderMeme(preview, { head: heads[state.head], bg: state.bg, top: topInput.value, bottom: bottomInput.value });
}

heads.forEach((head, index) => {
  const label = document.createElement("label");
  label.className = "model";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "model";
  input.checked = index === 0;
  input.setAttribute("aria-label", `Modèle ${index + 1}`);
  input.addEventListener("change", () => {
    state.head = index;
    draw();
  });
  label.append(input, thumb(head));
  models.append(label);
});

BACKGROUNDS.forEach((item, index) => {
  const label = document.createElement("label");
  label.className = "swatch";
  label.title = item.label;
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "bg";
  input.checked = index === 0;
  input.setAttribute("aria-label", item.label);
  input.addEventListener("change", () => {
    state.bg = item.id;
    draw();
  });
  const dot = document.createElement("span");
  dot.style.background = `linear-gradient(135deg, ${item.a}, ${item.b})`;
  label.append(input, dot);
  swatches.append(label);
});

topInput.addEventListener("input", draw);
bottomInput.addEventListener("input", draw);

document.getElementById("download").addEventListener("click", () => downloadCanvas(preview, "meme-qg"));

document.getElementById("shuffle").addEventListener("click", () => {
  const pick = MEMES[Math.floor(Math.random() * MEMES.length)];
  state.head = pick.head % heads.length;
  state.bg = pick.bg;
  topInput.value = pick.top;
  bottomInput.value = pick.bottom;
  models.querySelectorAll("input")[state.head].checked = true;
  swatches.querySelectorAll("input")[BACKGROUNDS.findIndex((item) => item.id === pick.bg)].checked = true;
  draw();
});

MEMES.forEach((meme, index) => {
  const card = document.createElement("article");
  card.className = "card";
  const media = document.createElement("div");
  media.className = "media square";
  const canvas = document.createElement("canvas");
  media.append(canvas);
  const actions = document.createElement("div");
  actions.className = "card-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "btn btn-small btn-secondary";
  save.textContent = "Télécharger";
  save.addEventListener("click", () => downloadCanvas(canvas, `meme-${index + 1}`));
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "btn btn-small btn-secondary";
  edit.textContent = "Modifier";
  edit.addEventListener("click", () => {
    state.head = meme.head % heads.length;
    state.bg = meme.bg;
    topInput.value = meme.top;
    bottomInput.value = meme.bottom;
    models.querySelectorAll("input")[state.head].checked = true;
    swatches.querySelectorAll("input")[BACKGROUNDS.findIndex((item) => item.id === meme.bg)].checked = true;
    draw();
    document.getElementById("generateur").scrollIntoView({ behavior: "smooth" });
  });
  actions.append(save, edit);
  card.append(media, actions);
  gallery.append(card);
  renderMeme(canvas, { head: heads[meme.head % heads.length], bg: meme.bg, top: meme.top, bottom: meme.bottom });
});

topInput.value = MEMES[0].top;
bottomInput.value = MEMES[0].bottom;
draw();
