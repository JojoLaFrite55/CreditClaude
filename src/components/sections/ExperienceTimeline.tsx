"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { springs } from "@/config/ui";
import type { Experience } from "@/types/content";

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, springs.tilt);

  return (
    <ol ref={ref} className="relative space-y-12 pl-8 sm:pl-12">
      <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-line sm:left-[11px]" />
      <motion.span
        aria-hidden
        style={{ scaleY }}
        className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-accent via-accent to-cta sm:left-[11px]"
      />
      {items.map((item) => (
        <li key={item.company} className="relative">
          <span
            aria-hidden
            className="absolute top-2 -left-8 grid size-4 place-items-center rounded-full border border-accent bg-obsidian sm:-left-12 sm:size-6"
          >
            <span className="size-1.5 rounded-full bg-accent sm:size-2" />
          </span>
          <Reveal className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">{item.role}</h3>
                <p className="mt-1 text-accent-soft">{item.company}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                <span className="font-mono text-xs text-muted">
                  {item.start} — {item.end}
                </span>
                <Tag tone={item.contract === "Alternance" ? "accent" : "cta"}>{item.contract}</Tag>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted italic">{item.context}</p>
            <ul className="mt-5 space-y-2.5">
              {item.missions.map((mission) => (
                <li key={mission} className="flex gap-3 text-sm leading-relaxed text-ink/85">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rotate-45 bg-accent" />
                  {mission}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
