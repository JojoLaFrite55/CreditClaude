export function openCar() {
  if (document.querySelector(".car-modal")) return;
  const modal = document.createElement("div");
  modal.className = "car-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Vidéo secrète");
  const mp4 = new URL("../assets/secret/trajet.mp4", import.meta.url).href;
  const webm = new URL("../assets/secret/trajet.webm", import.meta.url).href;
  modal.innerHTML = `
    <button class="car-close" type="button" aria-label="Fermer">✕</button>
    <video controls playsinline autoplay loop><source src="${mp4}" type="video/mp4"><source src="${webm}" type="video/webm"></video>`;
  document.body.append(modal);
  document.documentElement.style.overflow = "hidden";
  const video = modal.querySelector("video");
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(() => {});
  });
  const close = () => {
    video.pause();
    modal.remove();
    document.documentElement.style.overflow = "";
    removeEventListener("keydown", onKey);
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  addEventListener("keydown", onKey);
  modal.querySelector(".car-close").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
}
