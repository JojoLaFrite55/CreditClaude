"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ParallaxProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  axis?: "y" | "x";
};

export function Parallax({ children, speed = 0.2, className, axis = "y" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const distance = reduceMotion ? 0 : speed * 260;
  const shift = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} className={className} style={axis === "y" ? { y: shift } : { x: shift }}>
      {children}
    </motion.div>
  );
}
