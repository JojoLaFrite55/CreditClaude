"use client";

import { motion, type Transition, type Variants } from "framer-motion";
import { variants as presets, viewport } from "@/config/ui";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeUp" | "fadeIn" | "scaleIn";
};

export function Reveal({ children, className, delay = 0, variant = "fadeUp" }: RevealProps) {
  const preset = presets[variant];
  const transition: Transition = { ...preset.visible.transition, delay };
  const resolved: Variants = { hidden: preset.hidden, visible: { ...preset.visible, transition } };

  return (
    <motion.div className={className} initial="hidden" whileInView="visible" viewport={viewport} variants={resolved}>
      {children}
    </motion.div>
  );
}
