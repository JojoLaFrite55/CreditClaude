import type { Transition, Variants } from "framer-motion";

export const palette = {
  obsidian: "#0B0F19",
  surface: "#111827",
  line: "#1F2937",
  accent: "#14B8A6",
  accentSoft: "#5EEAD4",
  cta: "#F59E0B",
  ink: "#E6EDF3",
  muted: "#8B97A8",
} as const;

export const easing = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.76, 0, 0.24, 1],
  soft: [0.4, 0, 0.2, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const duration = {
  fast: 0.2,
  base: 0.5,
  slow: 0.8,
  curtain: 0.6,
  draw: 1.1,
} as const;

export const springs = {
  magnetic: { type: "spring", stiffness: 160, damping: 14, mass: 0.2 },
  tilt: { type: "spring", stiffness: 220, damping: 22, mass: 0.4 },
  layout: { type: "spring", stiffness: 380, damping: 32 },
  pop: { type: "spring", stiffness: 420, damping: 24 },
} as const satisfies Record<string, Transition>;

export const interaction = {
  magneticStrength: 0.35,
  magneticLabelStrength: 0.15,
  tiltMaxDeg: 9,
  typingSpeedMs: 42,
  typingPauseMs: 520,
  typingStartDelayMs: 700,
} as const;

export const viewport = {
  once: true,
  amount: 0.2,
} as const;

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.out } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.base, ease: easing.soft } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: springs.pop },
  },
  stagger: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
  page: {
    hidden: { opacity: 0, x: 40, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: duration.slow, ease: easing.out, delay: 0.1 },
      transitionEnd: { filter: "none" },
    },
  },
  curtain: {
    idle: { x: "100%", transition: { duration: 0 } },
    cover: { x: "0%", transition: { duration: duration.curtain, ease: easing.inOut } },
    reveal: { x: "-100%", transition: { duration: duration.curtain, ease: easing.inOut } },
  },
} as const satisfies Record<string, Variants>;
