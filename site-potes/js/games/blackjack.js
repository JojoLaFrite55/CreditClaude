import { createSfx, drawFace, getBest, loadHeads, mountSoundButton, pick, setBest, shuffle } from "../arcade/kit.js";

const sfx = createSfx();
mountSoundButton(document.getElementById("sound"), sfx);
const heads = await loadHeads();
const dealerEl = document.getElementById("dealer");
const playerEl = document.getElementById("player");
const dealerTotal = document.getElementById("dealer-total");
const playerTotal = document.getElementById("player-total");
const statusEl = document.getElementById("status");
const creditsEl = document.getElementById("credits");
const betEl = document.getElementById("bet");
const bestEl = document.getElementById("best");
const dealBtn = document.getElementById("deal");
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const doubleBtn = document.getElementById("double");
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const BETS = [10, 25, 50, 100];
const state = { deck: [], dealer: [], player: [], credits: 200, bet: 10, phase: "bet", best: Math.max(200, getBest("blackjack")), pot: 0, face: { dealer: pick(heads), player: pick(heads) } };
creditsEl.textContent = state.credits;
bestEl.textContent = state.best;
betEl.textContent = state.bet;

function newDeck() {
  const deck = [];
  for (let d = 0; d < 4; d++) for (const s of SUITS) for (const r of RANKS) deck.push({ s, r });
  return shuffle(deck);
}

const value = (card) => (card.r === "A" ? 11 : ["J", "Q", "K"].includes(card.r) ? 10 : Number(card.r));
function total(hand) {
  let sum = hand.reduce((a, c) => a + value(c), 0);
  let aces = hand.filter((c) => c.r === "A").length;
  while (sum > 21 && aces) {
    sum -= 10;
    aces -= 1;
  }
  return sum;
}
const isBlackjack = (hand) => hand.length === 2 && total(hand) === 21;

function cardNode(card, hidden = false) {
  const node = document.createElement("div");
  node.className = "bj-card" + (hidden ? " back" : "") + (["♥", "♦"].includes(card.s) ? " red" : "");
  if (!hidden) node.innerHTML = `<b>${card.r}</b><i>${card.s}</i><b class="b">${card.r}</b>`;
  return node;
}

function renderHands(revealDealer) {
  dealerEl.innerHTML = "";
  playerEl.innerHTML = "";
  state.dealer.forEach((card, i) => dealerEl.append(cardNode(card, i === 1 && !revealDealer)));
  state.player.forEach((card) => playerEl.append(cardNode(card)));
  dealerTotal.textContent = state.dealer.length ? (revealDealer ? total(state.dealer) : value(state.dealer[0])) : "";
  playerTotal.textContent = state.player.length ? total(state.player) : "";
}

function setCredits(value2) {
  state.credits = value2;
  creditsEl.textContent = value2;
  if (value2 > state.best) {
    state.best = value2;
    setBest("blackjack", value2);
    bestEl.textContent = value2;
  }
}

function setButtons() {
  const playing = state.phase === "play";
  hitBtn.disabled = !playing;
  standBtn.disabled = !playing;
  doubleBtn.disabled = !(playing && state.player.length === 2 && state.credits >= state.pot);
  dealBtn.disabled = playing;
  dealBtn.textContent = state.credits < BETS[0] && state.phase === "bet" ? "Repartir à 200" : "Distribuer";
  document.getElementById("minus").disabled = playing;
  document.getElementById("plus").disabled = playing;
}

function draw(hand) {
  if (state.deck.length < 20) state.deck = newDeck();
  hand.push(state.deck.pop());
  sfx.tone("triangle", 700, 500, 0.05, 0.08);
}

function deal() {
  sfx.init();
  if (state.credits < BETS[0]) {
    setCredits(200);
    state.bet = 10;
    betEl.textContent = 10;
    statusEl.textContent = "Nouvelle partie : 200 jetons.";
    state.dealer = [];
    state.player = [];
    renderHands(true);
    setButtons();
    return;
  }
  if (state.bet > state.credits) {
    state.bet = BETS.filter((b) => b <= state.credits).pop();
    betEl.textContent = state.bet;
  }
  state.pot = state.bet;
  setCredits(state.credits - state.bet);
  state.dealer = [];
  state.player = [];
  state.face = { dealer: pick(heads), player: pick(heads) };
  draw(state.player);
  draw(state.dealer);
  draw(state.player);
  draw(state.dealer);
  state.phase = "play";
  statusEl.textContent = "Tire une carte ou reste.";
  renderHands(false);
  if (isBlackjack(state.player) || isBlackjack(state.dealer)) return settle();
  setButtons();
}

function dealerPlay() {
  renderHands(true);
  const step = () => {
    if (total(state.dealer) < 17) {
      draw(state.dealer);
      renderHands(true);
      setTimeout(step, 600);
    } else settle();
  };
  setTimeout(step, 600);
}

function settle() {
  state.phase = "bet";
  renderHands(true);
  const p = total(state.player);
  const d = total(state.dealer);
  let text;
  if (isBlackjack(state.player) && !isBlackjack(state.dealer)) {
    setCredits(state.credits + Math.floor(state.pot * 2.5));
    text = `Blackjack ! +${Math.floor(state.pot * 1.5)}`;
    sfx.win();
  } else if (p > 21) {
    text = "Tu as dépassé 21.";
    sfx.lose();
  } else if (d > 21 || p > d) {
    setCredits(state.credits + state.pot * 2);
    text = `Gagné ! +${state.pot}`;
    sfx.win();
  } else if (p === d) {
    setCredits(state.credits + state.pot);
    text = "Égalité, mise rendue.";
  } else {
    text = "La banque gagne.";
    sfx.lose();
  }
  statusEl.textContent = state.credits < BETS[0] ? `${text} Plus de jetons.` : text;
  setButtons();
}

hitBtn.addEventListener("click", () => {
  draw(state.player);
  renderHands(false);
  if (total(state.player) > 21) settle();
  else setButtons();
});
standBtn.addEventListener("click", () => {
  state.phase = "dealer";
  setButtons();
  dealerPlay();
});
doubleBtn.addEventListener("click", () => {
  setCredits(state.credits - state.pot);
  state.pot *= 2;
  draw(state.player);
  renderHands(false);
  if (total(state.player) > 21) return settle();
  state.phase = "dealer";
  setButtons();
  dealerPlay();
});
dealBtn.addEventListener("click", deal);
document.getElementById("plus").addEventListener("click", () => {
  state.bet = BETS[Math.min(BETS.length - 1, BETS.indexOf(state.bet) + 1)];
  betEl.textContent = state.bet;
  sfx.click();
});
document.getElementById("minus").addEventListener("click", () => {
  state.bet = BETS[Math.max(0, BETS.indexOf(state.bet) - 1)];
  betEl.textContent = state.bet;
  sfx.click();
});

function faceImg(head) {
  const c = document.createElement("canvas");
  c.width = 120;
  c.height = 120;
  const cx = c.getContext("2d");
  const k = Math.min(110 / head.width, 110 / head.height);
  cx.drawImage(head, (120 - head.width * k) / 2, (120 - head.height * k) / 2, head.width * k, head.height * k);
  return c;
}
void drawFace;
state.deck = newDeck();
const dealerFace = document.getElementById("dealer-face");
const playerFace = document.getElementById("player-face");
dealerFace.append(faceImg(pick(heads)));
playerFace.append(faceImg(pick(heads)));
setButtons();
