import "./layout.js";
import { MEMES } from "./data.js";
import { loadHeads } from "./faces.js";
import { renderMeme } from "./meme-core.js";

const heads = await loadHeads();

const collage = document.getElementById("collage");
heads.slice(0, 4).forEach((head) => {
  const figure = document.createElement("figure");
  const element = document.createElement(head instanceof HTMLCanvasElement ? "canvas" : "img");
  if (head instanceof HTMLCanvasElement) {
    element.width = head.width;
    element.height = head.height;
    element.getContext("2d").drawImage(head, 0, 0);
  } else {
    element.src = head.src;
    element.alt = "";
  }
  figure.append(element);
  collage.append(figure);
});

const memeCover = document.getElementById("meme-cover");
renderMeme(memeCover, { head: heads[2 % heads.length], bg: MEMES[2].bg, top: MEMES[2].top, bottom: MEMES[2].bottom });

const featured = document.getElementById("featured");
MEMES.slice(0, 4).forEach((meme, index) => {
  const link = document.createElement("a");
  link.className = "card";
  link.href = "memes.html";
  const media = document.createElement("div");
  media.className = "media square";
  const canvas = document.createElement("canvas");
  media.append(canvas);
  const title = document.createElement("h3");
  title.textContent = `Meme #${index + 1}`;
  const text = document.createElement("p");
  text.className = "muted";
  text.textContent = `${meme.top} ${meme.bottom}`;
  link.append(media, title, text);
  featured.append(link);
  renderMeme(canvas, { head: heads[meme.head % heads.length], bg: meme.bg, top: meme.top, bottom: meme.bottom });
});
