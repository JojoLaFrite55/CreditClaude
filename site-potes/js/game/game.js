import "../layout.js";
import { loadHeads, loadPolice } from "../faces.js";
import { createAudio } from "./audio.js";
import { Effects } from "./effects.js";
import { Enemy } from "./enemy.js";
import { PLAYER, Player } from "./player.js";
import { BORDER_Y, H, TOWERS, W, createBackground } from "./scene.js";
import { musicLevel, waveConfig } from "./waves.js";

const $ = (id) => document.getElementById(id);
const canvas = $("game-canvas");
const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
canvas.width = W * scale;
canvas.height = H * scale;
const g = canvas.getContext("2d");

const [heads, cop] = await Promise.all([loadHeads(), loadPolice()]);
const audio = createAudio();
const background = createBackground(scale);
const effects = new Effects(scale);
const player = new Player(cop);

const BEST_KEY = "qg-jules-best";
const NOTES = {
  2: "Gilets pare-balles en approche",
  3: "Éclaireurs rapides repérés",
  6: "Gilets renforcés",
  11: "Blindage lourd",
};

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const game = {
  state: "menu",
  time: 0,
  score: 0,
  kills: 0,
  wave: 0,
  combo: 0,
  comboTimer: 0,
  enemies: [],
  bullets: [],
  toSpawn: 0,
  spawnTimer: 0,
  cfg: waveConfig(1),
  breakTimer: 0,
  banner: 0,
  note: "",
  shake: 0,
  flashRed: 0,
  danger: 0,
  dangerTimer: 0,
  breachTimer: 0,
  best: readBest(),
};

const input = { left: false, right: false, fire: false };

const hud = {
  score: $("hud-score"),
  kills: $("hud-kills"),
  wave: $("hud-wave"),
  best: $("hud-best"),
};

const panels = { menu: $("ui-menu"), pause: $("ui-pause"), over: $("ui-over") };

function showPanel(name) {
  for (const [key, element] of Object.entries(panels)) element.classList.toggle("hidden", key !== name);
}

function updateHud() {
  hud.score.textContent = String(game.score).padStart(6, "0");
  hud.kills.textContent = String(game.kills);
  hud.wave.textContent = String(Math.max(1, game.wave));
  hud.best.textContent = String(game.best).padStart(6, "0");
}

function updateSoundLabels() {
  const label = audio.isMuted() ? "Son : coupé" : "Son : activé";
  document.querySelectorAll(".js-sound").forEach((button) => {
    button.textContent = label;
    button.setAttribute("aria-pressed", String(!audio.isMuted()));
  });
}

function resetGame() {
  Object.assign(game, {
    time: 0,
    score: 0,
    kills: 0,
    wave: 0,
    combo: 0,
    comboTimer: 0,
    enemies: [],
    bullets: [],
    toSpawn: 0,
    spawnTimer: 0,
    breakTimer: 0,
    banner: 0,
    shake: 0,
    flashRed: 0,
    danger: 0,
    breachTimer: 0,
  });
  player.reset();
  effects.reset();
  startWave();
  updateHud();
}

function startWave() {
  game.wave += 1;
  game.cfg = waveConfig(game.wave);
  game.toSpawn = game.cfg.count;
  game.spawnTimer = 1;
  game.banner = 2.4;
  game.note = NOTES[game.wave] ?? "";
  audio.wave();
  audio.setLevel(musicLevel(game.wave));
  updateHud();
}

function play() {
  audio.init();
  audio.click();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  resetGame();
  game.state = "playing";
  showPanel(null);
  audio.startMusic(musicLevel(game.wave));
  updateSoundLabels();
}

function pause() {
  if (game.state !== "playing") return;
  game.state = "paused";
  input.left = input.right = input.fire = false;
  audio.stopMusic();
  audio.click();
  showPanel("pause");
}

function resume() {
  if (game.state !== "paused") return;
  game.state = "playing";
  audio.click();
  audio.startMusic(musicLevel(game.wave));
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  showPanel(null);
}

function toMenu() {
  game.state = "menu";
  audio.stopMusic();
  audio.click();
  game.enemies = [];
  game.bullets = [];
  showPanel("menu");
}

function spawn() {
  const { cfg } = game;
  const roll = Math.random();
  let type = "normal";
  if (roll < cfg.runnerChance) type = "runner";
  else if (roll < cfg.runnerChance + cfg.vestChance) type = "vest";
  let x = 0;
  for (let i = 0; i < 8; i++) {
    x = 50 + Math.random() * (W - 100);
    if (!game.enemies.some((enemy) => enemy.y < 70 && Math.abs(enemy.baseX - x) < 72)) break;
  }
  const hp = type === "vest" ? cfg.vestHp : 1;
  const speed = cfg.speed * (0.88 + Math.random() * 0.24);
  const head = heads[Math.floor(Math.random() * heads.length)];
  game.enemies.push(new Enemy(type, head, x, speed, hp, Math.random));
}

function shoot() {
  const m = player.muzzle;
  game.bullets.push({ x: m.x, y: m.y, prev: m.y, vy: -950 });
  player.cool = PLAYER.cooldown;
  player.flash = 0.06;
  player.recoil = 1;
  audio.shoot();
}

function killEnemy(enemy) {
  game.comboTimer = 1.6;
  game.combo += 1;
  const mult = Math.min(5, 1 + Math.floor(game.combo / 3));
  const gained = enemy.points * mult;
  game.score += gained;
  game.kills += 1;
  const cy = enemy.y - enemy.height * 0.6;
  effects.blood(enemy.x, cy, enemy.type === "vest" ? 46 : 34, enemy.type === "vest" ? 1.25 : 1);
  effects.flyingHead(enemy.head, enemy.x, enemy.y - enemy.height + enemy.headH / 2, enemy.headH);
  effects.text(enemy.x, cy - 10, `+${gained}`, mult > 1 ? "#ffd54a" : "#ffffff", 20 + mult * 2);
  if (mult > 1 && game.combo % 3 === 0) effects.text(enemy.x, cy - 36, `COMBO x${mult}`, "#ff6b6b", 18);
  audio.kill(game.combo);
  game.shake = Math.max(game.shake, enemy.type === "vest" ? 7 : 5);
  game.enemies.splice(game.enemies.indexOf(enemy), 1);
  updateHud();
}

function hitEnemy(enemy, bullet) {
  enemy.hp -= 1;
  enemy.flash = 0.09;
  if (enemy.hp <= 0) {
    killEnemy(enemy);
    return;
  }
  effects.sparks(bullet.x, Math.min(enemy.y - enemy.height * 0.35, bullet.y + 6));
  effects.blood(bullet.x, bullet.y, 4, 0.4);
  audio.hit();
  game.shake = Math.max(game.shake, 2.5);
}

function breach(enemy) {
  game.state = "breach";
  game.breachTimer = 1.5;
  game.flashRed = 1;
  game.shake = 14;
  audio.stopMusic();
  audio.breach();
  effects.text(enemy.x, BORDER_Y - 20, "BRÈCHE !", "#ff4d4d", 34);
  input.left = input.right = input.fire = false;
}

function finish() {
  game.state = "over";
  const record = game.score > game.best;
  if (record) {
    game.best = game.score;
    try {
      localStorage.setItem(BEST_KEY, String(game.best));
    } catch {
      game.best = game.score;
    }
  }
  $("over-score").textContent = String(game.score);
  $("over-kills").textContent = String(game.kills);
  $("over-wave").textContent = String(game.wave);
  $("over-record").classList.toggle("hidden", !record);
  updateHud();
  audio.over();
  showPanel("over");
}

function update(dt) {
  game.time += dt;
  effects.update(dt);
  if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 28);
  if (game.flashRed > 0) game.flashRed = Math.max(0, game.flashRed - dt * 0.9);
  if (game.banner > 0) game.banner -= dt;

  if (game.state === "breach") {
    game.breachTimer -= dt;
    if (game.breachTimer <= 0) finish();
    return;
  }
  if (game.state !== "playing") return;

  player.update(dt, (input.right ? 1 : 0) - (input.left ? 1 : 0));
  if (input.fire && player.cool <= 0) shoot();

  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 0;
  }

  if (game.breakTimer > 0) {
    game.breakTimer -= dt;
    if (game.breakTimer <= 0) startWave();
  } else {
    if (game.toSpawn > 0) {
      game.spawnTimer -= dt;
      if (game.spawnTimer <= 0) {
        spawn();
        game.toSpawn -= 1;
        game.spawnTimer = game.cfg.gap * (0.8 + Math.random() * 0.4);
      }
    } else if (game.enemies.length === 0) {
      const bonus = 100 * game.wave;
      game.score += bonus;
      effects.text(W / 2, 250, `VAGUE ${game.wave} TERMINÉE  +${bonus}`, "#7dffb0", 26);
      audio.clear();
      game.breakTimer = 2.6;
      updateHud();
    }
  }

  for (const enemy of game.enemies) enemy.update(dt, game.time);

  for (let i = game.bullets.length - 1; i >= 0; i--) {
    const bullet = game.bullets[i];
    bullet.prev = bullet.y;
    bullet.y += bullet.vy * dt;
    if (bullet.y < -30) {
      game.bullets.splice(i, 1);
      continue;
    }
    let target = null;
    for (const enemy of game.enemies) {
      if (Math.abs(bullet.x - enemy.x) > enemy.halfW) continue;
      if (bullet.y <= enemy.y && bullet.prev >= enemy.y - enemy.height) {
        if (!target || enemy.y > target.y) target = enemy;
      }
    }
    if (target) {
      game.bullets.splice(i, 1);
      hitEnemy(target, bullet);
    }
  }

  let danger = 0;
  for (const enemy of game.enemies) {
    if (enemy.y >= BORDER_Y) {
      breach(enemy);
      return;
    }
    danger = Math.max(danger, Math.min(1, Math.max(0, (enemy.y - (BORDER_Y - 130)) / 130)));
  }
  game.danger = danger;
  if (danger > 0.15) {
    game.dangerTimer -= dt;
    if (game.dangerTimer <= 0) {
      audio.danger();
      game.dangerTimer = 0.42 - danger * 0.25;
    }
  }
}

function searchlights() {
  g.save();
  g.globalCompositeOperation = "lighter";
  TOWERS.forEach((tower, index) => {
    const angle = -Math.PI / 2 + Math.sin(game.time * 0.55 + index * 2.4) * 0.75;
    const grad = g.createRadialGradient(tower.x, tower.y, 0, tower.x, tower.y, 520);
    grad.addColorStop(0, "rgba(255, 246, 205, 0.22)");
    grad.addColorStop(1, "rgba(255, 246, 205, 0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(tower.x, tower.y);
    g.arc(tower.x, tower.y, 520, angle - 0.11, angle + 0.11);
    g.closePath();
    g.fill();
  });
  g.restore();
}

function overlays() {
  if (game.danger > 0) {
    const pulse = 0.5 + 0.5 * Math.sin(game.time * 12);
    const grad = g.createLinearGradient(0, BORDER_Y - 160, 0, BORDER_Y + 10);
    grad.addColorStop(0, "rgba(255, 30, 30, 0)");
    grad.addColorStop(1, `rgba(255, 30, 30, ${game.danger * (0.18 + pulse * 0.18)})`);
    g.fillStyle = grad;
    g.fillRect(0, BORDER_Y - 160, W, 170);
  }
  if (game.flashRed > 0) {
    g.fillStyle = `rgba(255, 20, 20, ${game.flashRed * 0.45})`;
    g.fillRect(0, 0, W, H);
  }
  if (game.banner > 0 && game.state === "playing") {
    const t = game.banner;
    const alpha = Math.min(1, t / 0.5, (2.4 - t) / 0.3);
    g.save();
    g.globalAlpha = Math.max(0, alpha);
    g.textAlign = "center";
    g.font = '800 64px "Inter", system-ui, sans-serif';
    g.lineWidth = 8;
    g.strokeStyle = "rgba(0,0,0,0.7)";
    g.strokeText(`VAGUE ${game.wave}`, W / 2, 170);
    g.fillStyle = "#ffffff";
    g.fillText(`VAGUE ${game.wave}`, W / 2, 170);
    if (game.note) {
      g.font = '600 22px "Inter", system-ui, sans-serif';
      g.lineWidth = 5;
      g.strokeText(game.note, W / 2, 206);
      g.fillStyle = "#ffd54a";
      g.fillText(game.note, W / 2, 206);
    }
    g.restore();
  }
}

function draw() {
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.save();
  if (game.shake > 0) g.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  g.drawImage(background, 0, 0, W, H);
  effects.drawSplat(g);
  searchlights();
  const sorted = [...game.enemies].sort((a, b) => a.y - b.y);
  for (const enemy of sorted) enemy.draw(g);
  g.lineCap = "round";
  for (const bullet of game.bullets) {
    const grad = g.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + 34);
    grad.addColorStop(0, "rgba(255, 244, 170, 1)");
    grad.addColorStop(1, "rgba(255, 170, 40, 0)");
    g.strokeStyle = grad;
    g.lineWidth = 3.5;
    g.beginPath();
    g.moveTo(bullet.x, bullet.y);
    g.lineTo(bullet.x, bullet.y + 34);
    g.stroke();
  }
  effects.drawParticles(g);
  player.draw(g);
  effects.drawTexts(g);
  overlays();
  g.restore();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game.state !== "paused") update(dt);
  else game.time += 0;
  draw();
  requestAnimationFrame(frame);
}

const KEYS = {
  left: ["arrowleft", "q", "a"],
  right: ["arrowright", "d"],
};

addEventListener("keydown", (event) => {
  if (event.repeat && event.key !== " ") return;
  const key = event.key.toLowerCase();
  if (KEYS.left.includes(key)) input.left = true;
  else if (KEYS.right.includes(key)) input.right = true;
  else if (key === " " || key === "spacebar") input.fire = true;
  else if (key === "escape" || key === "p") {
    if (game.state === "playing") pause();
    else if (game.state === "paused") resume();
  } else if (key === "m") {
    audio.init();
    audio.toggleMute();
    updateSoundLabels();
  }
  if ([" ", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key) && (game.state === "playing" || game.state === "breach")) {
    event.preventDefault();
  }
});

addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (KEYS.left.includes(key)) input.left = false;
  else if (KEYS.right.includes(key)) input.right = false;
  else if (key === " " || key === "spacebar") input.fire = false;
});

addEventListener("blur", () => {
  input.left = input.right = input.fire = false;
  pause();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});

const hold = (id, key) => {
  const element = $(id);
  const on = (event) => {
    event.preventDefault();
    input[key] = true;
  };
  const off = (event) => {
    event.preventDefault();
    input[key] = false;
  };
  element.addEventListener("pointerdown", on);
  element.addEventListener("pointerup", off);
  element.addEventListener("pointercancel", off);
  element.addEventListener("pointerleave", off);
};

hold("t-left", "left");
hold("t-right", "right");
hold("t-fire", "fire");

$("btn-play").addEventListener("click", play);
$("btn-again").addEventListener("click", play);
$("btn-restart").addEventListener("click", play);
$("btn-resume").addEventListener("click", resume);
$("btn-pause").addEventListener("click", () => (game.state === "paused" ? resume() : pause()));
$("btn-menu").addEventListener("click", toMenu);
$("btn-menu-over").addEventListener("click", toMenu);
document.querySelectorAll(".js-sound").forEach((button) =>
  button.addEventListener("click", () => {
    audio.init();
    audio.toggleMute();
    audio.click();
    updateSoundLabels();
  }),
);

window.__jeu = {
  get state() {
    return game.state;
  },
  get enemies() {
    return game.enemies;
  },
  get wave() {
    return game.wave;
  },
  get kills() {
    return game.kills;
  },
  player,
};

updateHud();
updateSoundLabels();
showPanel("menu");
requestAnimationFrame(frame);
