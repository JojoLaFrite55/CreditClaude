import { MICRO_SONG, loadCharts } from "./rhythm/songs.js";
import { createRhythm } from "./rhythm/engine.js";

function loadCss() {
  if (document.querySelector("link[data-mic]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/micro.css", import.meta.url).href;
  link.dataset.mic = "1";
  document.head.append(link);
}

export async function openMicro() {
  if (document.querySelector(".mic")) return;
  loadCss();
  const all = await loadCharts();
  const modal = document.createElement("div");
  modal.className = "mic";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Micro");
  document.body.append(modal);
  document.body.style.overflow = "hidden";
  let game = null;
  const close = () => {
    game?.destroy();
    modal.remove();
    document.body.style.overflow = "";
  };
  game = createRhythm(modal, { song: MICRO_SONG, charts: all.micro, diffKey: "normal", onExit: close, closable: true });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
}
