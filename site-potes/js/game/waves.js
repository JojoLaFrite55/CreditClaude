export const BOSS_EVERY = 5;

export function waveConfig(wave) {
  return {
    count: Math.round((7 + 3.2 * (wave - 1)) * 1.1),
    gap: Math.max(0.45, 1.3 - 0.07 * (wave - 1)),
    speed: Math.min(28 + 4.2 * (wave - 1), 88),
    vestChance: wave < 2 ? 0 : Math.min(0.45, 0.1 + 0.05 * (wave - 2)),
    runnerChance: wave < 3 ? 0 : Math.min(0.26, 0.06 + 0.04 * (wave - 3)),
    vestHp: wave < 6 ? 3 : wave < 11 ? 4 : 5,
    jeepChance: wave < 4 ? 0 : Math.min(0.2, 0.07 + 0.02 * (wave - 4)),
    motoChance: wave < 5 ? 0 : Math.min(0.18, 0.07 + 0.02 * (wave - 5)),
    droneChance: wave < 7 ? 0 : Math.min(0.14, 0.05 + 0.015 * (wave - 7)),
    truckChance: wave < 8 ? 0 : Math.min(0.1, 0.04 + 0.01 * (wave - 8)),
    armoredChance: wave < 10 ? 0 : Math.min(0.08, 0.03 + 0.01 * (wave - 10)),
  };
}

export function vehicleStats(type, wave) {
  const stats = {
    moto: { hp: 2, speed: 118, coins: 22, points: 50 },
    jeep: { hp: 6 + Math.floor(wave / 3), speed: 46, coins: 45, points: 90 },
    truck: { hp: 14 + wave, speed: 30, coins: 95, points: 220 },
    armored: { hp: 30 + 2 * wave, speed: 24, coins: 170, points: 400 },
    drone: { hp: wave >= 12 ? 2 : 1, speed: 78, coins: 25, points: 60 },
  };
  return stats[type];
}

export const isBossWave = (wave) => wave % BOSS_EVERY === 0;

export function bossStats(wave) {
  const index = Math.floor(wave / BOSS_EVERY);
  return {
    index,
    hp: Math.round(60 + 40 * (index - 1)),
    speed: 17 + 2 * (index - 1),
    coins: 250 + 150 * (index - 1),
    points: 2000 * index,
  };
}

export function musicLevel(wave) {
  if (isBossWave(wave)) return 3;
  if (wave < 3) return 0;
  if (wave < 6) return 1;
  return 2;
}
