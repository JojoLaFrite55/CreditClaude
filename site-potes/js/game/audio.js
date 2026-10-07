const BASS = [45, 45, 0, 45, 0, 45, 48, 0, 43, 43, 0, 43, 0, 43, 40, 0];
const ARP = [69, 0, 72, 0, 76, 0, 72, 0, 67, 0, 71, 0, 74, 0, 71, 0];
const BPM = 118;
const STEP = 60 / BPM / 4;
const mtof = (midi) => 440 * 2 ** ((midi - 69) / 12);
const KEY = "qg-muted";

export function createAudio() {
  let ctx = null;
  let master = null;
  let sfx = null;
  let bus = null;
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

  const init = () => {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.85;
    master.connect(compressor);
    sfx = ctx.createGain();
    sfx.connect(master);
    bus = ctx.createGain();
    bus.gain.value = 0.3;
    bus.connect(master);
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
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.006);
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
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(gain).connect(dest);
    source.start(t, Math.random() * 0.5);
    source.stop(t + duration + 0.03);
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
    click() {
      tone("square", 880, 620, 0.05, 0.1);
    },
    shoot() {
      const detune = 0.94 + Math.random() * 0.12;
      noise(0.09, 0.45, "bandpass", 3400 * detune, 900, 0, sfx, 0.8);
      tone("square", 540 * detune, 70, 0.11, 0.22);
      tone("sawtooth", 170 * detune, 46, 0.16, 0.28);
    },
    hit() {
      tone("square", 1900, 1250, 0.07, 0.16);
      tone("triangle", 2700, 1700, 0.13, 0.12);
      noise(0.05, 0.22, "highpass", 4200, 4200);
    },
    kill(combo = 1) {
      noise(0.24, 0.5, "lowpass", 2400, 260);
      tone("sine", 150, 36, 0.24, 0.7);
      tone("sawtooth", 330 + Math.random() * 90, 70, 0.15, 0.16);
      tone("triangle", 660 * 1.0595 ** Math.min(combo, 14), 660 * 1.0595 ** Math.min(combo, 14), 0.1, 0.1, 0.03);
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
