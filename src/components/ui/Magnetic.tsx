"use client";

import { motion, useMotionValue } from "framer-motion";
import { useRef, type PointerEvent } from "react";
import { interaction, tweens } from "@/config/ui";
import { cn } from "@/lib/cn";
import { tweenTo } from "@/lib/motion";

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

export function Magnetic({ children, className, strength = interaction.magneticStrength }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    tweenTo(x, (event.clientX - (rect.left + rect.width / 2)) * strength);
    tweenTo(y, (event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    tweenTo(x, 0, tweens.release);
    tweenTo(y, 0, tweens.release);
  };

  return (
    <motion.div ref={ref} onPointerMove={handleMove} onPointerLeave={reset} style={{ x, y }} className={cn("inline-block", className)}>
      {children}
    </motion.div>
  );
}
