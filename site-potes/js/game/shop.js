import { MINE_KEYS, MINE_UPGRADES, ORDER, TURRETS, WEAPONS } from "./weapons.js";

const fmt = (value) => value.toLocaleString("fr-FR");

export function createShop(root, save, actions) {
  const wallet = root.querySelector("[data-wallet]");
  const list = root.querySelector("[data-list]");
  const tabs = [...root.querySelectorAll("[data-tab]")];
  let tab = "weapons";

  const weaponCard = (id) => {
    const w = WEAPONS[id];
    const owned = save.owned.includes(id);
    const equipped = save.weapon === id;
    const affordable = save.money >= w.price;
    const shots = (1 / w.cooldown).toFixed(1).replace(".", ",");
    const damage = w.pellets > 1 ? `${w.damage} × ${w.pellets}` : String(w.damage);
    let button = `<button class="btn btn-small" data-buy="${id}"${affordable ? "" : " disabled"}>Acheter · ${fmt(w.price)} $</button>`;
    if (owned) button = `<button class="btn btn-small btn-secondary" data-equip="${id}">Équiper</button>`;
    if (equipped) button = `<button class="btn btn-small" disabled>Équipée</button>`;
    return `
      <li class="item${equipped ? " is-active" : ""}">
        <div class="item-main">
          <h3>${w.name}</h3>
          <p>${w.desc}</p>
          <div class="chips"><span>Dégâts ${damage}</span><span>${shots} tirs/s</span>${w.pierce ? "<span>Transperce</span>" : ""}</div>
        </div>
        <div class="item-action">${button}</div>
      </li>`;
  };

  const turretCard = (turret, index) => {
    const owned = save.turrets > index;
    const next = save.turrets === index;
    const affordable = save.money >= turret.price;
    let button = `<button class="btn btn-small" disabled>Verrouillée</button>`;
    if (owned) button = `<button class="btn btn-small" disabled>Active</button>`;
    else if (next) button = `<button class="btn btn-small" data-turret="${index}"${affordable ? "" : " disabled"}>Acheter · ${fmt(turret.price)} $</button>`;
    return `
      <li class="item${owned ? " is-active" : ""}">
        <div class="item-main">
          <h3>${turret.name}</h3>
          <p>${turret.desc}</p>
          <div class="chips"><span>Tir automatique</span><span>Vise l'intrus le plus proche</span></div>
        </div>
        <div class="item-action">${button}</div>
      </li>`;
  };

  const mineCard = (key) => {
    const upgrade = MINE_UPGRADES[key];
    const level = save.mines[key];
    const max = upgrade.values.length - 1;
    const maxed = level >= max;
    const price = upgrade.prices[level];
    const locked = key !== "count" && save.mines.count === 0;
    const pips = Array.from({ length: max }, (_, index) => `<i class="${index < level ? "on" : ""}"></i>`).join("");
    const current = upgrade.format(upgrade.values[level]);
    const next = maxed ? "" : ` → ${upgrade.format(upgrade.values[level + 1])}`;
    let button = `<button class="btn btn-small" data-mine="${key}"${save.money >= price ? "" : " disabled"}>Améliorer · ${fmt(price ?? 0)} $</button>`;
    if (maxed) button = `<button class="btn btn-small" disabled>Niveau max</button>`;
    else if (locked) button = `<button class="btn btn-small" disabled>Achète des mines d'abord</button>`;
    return `
      <li class="item${level > 0 ? " is-active" : ""}">
        <div class="item-main">
          <h3>${upgrade.name}</h3>
          <p>${upgrade.desc}</p>
          <div class="pips">${pips}</div>
          <div class="chips"><span>${current}${next}</span></div>
        </div>
        <div class="item-action">${button}</div>
      </li>`;
  };

  const render = () => {
    wallet.textContent = `${fmt(save.money)} $`;
    tabs.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.tab === tab)));
    const scroll = list.scrollTop;
    if (tab === "weapons") list.innerHTML = ORDER.map(weaponCard).join("");
    else if (tab === "turrets") list.innerHTML = TURRETS.map(turretCard).join("");
    else list.innerHTML = MINE_KEYS.map(mineCard).join("");
    list.scrollTop = scroll;
  };

  tabs.forEach((button) =>
    button.addEventListener("click", () => {
      tab = button.dataset.tab;
      actions.click();
      render();
    }),
  );

  list.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("button") : null;
    if (!target || target.disabled) return;
    if (target.dataset.buy) actions.buyWeapon(target.dataset.buy);
    else if (target.dataset.equip) actions.equip(target.dataset.equip);
    else if (target.dataset.turret !== undefined) actions.buyTurret(Number(target.dataset.turret));
    else if (target.dataset.mine) actions.upgradeMine(target.dataset.mine);
    render();
  });

  return { render };
}
