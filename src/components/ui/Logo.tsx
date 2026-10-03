"use client";

import { motion, type Variants } from "framer-motion";
import { duration, easing } from "@/config/ui";
import { cn } from "@/lib/cn";

const HEXAGON = "M20 3 L35 11.5 L35 28.5 L20 37 L5 28.5 L5 11.5 Z";
const GLYPH = "M16 13 H25 M22 13 V24 A4 4 0 0 1 14 24";

const shell: Variants = {
  rest: { rotateY: 0, rotateX: 0, transition: { duration: duration.base, ease: easing.out } },
  hover: { rotateY: -20, rotateX: 12, transition: { duration: duration.base, ease: easing.out } },
};

const draw: Variants = {
  rest: { pathLength: 1, opacity: 1 },
  hover: { pathLength: [0, 1], opacity: [0.3, 1], transition: { duration: duration.draw, ease: easing.inOut } },
};

const glyph: Variants = {
  rest: { pathLength: 1 },
  hover: { pathLength: [0, 1], transition: { duration: duration.slow, ease: easing.out, delay: 0.25 } },
};

const node: Variants = {
  rest: { scale: 1 },
  hover: { scale: [1, 1.8, 1], transition: { duration: duration.slow, delay: 0.6 } },
};

type LogoProps = {
  className?: string;
  mode?: "hover" | "loop";
};

export function Logo({ className, mode = "hover" }: LogoProps) {
  const loop = mode === "loop";

  return (
    <motion.svg
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Logo JTC"
      className={cn("size-9 overflow-visible", className)}
      style={{ transformPerspective: 400 }}
      variants={loop ? undefined : shell}
    >
      <motion.path
        d={HEXAGON}
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        variants={loop ? undefined : draw}
        animate={loop ? { pathLength: [0, 1, 1, 0] } : undefined}
        transition={loop ? { duration: 1.8, times: [0, 0.45, 0.6, 1], repeat: Infinity, ease: easing.inOut } : undefined}
      />
      <motion.path
        d={GLYPH}
        stroke="var(--color-ink)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={loop ? undefined : glyph}
      />
      <motion.circle cx={28} cy={27} r={1.8} fill="var(--color-cta)" variants={loop ? undefined : node} />
    </motion.svg>
  );
}
