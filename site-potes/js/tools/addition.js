import "../arcade/kit.js";

const namesEl = document.getElementById("names");
const itemsEl = document.getElementById("items");
const addBtn = document.getElementById("add-item");
const tipEl = document.getElementById("tip");
const modeEl = document.getElementById("mode");
const totalEl = document.getElementById("total");
const resultEl = document.getElementById("result");
const equalWrap = document.getElementById("equal-wrap");
const equalAmount = document.getElementById("equal-amount");
const itemsWrap = document.getElementById("items-wrap");
const copyBtn = document.getElementById("copy");
const KEY = "qg-addition";
const eur = (value) => `${value.toFixed(2).replace(".", ",")} €`;
let items = [];
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved) {
    namesEl.value = saved.names ?? namesEl.value;
    items = saved.items ?? [];
    tipEl.value = saved.tip ?? "0";
    modeEl.value = saved.mode ?? "items";
    equalAmount.value = saved.equal ?? "";
  }
} catch {
  items = [];
}
if (!items.length) items = [{ label: "Pizzas", price: 24, who: null }, { label: "Boissons", price: 18, who: null }];

const people = () => namesEl.value.split("\n").map((n) => n.trim()).filter(Boolean).slice(0, 20);

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ names: namesEl.value, items, tip: tipEl.value, mode: modeEl.value, equal: equalAmount.value }));
  } catch {
    return;
  }
}

function renderItems() {
  const list = people();
  itemsEl.innerHTML = "";
  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "ad-item";
    const who = item.who ?? list.map((_, i) => i);
    row.innerHTML = `<div class="ad-top"><input type="text" value="${item.label.replace(/"/g, "&quot;")}" aria-label="Libellé" data-k="label"><input type="number" min="0" step="0.01" value="${item.price}" aria-label="Prix" data-k="price"><button class="btn btn-small btn-secondary" type="button" data-del aria-label="Supprimer">✕</button></div><div class="ad-who">${list.map((name, i) => `<label><input type="checkbox" data-w="${i}" ${who.includes(i) ? "checked" : ""}> ${name.replace(/</g, "&lt;")}</label>`).join("")}</div>`;
    row.querySelector('[data-k="label"]').addEventListener("input", (event) => {
      item.label = event.target.value;
      compute();
    });
    row.querySelector('[data-k="price"]').addEventListener("input", (event) => {
      item.price = Number(event.target.value) || 0;
      compute();
    });
    row.querySelector("[data-del]").addEventListener("click", () => {
      items.splice(index, 1);
      renderItems();
      compute();
    });
    row.querySelectorAll("[data-w]").forEach((box) =>
      box.addEventListener("change", () => {
        item.who = [...row.querySelectorAll("[data-w]")].filter((b) => b.checked).map((b) => Number(b.dataset.w));
        compute();
      }),
    );
    itemsEl.append(row);
  });
}

function compute() {
  const list = people();
  const tip = Math.max(0, Number(tipEl.value) || 0) / 100;
  const equal = modeEl.value === "equal";
  equalWrap.hidden = !equal;
  itemsWrap.hidden = equal;
  const owed = Array(list.length).fill(0);
  let subtotal = 0;
  if (equal) {
    subtotal = Math.max(0, Number(equalAmount.value) || 0);
    if (list.length) owed.fill(subtotal / list.length);
  } else {
    for (const item of items) {
      const who = (item.who ?? list.map((_, i) => i)).filter((i) => i < list.length);
      subtotal += item.price;
      if (who.length) for (const i of who) owed[i] += item.price / who.length;
    }
  }
  const tipAmount = subtotal * tip;
  const total = subtotal + tipAmount;
  totalEl.textContent = `${eur(subtotal)}${tip ? ` + pourboire ${eur(tipAmount)} = ${eur(total)}` : ""}`;
  const unassigned = !equal ? items.filter((item) => (item.who ?? [1]).filter((i) => i < list.length).length === 0 && item.price > 0).length : 0;
  resultEl.innerHTML = list.length
    ? `<ul class="ad-list">${list.map((name, i) => `<li><span>${name.replace(/</g, "&lt;")}</span><strong>${eur(owed[i] * (1 + tip))}</strong></li>`).join("")}</ul>${unassigned ? `<p class="muted">${unassigned} article(s) sans personne cochée ne sont pas comptés.</p>` : ""}`
    : '<p class="muted">Ajoute au moins un nom.</p>';
  save();
}

namesEl.addEventListener("input", () => {
  renderItems();
  compute();
});
addBtn.addEventListener("click", () => {
  items.push({ label: "Article", price: 0, who: null });
  renderItems();
  compute();
});
for (const el of [tipEl, modeEl, equalAmount]) el.addEventListener("input", compute);
copyBtn.addEventListener("click", async () => {
  const text = [...resultEl.querySelectorAll("li")].map((li) => `${li.children[0].textContent} : ${li.children[1].textContent}`).join("\n");
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copié !";
  } catch {
    copyBtn.textContent = "Impossible de copier";
  }
  setTimeout(() => (copyBtn.textContent = "Copier le détail"), 1400);
});
renderItems();
compute();
