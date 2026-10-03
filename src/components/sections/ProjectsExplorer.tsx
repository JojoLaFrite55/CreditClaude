"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { GlitchText } from "@/components/ui/GlitchText";
import { duration, easing, tweens } from "@/config/ui";
import { cn } from "@/lib/cn";
import type { Project, ProjectFilter } from "@/types/content";

type ProjectsExplorerProps = {
  projects: Project[];
  filters: ProjectFilter[];
};

const placements = [
  "lg:col-span-5 lg:col-start-1",
  "lg:col-span-4 lg:col-start-7 lg:mt-40",
  "lg:col-span-4 lg:col-start-2",
  "lg:col-span-5 lg:col-start-7 lg:mt-16",
  "lg:col-span-4 lg:col-start-1",
  "lg:col-span-4 lg:col-start-8 lg:mt-24",
];

export function ProjectsExplorer({ projects, filters }: ProjectsExplorerProps) {
  const [active, setActive] = useState<ProjectFilter["value"]>("tous");

  const counts = useMemo(() => {
    const result: Record<string, number> = { tous: projects.length };
    for (const project of projects) result[project.status] = (result[project.status] ?? 0) + 1;
    return result;
  }, [projects]);

  const visible = useMemo(
    () => (active === "tous" ? projects : projects.filter((project) => project.status === active)),
    [active, projects],
  );

  return (
    <LayoutGroup>
      <div role="tablist" aria-label="Filtrer les projets" className="mb-16 flex flex-wrap items-baseline gap-x-8 gap-y-4 border-b border-line pb-6 sm:ml-[25%]">
        {filters.map((filter) => {
          const selected = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="projects-grid"
              onClick={() => setActive(filter.value)}
              className={cn(
                "glitch-host relative flex items-start gap-1 font-display text-2xl font-extrabold tracking-[-0.03em] uppercase transition-colors sm:text-3xl",
                selected ? "text-ink" : "text-ink/25 hover:text-ink/70",
              )}
            >
              <GlitchText text={filter.label} />
              <sup className="font-mono text-[10px] font-normal tracking-normal text-accent">{counts[filter.value] ?? 0}</sup>
              {selected && (
                <motion.span layoutId="project-filter" transition={tweens.layout} className="absolute -bottom-1.5 left-0 h-[3px] w-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      <motion.ul id="projects-grid" role="tabpanel" layout className="grid grid-cols-1 gap-x-4 gap-y-10 md:grid-cols-2 lg:grid-cols-12">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, index) => (
            <motion.li
              key={project.slug}
              layout
              transition={{ layout: tweens.layout }}
              initial={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                transition: { duration: duration.reveal, ease: easing.expo, delay: index * 0.08 },
                transitionEnd: { clipPath: "none" },
              }}
              exit={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)", transition: { duration: duration.fast, ease: easing.inOut } }}
              className={cn("min-w-0", placements[index % placements.length])}
              style={{ perspective: 1200 }}
            >
              <ProjectCard project={project} index={projects.indexOf(project)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && <p className="text-muted">Aucun projet dans cette catégorie pour le moment.</p>}
    </LayoutGroup>
  );
}
