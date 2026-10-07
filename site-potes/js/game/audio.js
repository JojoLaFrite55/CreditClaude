const BASS = [45, 45, 0, 45, 0, 45, 48, 0, 43, 43, 0, 43, 0, 43, 40, 0];
const ARP = [69, 0, 72, 0, 76, 0, 72, 0, 67, 0, 71, 0, 74, 0, 71, 0];
const BPM = 118;
const STEP = 60 / BPM / 4;
const mtof = (midi) => 440 * 2 ** ((midi - 69) / 12);
const KEY = "qg-muted";

const GUNS = {
  pistol: { crack: 0.7, crackF: 5200, crackLen: 0.06, body: 0.75, bodyF: 1100, bodyLen: 0.16, thumpF: 140, thump: 0.7, send: 0.9, pitch: 0.06 },
  smg: { crack: 0.5, crackF: 6200, crackLen: 0.04, body: 0.5, bodyF: 1200, bodyLen: 0.09, thumpF: 160, thump: 0.4, send: 0.5, pitch: 0.1 },
  rifle: { crack: 0.8, crackF: 4300, crackLen: 0.08, body: 0.9, bodyF: 800, bodyLen: 0.24, thumpF: 110, thump: 0.85, send: 1, pitch: 0.05, casing: true },
  shotgun: { crack: 1, crackF: 3000, crackLen: 0.11, body: 1.2, bodyF: 560, bodyLen: 0.42, thumpF: 80, thump: 1.1, send: 1.1, pitch: 0.04, extra: "pump" },
  sniper: { crack: 1.1, crackF: 2500, crackLen: 0.18, body: 1.3, bodyF: 460, bodyLen: 0.7, thumpF: 60, thump: 1.2, send: 1.5, pitch: 0.03, extra: "bolt" },
  minigun: { crack: 0.4, crackF: 6600, crackLen: 0.035, body: 0.4, bodyF: 1300, bodyLen: 0.07, thumpF: 170, thump: 0.3, send: 0.35, pitch: 0.12 },
  turret: { crack: 0.35, crackF: 5200, crackLen: 0.035, body: 0.35, bodyF: 1000, bodyLen: 0.08, thumpF: 150, thump: 0.3, send: 0.45, pitch: 0.1 },
};

export function createAudio() {
  let ctx = null;
  let master = null;
  let sfx = null;
  let bus = null;
  let reverb = null;
  let noiseBuffer = null;
  let timer = null;
  let step = 0;
  let nextTime = 0;
  let level = 0;
  let muted = false;
  try {
    muted = localStorage.getItem(KEY) === "1";
  } catch {
    muted = false;
  }

  const impulse = (seconds, decay) => {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
    return buffer;
  };

  const init = () => {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 6;
    compressor.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.85;
    master.connect(compressor);
    sfx = ctx.createGain();
    sfx.connect(master);
    bus = ctx.createGain();
    bus.gain.value = 0.26;
    bus.connect(master);
    reverb = ctx.createConvolver();
    reverb.buffer = impulse(1.5, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  };

  const tone = (type, from, to, duration, volume, delay = 0, dest = sfx) => {
    if (!ctx) return;
    const t = ctx.currentTime + Math.max(0, delay);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + duration + 0.03);
  };

  const noise = (duration, volume, type, from, to, delay = 0, dest = sfx, q = 1) => {
    if (!ctx) return;
    const t = ctx.currentTime + Math.max(0, delay);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    if (to !== from) filter.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(gain).connect(dest);
    source.start(t, Math.random() * 0.5);
    source.stop(t + duration + 0.03);
  };

  const mechanic = (kind, delay) => {
    if (kind === "pump") {
      noise(0.035, 0.4, "highpass", 3200, 3200, delay, sfx, 2);
      tone("square", 1100, 520, 0.05, 0.12, delay);
      noise(0.04, 0.45, "bandpass", 2400, 1400, delay + 0.1, sfx, 3);
      tone("square", 820, 380, 0.06, 0.14, delay + 0.1);
    } else if (kind === "bolt") {
      noise(0.05, 0.35, "highpass", 2800, 2800, delay, sfx, 2);
      tone("square", 700, 360, 0.07, 0.12, delay);
      noise(0.06, 0.4, "bandpass", 1800, 900, delay + 0.14, sfx, 3);
      tone("square", 540, 260, 0.08, 0.13, delay + 0.14);
    }
  };

  const gun = (name) => {
    if (!ctx) return;
    const p = GUNS[name] ?? GUNS.pistol;
    const shot = ctx.createGain();
    shot.connect(sfx);
    const send = ctx.createGain();
    send.gain.value = 0.34 * p.send;
    shot.connect(send).connect(reverb);
    const v = 1 + (Math.random() - 0.5) * 2 * p.pitch;
    noise(0.012, p.crack, "highpass", p.crackF * v, p.crackF * v, 0, shot, 0.7);
    noise(p.crackLen, p.crack * 0.85, "bandpass", p.crackF * 0.55 * v, p.crackF * 0.2, 0, shot, 0.6);
    noise(p.bodyLen, p.body, "lowpass", p.bodyF * v, p.bodyF * 0.18, 0, shot, 0.9);
    tone("sine", p.thumpF * v, p.thumpF * 0.3, p.bodyLen * 1.15, p.thump, 0, shot);
    tone("triangle", p.thumpF * 2.4 * v, p.thumpF * 0.6, p.bodyLen * 0.5, p.thump * 0.45, 0, shot);
    if (p.casing) tone("sine", 4600 * v, 3000, 0.09, 0.05, 0.22 + Math.random() * 0.12);
    if (p.extra) mechanic(p.extra, p.extra === "bolt" ? 0.55 : 0.4);
  };

  const schedule = (index, when) => {
    const delay = when - ctx.currentTime;
    const bass = BASS[index];
    if (bass) {
      const t = Math.max(0, delay);
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = mtof(bass - 12);
      filter.type = "lowpass";
      filter.frequency.value = 420 + level * 160;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + STEP * 1.8);
      osc.connect(filter).connect(gain).connect(bus);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + STEP * 2);
    }
    if (index % 4 === 0) tone("sine", 120, 42, 0.18, 0.7, delay, bus);
    if (level >= 1) {
      if (index % 2 === 1) noise(0.04, 0.12, "highpass", 7000, 7000, delay, bus);
      if (index === 4 || index === 12) noise(0.14, 0.22, "bandpass", 1800, 900, delay, bus);
    }
    if (level >= 2 && ARP[index]) tone("square", mtof(ARP[index]), mtof(ARP[index]), STEP * 0.9, 0.09, delay, bus);
    if (level >= 3) {
      noise(0.03, 0.1, "highpass", 8000, 8000, delay, bus);
      if (index % 2 === 0) tone("sawtooth", mtof((BASS[index] || 45) - 24), mtof((BASS[index] || 45) - 24), STEP * 1.6, 0.35, delay, bus);
    }
  };

  const tick = () => {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.15) {
      schedule(step, nextTime);
      nextTime += STEP;
      step = (step + 1) % 16;
    }
  };

  return {
    init,
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      try {
        localStorage.setItem(KEY, muted ? "1" : "0");
      } catch {
        muted = muted;
      }
      if (master) master.gain.value = muted ? 0 : 0.85;
      return muted;
    },
    startMusic(newLevel = 0) {
      if (!ctx) return;
      level = newLevel;
      if (timer) return;
      step = 0;
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(tick, 25);
    },
    stopMusic() {
      if (timer) clearInterval(timer);
      timer = null;
    },
    setLevel(value) {
      level = value;
    },
    gun,
    click() {
      tone("square", 880, 620, 0.05, 0.1);
    },
    hit() {
      noise(0.09, 0.5, "lowpass", 1500, 260);
      tone("sine", 210, 70, 0.09, 0.45);
    },
    ricochet() {
      noise(0.1, 0.3, "bandpass", 4600, 1500, 0, sfx, 6);
      tone("sine", 3400, 1200, 0.2, 0.12);
      tone("square", 1600, 700, 0.05, 0.1);
    },
    kill(combo = 1) {
      noise(0.2, 0.65, "lowpass", 1900, 190);
      noise(0.12, 0.45, "bandpass", 900, 280, 0.04, sfx, 1.4);
      tone("sine", 125, 38, 0.24, 0.65);
      tone("triangle", 660 * 1.0595 ** Math.min(combo, 14), 660 * 1.0595 ** Math.min(combo, 14), 0.1, 0.08, 0.04);
    },
    coin() {
      tone("triangle", 1568, 1568, 0.07, 0.07);
      tone("triangle", 2093, 2093, 0.16, 0.07, 0.07);
    },
    buy() {
      [784, 988, 1175, 1568].forEach((freq, index) => tone("triangle", freq, freq, 0.14, 0.12, index * 0.06));
      noise(0.05, 0.25, "highpass", 5000, 5000);
    },
    denied() {
      tone("square", 220, 150, 0.14, 0.14);
      tone("square", 200, 130, 0.14, 0.12, 0.12);
    },
    deploy() {
      tone("square", 330, 660, 0.12, 0.12);
      noise(0.1, 0.3, "lowpass", 1200, 300);
    },
    wave() {
      [440, 554, 659, 880].forEach((freq, index) => tone("triangle", freq, freq, 0.16, 0.16, index * 0.09));
    },
    clear() {
      [523, 659, 784, 1047].forEach((freq, index) => tone("sine", freq, freq, 0.22, 0.14, index * 0.07));
    },
    danger() {
      tone("square", 230, 230, 0.06, 0.07);
    },
    bossIntro() {
      tone("sawtooth", 58, 38, 1.8, 0.45);
      noise(1.4, 0.4, "lowpass", 500, 90);
      for (let i = 0; i < 2; i++) {
        tone("sawtooth", 320, 640, 0.4, 0.15, i * 0.8);
        tone("sawtooth", 640, 320, 0.4, 0.15, i * 0.8 + 0.4);
      }
    },
    bossHit() {
      tone("sine", 95, 48, 0.12, 0.55);
      noise(0.07, 0.4, "lowpass", 900, 200);
    },
    bossRoar() {
      tone("sawtooth", 110, 55, 1, 0.4);
      tone("sawtooth", 116, 58, 1, 0.3);
      noise(0.9, 0.5, "lowpass", 900, 150);
      tone("sine", 70, 30, 1, 0.7);
    },
    bossDie() {
      noise(1.5, 0.9, "lowpass", 3600, 70);
      noise(0.25, 0.8, "highpass", 3200, 3200);
      tone("sine", 75, 22, 1.3, 1.1);
      tone("sawtooth", 220, 30, 0.9, 0.35);
      noise(0.8, 0.5, "lowpass", 600, 60, 0.5);
      [523, 659, 784, 1047, 1319].forEach((freq, index) => tone("triangle", freq, freq, 0.3, 0.14, 1.1 + index * 0.1));
    },
    breach() {
      for (let i = 0; i < 3; i++) {
        tone("sawtooth", 520, 920, 0.3, 0.18, i * 0.6);
        tone("sawtooth", 920, 520, 0.3, 0.18, i * 0.6 + 0.3);
      }
      noise(0.6, 0.6, "lowpass", 1800, 120);
      tone("sine", 90, 28, 0.7, 0.7);
    },
    over() {
      [392, 330, 262, 196].forEach((freq, index) => tone("triangle", freq, freq * 0.97, 0.3, 0.2, 0.2 + index * 0.22));
    },
  };
}
