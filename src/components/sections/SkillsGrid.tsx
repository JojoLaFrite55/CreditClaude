"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { TiltCard } from "@/components/ui/TiltCard";
import { easing, variants, viewport } from "@/config/ui";
import type { CefrLevel, Language, SkillGroup } from "@/types/content";

const levels: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function LanguageMeter({ language }: { language: Language }) {
  const reached = levels.indexOf(language.level);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{language.name}</span>
        <span className="font-mono text-sm text-accent">{language.level}</span>
      </div>
      <motion.div
        className="grid grid-cols-6 gap-1.5"
        role="img"
        aria-label={`${language.name} : niveau ${language.level} sur l'échelle européenne`}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {levels.map((level, index) => (
          <div key={level} className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-accent-soft"
                custom={index}
                variants={{
                  hidden: { scaleX: 0 },
                  visible: (i: number) => ({
                    scaleX: i <= reached ? 1 : 0,
                    transition: { duration: 0.4, delay: 0.15 + i * 0.1, ease: easing.out },
                  }),
                }}
              />
            </div>
            <span className={`block text-center font-mono text-[10px] ${index <= reached ? "text-ink/80" : "text-muted/50"}`}>
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
    <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {groups.map((group) => (
        <StaggerItem key={group.title} className="h-full">
          <TiltCard>
            <div className="flex h-full flex-col gap-5 p-6">
              <h3 className="flex items-center gap-3 font-display text-lg font-semibold">
                <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                  <Icon name={group.icon} className="size-5" />
                </span>
                {group.title}
              </h3>
              <motion.ul
                className="flex flex-wrap gap-2"
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={variants.stagger}
              >
                {group.items.map((item) => (
                  <motion.li
                    key={item}
                    variants={variants.scaleIn}
                    whileHover={{ y: -3, borderColor: "rgba(20,184,166,0.6)" }}
                    className="cursor-default rounded-lg border border-line bg-obsidian/60 px-3 py-1.5 font-mono text-xs text-ink/85"
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
      <StaggerItem className="h-full sm:col-span-2">
        <div className="glass grid gap-6 rounded-2xl p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
          <h3 className="flex items-center gap-3 font-display text-lg font-semibold">
            <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <Icon name="languages" className="size-5" />
            </span>
            Langues
          </h3>
          <div className="space-y-6">
            {languages.map((language) => (
              <LanguageMeter key={language.name} language={language} />
            ))}
          </div>
        </div>
      </StaggerItem>
    </Stagger>
  );
}
