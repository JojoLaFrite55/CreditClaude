import { MINE_KEYS, MINE_UPGRADES, ORDER } from "./weapons.js";

const KEY = "qg-jules-save";

const freshMines = () => Object.fromEntries(MINE_KEYS.map((key) => [key, 0]));

const fresh = () => ({ money: 0, owned: ["pistol"], weapon: "pistol", turrets: 0, mines: freshMines() });

const readMines = (raw) => {
  const mines = freshMines();
  if (raw && typeof raw === "object") {
    for (const key of MINE_KEYS) {
      const max = MINE_UPGRADES[key].values.length - 1;
      mines[key] = Math.min(max, Math.max(0, Math.floor(Number(raw[key]) || 0)));
    }
  }
  return mines;
};

export function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!raw || typeof raw !== "object") return fresh();
    const owned = Array.isArray(raw.owned) ? raw.owned.filter((id) => ORDER.includes(id)) : [];
    if (!owned.includes("pistol")) owned.unshift("pistol");
    return {
      money: Math.max(0, Number(raw.money) || 0),
      owned,
      weapon: owned.includes(raw.weapon) ? raw.weapon : "pistol",
      turrets: Math.min(3, Math.max(0, Number(raw.turrets) || 0)),
      mines: readMines(raw.mines),
    };
  } catch {
    return fresh();
  }
}

export function persist(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    return;
  }
}
