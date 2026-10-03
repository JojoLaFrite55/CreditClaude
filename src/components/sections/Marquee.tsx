"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { skillGroups } from "@/content/skills";

const items = skillGroups.flatMap((group) => group.items);

export function Marquee() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const skew = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 0 : -1, reduceMotion ? 0 : 1]);
  const row = [...items, ...items];

  return (
    <motion.section aria-label="Technologies" style={{ rotate: skew }} className="relative my-20 border-y border-line bg-void/70 py-4 sm:my-28">
      <div className="marquee-mask overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
          {row.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-10 font-display text-2xl font-bold tracking-[-0.02em] uppercase sm:text-4xl">
              <span className={index % 3 === 1 ? "text-outline" : "text-ink"}>{item}</span>
              <span aria-hidden className="size-1.5 rotate-45 bg-accent" />
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
