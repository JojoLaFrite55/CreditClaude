import "../arcade/kit.js";
import { DIFFS, SONGS, loadCharts, readBest } from "../rhythm/songs.js";
import { createRhythm } from "../rhythm/engine.js";

const charts = await loadCharts();
const menu = document.getElementById("menu");
const stage = document.getElementById("stage");
const head = document.getElementById("head");
const levelsEl = document.getElementById("levels");
const songsEl = document.getElementById("songs");

let diffKey = "normal";
try {
  const saved = localStorage.getItem("qg-rythme-diff");
  if (DIFFS.some((item) => item.key === saved)) diffKey = saved;
} catch {
  diffKey = "normal";
}
let game = null;

const renderLevels = () => {
  levelsEl.innerHTML = DIFFS.map((item) => `<button type="button" class="${item.key === diffKey ? "on" : ""}" data-diff="${item.key}">${item.label}<small>×${item.mult}</small></button>`).join("");
};

const renderSongs = () => {
  songsEl.innerHTML = SONGS.map((song) => {
    const best = readBest(song.id, diffKey);
    return `<button type="button" class="rhythm-song" data-song="${song.id}" style="--c:${song.color}">
      <span class="rhythm-song-title">${song.title}</span>
      <span class="rhythm-song-sub">${song.sub}</span>
      <span class="rhythm-song-meta">${song.duration} · ${charts[song.id][diffKey].length} notes · ${best ? `Record ${best}` : "Pas encore joué"}</span>
    </button>`;
  }).join("");
};

const leave = () => {
  game?.destroy();
  game = null;
  stage.hidden = true;
  menu.hidden = false;
  head.hidden = false;
  renderSongs();
};

levelsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-diff]");
  if (!button) return;
  diffKey = button.dataset.diff;
  try {
    localStorage.setItem("qg-rythme-diff", diffKey);
  } catch {
    diffKey = button.dataset.diff;
  }
  renderLevels();
  renderSongs();
});

songsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-song]");
  if (!button) return;
  const song = SONGS.find((item) => item.id === button.dataset.song);
  menu.hidden = true;
  head.hidden = true;
  stage.hidden = false;
  game = createRhythm(stage, { song, charts: charts[song.id], diffKey, onExit: leave });
  stage.scrollIntoView({ block: "start" });
});

renderLevels();
renderSongs();
