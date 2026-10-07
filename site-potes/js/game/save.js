import { ORDER } from "./weapons.js";

const KEY = "qg-jules-save";

const fresh = () => ({ money: 0, owned: ["pistol"], weapon: "pistol", turrets: 0 });

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
