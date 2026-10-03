import type { Transition, Variants } from "framer-motion";

export const palette = {
  void: "#050505",
  carbon: "#0c0c0d",
  graphite: "#161618",
  line: "#232326",
  accent: "#14B8A6",
  accentSoft: "#5EEAD4",
  ink: "#EDEDED",
  muted: "#7C7C80",
} as const;

export const easing = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.83, 0, 0.17, 1],
  expo: [0.87, 0, 0.13, 1],
  soft: [0.4, 0, 0.2, 1],
  snap: [0.7, 0, 0.2, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const duration = {
  fast: 0.25,
  base: 0.6,
  slow: 1,
  reveal: 1.1,
  curtain: 0.9,
  draw: 1.1,
} as const;

export const tweens = {
  magnetic: { duration: 0.6, ease: easing.out },
  release: { duration: 0.9, ease: easing.out },
  tilt: { duration: 0.7, ease: easing.out },
  layout: { duration: 0.6, ease: easing.inOut },
  pop: { duration: 0.6, ease: easing.out },
} as const satisfies Record<string, Transition>;

export const interaction = {
  magneticStrength: 0.25,
  magneticLabelStrength: 0.15,
  tiltMaxDeg: 5,
  typingSpeedMs: 42,
  typingPauseMs: 520,
  typingStartDelayMs: 1400,
  cursorLerp: 0.18,
  cursorMorphLerp: 0.2,
} as const;

export const scroll = {
  lerp: 0.085,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
} as const;

export const viewport = {
  once: true,
  amount: 0.2,
} as const;

export const reveal = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)", y: "105%" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", y: "0%" },
} as const;

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.out } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.base, ease: easing.soft } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: tweens.pop },
  },
  clipUp: {
    hidden: { clipPath: "inset(100% 0% 0% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: duration.reveal, ease: easing.expo } },
  },
  stagger: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  },
  page: {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.out, delay: 0.25 } },
  },
} as const satisfies Record<string, Variants>;

export const curtainPaths = {
  hidden: "M0 100 L100 100 L100 100 C72 100 28 100 0 100 Z",
  rising: "M0 100 L100 100 L100 38 C74 6 30 78 0 52 Z",
  covered: "M0 100 L100 100 L100 0 C72 0 28 0 0 0 Z",
  leaving: "M0 46 L100 12 L100 0 C72 0 28 0 0 0 Z",
  gone: "M0 0 L100 0 L100 0 C72 0 28 0 0 0 Z",
} as const;
