"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { KineticText } from "@/components/ui/KineticText";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type { Experience } from "@/types/content";

const layouts = [
  { body: "lg:col-span-6 lg:col-start-6", year: "lg:col-span-4 lg:col-start-1", speed: 0.35 },
  { body: "lg:col-span-5 lg:col-start-2", year: "lg:col-span-4 lg:col-start-8 lg:order-last", speed: 0.25 },
  { body: "lg:col-span-6 lg:col-start-7", year: "lg:col-span-5 lg:col-start-1", speed: 0.4 },
];

function yearOf(period: string) {
  return period.match(/\d{4}/)?.[0] ?? period;
}

function ExperienceRow({ item, index }: { item: Experience; index: number }) {
  const layout = layouts[index % layouts.length];
  const ref = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineScale = useTransform(scrollYProgress, [0.1, 0.6], [reduceMotion ? 1 : 0, 1]);

  return (
    <li ref={ref} className="relative grid grid-cols-12 gap-x-4 gap-y-8 py-16 sm:py-24">
      <motion.span aria-hidden style={{ scaleX: lineScale }} className="absolute top-0 left-0 h-px w-full origin-left bg-line" />
      <Parallax speed={layout.speed} className={cn("col-span-12 select-none", layout.year)}>
        <span aria-hidden className="block font-display text-[22cqw] leading-[0.75] font-extrabold tracking-[-0.07em] text-outline lg:text-[9cqw]">
          {yearOf(item.start)}
        </span>
        <span className="mt-4 block font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
          {item.start} — {item.end}
        </span>
      </Parallax>

      <div className={cn("col-span-12 sm:col-span-10 sm:col-start-2", layout.body)}>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase">({String(index + 1).padStart(2, "0")})</span>
          <Tag tone={item.contract === "Alternance" ? "solid" : "accent"}>{item.contract}</Tag>
        </div>
        <KineticText
          as="h3"
          by="char"
          stagger={0.012}
          text={item.company}
          className="font-display text-[6.8cqw] leading-[0.85] font-extrabold tracking-[-0.05em] uppercase sm:text-[6cqw] lg:text-[4.2cqw]"
        />
        <Reveal delay={0.15}>
          <p className="mt-4 font-display text-xl font-bold tracking-tight text-accent-soft sm:text-2xl">{item.role}</p>
          <p className="mt-3 max-w-lg text-sm text-muted">{item.context}</p>
        </Reveal>
        <Stagger as="ul" className="mt-8 border-t border-line">
          {item.missions.map((mission, missionIndex) => (
            <StaggerItem as="li" key={mission} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-3 text-sm leading-relaxed text-ink/85">
              <span className="font-mono text-[10px] text-muted">{String(missionIndex + 1).padStart(2, "0")}</span>
              {mission}
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </li>
  );
}

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  return (
    <ol>
      {items.map((item, index) => (
        <ExperienceRow key={item.company} item={item} index={index} />
      ))}
    </ol>
  );
}
