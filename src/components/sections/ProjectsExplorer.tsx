"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { duration, easing, springs } from "@/config/ui";
import { cn } from "@/lib/cn";
import type { Project, ProjectFilter } from "@/types/content";

type ProjectsExplorerProps = {
  projects: Project[];
  filters: ProjectFilter[];
};

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
      <div role="tablist" aria-label="Filtrer les projets" className="mb-10 flex flex-wrap gap-2">
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
                "relative rounded-full px-5 py-2 text-sm transition-colors",
                selected ? "text-obsidian" : "text-muted hover:text-ink",
              )}
            >
              {selected && (
                <motion.span layoutId="project-filter" transition={springs.layout} className="absolute inset-0 rounded-full bg-accent" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {filter.label}
                <span className={cn("font-mono text-xs", selected ? "text-obsidian/70" : "text-muted/60")}>
                  {counts[filter.value] ?? 0}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul id="projects-grid" role="tabpanel" layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, index) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: easing.out, delay: index * 0.06 } }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: duration.fast } }}
              className="h-full min-w-0"
            >
              <ProjectCard project={project} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && <p className="text-center text-muted">Aucun projet dans cette catégorie pour le moment.</p>}
    </LayoutGroup>
  );
}
