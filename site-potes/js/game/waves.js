export const BOSS_EVERY = 5;

export function waveConfig(wave) {
  return {
    count: Math.round(7 + 3.2 * (wave - 1)),
    gap: Math.max(0.45, 1.3 - 0.07 * (wave - 1)),
    speed: Math.min(28 + 4.2 * (wave - 1), 88),
    vestChance: wave < 2 ? 0 : Math.min(0.45, 0.1 + 0.05 * (wave - 2)),
    runnerChance: wave < 3 ? 0 : Math.min(0.26, 0.06 + 0.04 * (wave - 3)),
    vestHp: wave < 6 ? 3 : wave < 11 ? 4 : 5,
  };
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
