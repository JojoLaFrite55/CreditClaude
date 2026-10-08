function loadCss() {
  if (document.querySelector("link[data-s67]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/soixantesept.css", import.meta.url).href;
  link.dataset.s67 = "1";
  document.head.append(link);
}

function openVideo(name, label) {
  if (document.querySelector(".s67")) return;
  loadCss();
  const mp4 = new URL(`../assets/secret/${name}.mp4`, import.meta.url).href;
  const webm = new URL(`../assets/secret/${name}.webm`, import.meta.url).href;
  const modal = document.createElement("div");
  modal.className = "s67";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", label);
  modal.innerHTML = `<div class="s67-box"><video controls playsinline autoplay loop><source src="${mp4}" type="video/mp4"><source src="${webm}" type="video/webm"></video><button class="s67-close" type="button" aria-label="Fermer">✕</button></div>`;
  document.body.append(modal);
  document.body.style.overflow = "hidden";
  const video = modal.querySelector("video");
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(() => {});
  });
  const close = () => {
    video.pause();
    modal.remove();
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);
  modal.querySelector(".s67-close").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
}

export const open67 = () => openVideo("67", "67");
export const openWolf = () => openVideo("loup", "Loup sigma");
