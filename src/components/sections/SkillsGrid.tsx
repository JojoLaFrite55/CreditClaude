"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { KineticText } from "@/components/ui/KineticText";
import { Magnetic } from "@/components/ui/Magnetic";
import { Parallax } from "@/components/ui/Parallax";
import { duration, easing, variants, viewport } from "@/config/ui";
import { cn } from "@/lib/cn";
import type { CefrLevel, Language, SkillGroup } from "@/types/content";

const levels: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const offsets = ["lg:col-start-1", "lg:col-start-4", "lg:col-start-2", "lg:col-start-5"];

function LanguageMeter({ language }: { language: Language }) {
  const reached = levels.indexOf(language.level);

  return (
    <div className="grid grid-cols-12 items-end gap-x-4 gap-y-6">
      <div className="col-span-12 sm:col-span-5">
        <p className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase">/ Langues</p>
        <p className="mt-3 font-display text-5xl font-extrabold tracking-[-0.04em] uppercase">{language.name}</p>
      </div>
      <motion.div
        className="col-span-12 grid grid-cols-6 sm:col-span-7"
        role="img"
        aria-label={`${language.name} : niveau ${language.level} sur l'échelle européenne`}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {levels.map((level, index) => (
          <div key={level} className="relative border-l border-line pb-1 pl-2 last:border-r">
            <motion.div
              className="absolute inset-x-0 bottom-0 origin-bottom bg-accent"
              style={{ height: `${30 + index * 14}%` }}
              custom={index}
              variants={{
                hidden: { scaleY: 0 },
                visible: (i: number) => ({
                  scaleY: i <= reached ? 1 : 0,
                  transition: { duration: duration.base, ease: easing.out, delay: 0.1 + i * 0.08 },
                }),
              }}
            />
            <span
              className={cn(
                "relative block pt-20 font-display text-2xl font-extrabold sm:text-4xl",
                index <= reached ? "text-void" : "text-ink/20",
              )}
            >
              {level}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

type SkillsGridProps = {
  groups: SkillGroup[];
  languages: Language[];
};

export function SkillsGrid({ groups, languages }: SkillsGridProps) {
  return (
    <div className="flex flex-col gap-20">
      <div className="grid grid-cols-12 gap-x-4 gap-y-16">
        {groups.map((group, index) => (
          <Parallax
            key={group.title}
            speed={0.05 + (index % 2) * 0.15}
            className={cn("col-span-12 sm:col-span-6 lg:col-span-8", offsets[index % offsets.length])}
          >
            <div className="mb-5 flex items-center gap-3 border-b border-line pb-3">
              <Icon name={group.icon} className="size-4 text-accent" />
              <KineticText as="h3" text={group.title} className="font-mono text-[11px] tracking-[0.3em] text-ink/70 uppercase" />
              <span className="ml-auto font-mono text-[10px] text-muted">{String(group.items.length).padStart(2, "0")}</span>
            </div>
            <motion.ul
              className="flex flex-wrap gap-x-2 gap-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={variants.stagger}
            >
              {group.items.map((item) => (
                <motion.li key={item} variants={variants.clipUp}>
                  <Magnetic strength={0.4}>
                    <span
                      data-cursor="magnetic"
                      className="glitch-host inline-block border border-line px-4 py-2 font-display text-lg font-bold tracking-tight uppercase transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-void sm:text-2xl"
                    >
                      <span data-text={item} className="glitch">
                        {item}
                      </span>
                    </span>
                  </Magnetic>
                </motion.li>
              ))}
            </motion.ul>
          </Parallax>
        ))}
      </div>
      {languages.map((language) => (
        <LanguageMeter key={language.name} language={language} />
      ))}
    </div>
  );
}
