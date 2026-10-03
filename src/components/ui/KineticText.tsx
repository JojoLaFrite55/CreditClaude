"use client";

import { motion, type Variants } from "framer-motion";
import { duration, easing, reveal, viewport } from "@/config/ui";
import { cn } from "@/lib/cn";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

type KineticTextProps = {
  text: string;
  as?: Tag;
  by?: "char" | "word";
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
};

const tags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

function jitter(index: number) {
  return ((index * 37) % 7) * 0.012;
}

export function KineticText({
  text,
  as = "p",
  by = "word",
  className,
  wordClassName,
  delay = 0,
  stagger,
  immediate = false,
}: KineticTextProps) {
  const Component = tags[as];
  const step = stagger ?? (by === "char" ? 0.028 : 0.018);
  const words = text.split(" ");
  let cursor = 0;

  const piece: Variants = {
    hidden: reveal.hidden,
    visible: (index: number) => ({
      ...reveal.visible,
      transition: { duration: duration.reveal, ease: easing.out, delay: delay + index * step + jitter(index) },
    }),
  };

  return (
    <Component
      aria-label={text}
      className={className}
      initial="hidden"
      animate={immediate ? "visible" : undefined}
      whileInView={immediate ? undefined : "visible"}
      viewport={viewport}
    >
      {words.map((word, wordIndex) => {
        const units = by === "char" ? Array.from(word) : [word];
        return (
          <span key={`${word}-${wordIndex}`} aria-hidden className={cn("inline-flex overflow-hidden pb-[0.08em] align-top", wordClassName)}>
            {units.map((unit, unitIndex) => {
              const index = cursor++;
              return (
                <motion.span key={`${unit}-${unitIndex}`} custom={index} variants={piece} className="inline-block will-change-transform">
                  {unit}
                </motion.span>
              );
            })}
            {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      })}
    </Component>
  );
}
