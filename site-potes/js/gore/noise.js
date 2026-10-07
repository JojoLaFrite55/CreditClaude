function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const smooth = (t) => t * t * (3 - 2 * t);

export function valueNoise(x, y, seed = 1) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

export function fbm(x, y, octaves = 4, seed = 1) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 17) * amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum;
}

export function rand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function makeFloor(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  const image = g.createImageData(width, height);
  const data = image.data;
  const slab = 150;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sx = Math.floor(x / slab);
      const sy = Math.floor(y / (slab * 0.7));
      const id = hash(sx, sy, 5);
      const n = fbm(x / 38, y / 38, 5, 11);
      const grain = fbm(x / 4, y / 4, 2, 29);
      const edgeX = Math.min(x % slab, slab - (x % slab));
      const edgeY = Math.min(y % (slab * 0.7), slab * 0.7 - (y % (slab * 0.7)));
      const edge = Math.min(edgeX, edgeY);
      const crack = edge < 2.5 ? 0.15 : edge < 6 ? 0.55 + edge * 0.07 : 1;
      let v = (0.2 + n * 0.5 + (id - 0.5) * 0.14) * crack * (0.82 + grain * 0.3);
      const stain = fbm(x / 120 + 9, y / 120, 3, 77);
      v *= 0.65 + stain * 0.7;
      const i = (y * width + x) * 4;
      data[i] = Math.min(255, v * 118);
      data[i + 1] = Math.min(255, v * 104);
      data[i + 2] = Math.min(255, v * 96);
      data[i + 3] = 255;
    }
  }
  g.putImageData(image, 0, 0);
  return canvas;
}

export function makeWall(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  const image = g.createImageData(width, height);
  const data = image.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = fbm(x / 60, y / 60, 5, 41);
      const fine = fbm(x / 5, y / 5, 2, 43);
      const streak = fbm(x / 14, y / 260, 3, 47);
      const damp = Math.max(0, 1 - y / height) * 0.35 + streak * 0.3;
      const brickRow = Math.floor(y / 46);
      const offset = brickRow % 2 ? 40 : 0;
      const mortarX = Math.min((x + offset) % 80, 80 - ((x + offset) % 80));
      const mortarY = Math.min(y % 46, 46 - (y % 46));
      const mortar = mortarX < 2.2 || mortarY < 2.2 ? 0.45 : 1;
      let v = (0.16 + n * 0.45) * mortar * (0.8 + fine * 0.35) * (1 - damp * 0.55);
      const i = (y * width + x) * 4;
      data[i] = Math.min(255, v * 130);
      data[i + 1] = Math.min(255, v * 108);
      data[i + 2] = Math.min(255, v * 98);
      data[i + 3] = 255;
    }
  }
  g.putImageData(image, 0, 0);
  return canvas;
}
