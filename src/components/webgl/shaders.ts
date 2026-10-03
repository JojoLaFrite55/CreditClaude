export const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = `
precision highp float;
uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uAccent;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = r * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  float d = length(p - m);
  float pull = exp(-d * 3.2);
  float t = uTime * 0.045;
  float s = uScroll * 0.00012;

  vec2 warp = p + (p - m) * pull * 0.22;
  vec2 q = vec2(fbm(warp * 1.35 + vec2(t, s)), fbm(warp * 1.35 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(warp * 1.6 + 3.6 * q + vec2(1.7, 9.2) + t * 1.4), fbm(warp * 1.6 + 3.6 * q + vec2(8.3, 2.8) - s));
  float f = fbm(warp * 1.25 + 3.2 * r);

  vec3 base = vec3(0.0196);
  vec3 anthracite = vec3(0.07, 0.072, 0.078);
  vec3 col = mix(base, anthracite, smoothstep(0.25, 0.85, f));
  float vein = smoothstep(0.58, 0.95, f * (0.6 + r.y));
  col = mix(col, uAccent * 0.32, vein * 0.75);
  col += uAccent * 0.07 * pull;

  vec2 cell = vUv * uResolution / 34.0;
  vec2 g = fract(cell) - 0.5;
  float dotMask = smoothstep(0.07, 0.0, length(g));
  float flicker = step(0.82, hash(floor(cell) + floor(uTime * 0.6)));
  col += dotMask * uAccent * (0.35 * pull + 0.05 * flicker * vein);
  col += dotMask * 0.012;

  float scan = sin(vUv.y * uResolution.y * 1.2 + uTime * 2.0) * 0.006 * (1.0 + uVelocity);
  col += scan;

  float vignette = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(aspect * 0.8, 1.0)));
  col *= mix(0.45, 1.0, vignette);

  gl_FragColor = vec4(col, 1.0);
}
`;
