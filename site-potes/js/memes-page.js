import "./layout.js";
import { BACKGROUNDS, MEMES } from "./data.js";
import { loadMemeModels } from "./faces.js";
import { downloadCanvas, renderMeme } from "./meme-core.js";

const heads = await loadMemeModels();

const preview = document.getElementById("preview");
const topInput = document.getElementById("top");
const bottomInput = document.getElementById("bottom");
const models = document.getElementById("models");
const models2 = document.getElementById("models2");
const models2Box = document.getElementById("models2-box");
const swatches = document.getElementById("swatches");
const gallery = document.getElementById("gallery");
const layoutSelect = document.getElementById("layout");
const filter = document.getElementById("filter");

const state = { head: 0, head2: 1, bg: BACKGROUNDS[0].id, layout: "classic" };

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

const options = () => ({ head: heads[state.head], head2: heads[state.head2], bg: state.bg, top: topInput.value, bottom: bottomInput.value, layout: state.layout });
const draw = () => renderMeme(preview, options());

const modelPicker = (container, name, key) =>
  heads.forEach((head, index) => {
    const label = document.createElement("label");
    label.className = "model";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.checked = index === state[key];
    input.setAttribute("aria-label", `Modèle ${index + 1}`);
    input.addEventListener("change", () => {
      state[key] = index;
      draw();
    });
    label.append(input, thumb(head));
    container.append(label);
  });

modelPicker(models, "model", "head");
modelPicker(models2, "model2", "head2");

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
  dot.style.background = item.image ? `center / cover url("${item.image}")` : `linear-gradient(135deg, ${item.a}, ${item.b})`;
  label.append(input, dot);
  swatches.append(label);
});

function syncControls() {
  models.querySelectorAll("input")[state.head].checked = true;
  models2.querySelectorAll("input")[state.head2].checked = true;
  swatches.querySelectorAll("input")[Math.max(0, BACKGROUNDS.findIndex((item) => item.id === state.bg))].checked = true;
  layoutSelect.value = state.layout;
  models2Box.classList.toggle("hidden", !["drake", "versus"].includes(state.layout));
}

function load(meme) {
  state.head = meme.head % heads.length;
  state.head2 = (meme.head2 ?? meme.head + 1) % heads.length;
  state.bg = meme.bg;
  state.layout = meme.layout ?? "classic";
  topInput.value = meme.top;
  bottomInput.value = meme.bottom;
  syncControls();
  draw();
}

layoutSelect.addEventListener("change", () => {
  state.layout = layoutSelect.value;
  syncControls();
  draw();
});
topInput.addEventListener("input", draw);
bottomInput.addEventListener("input", draw);

document.getElementById("download").addEventListener("click", () => downloadCanvas(preview, "meme-qg"));
document.getElementById("shuffle").addEventListener("click", () => load(MEMES[Math.floor(Math.random() * MEMES.length)]));

function buildGallery() {
  gallery.innerHTML = "";
  MEMES.forEach((meme, index) => {
    if (filter.value !== "all" && (meme.layout ?? "classic") !== filter.value) return;
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
      load(meme);
      document.getElementById("generateur").scrollIntoView({ behavior: "smooth" });
    });
    actions.append(save, edit);
    card.append(media, actions);
    gallery.append(card);
    renderMeme(canvas, { head: heads[meme.head % heads.length], head2: heads[(meme.head2 ?? meme.head + 1) % heads.length], bg: meme.bg, top: meme.top, bottom: meme.bottom, layout: meme.layout ?? "classic" });
  });
}

filter.addEventListener("change", buildGallery);
buildGallery();
load(MEMES[0]);
