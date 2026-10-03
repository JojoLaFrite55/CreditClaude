"use client";

import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { useRef, type PointerEvent } from "react";
import { interaction, tweens } from "@/config/ui";
import { cn } from "@/lib/cn";
import { tweenTo } from "@/lib/motion";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const lx = useMotionValue(50);
  const ly = useMotionValue(50);
  const rotateX = useTransform(py, [0, 1], [interaction.tiltMaxDeg, -interaction.tiltMaxDeg]);
  const rotateY = useTransform(px, [0, 1], [-interaction.tiltMaxDeg, interaction.tiltMaxDeg]);
  const light = useMotionTemplate`radial-gradient(520px circle at ${lx}% ${ly}%, rgba(20,184,166,0.14), transparent 50%)`;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    tweenTo(px, nx, tweens.tilt);
    tweenTo(py, ny, tweens.tilt);
    lx.set(nx * 100);
    ly.set(ny * 100);
  };

  const reset = () => {
    tweenTo(px, 0.5, tweens.release);
    tweenTo(py, 0.5, tweens.release);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={cn("group relative h-full border border-line bg-carbon/80 transition-colors duration-700 hover:border-accent/50", className)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: light }}
      />
      <span aria-hidden className="absolute -top-px -left-px size-3 border-t border-l border-accent" />
      <span aria-hidden className="absolute -right-px -bottom-px size-3 border-r border-b border-accent" />
      <div className="relative h-full">
        {children}
      </div>
    </motion.div>
  );
}
