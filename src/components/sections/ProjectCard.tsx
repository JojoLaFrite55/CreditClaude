import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { TiltCard } from "@/components/ui/TiltCard";
import { ProjectPreview } from "@/components/sections/ProjectPreview";
import { statusLabels } from "@/content/projects";
import type { Project } from "@/types/content";

const statusTone = {
  "en-cours": "solid",
  termines: "accent",
  futurs: "neutral",
} as const;

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <TiltCard>
      <article className="flex h-full flex-col" data-cursor="label" data-cursor-label="Lab">
        <ProjectPreview preview={project.preview} />
        <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
            <span className="flex items-center gap-2">
              <Icon name={project.icon} className="size-4 text-accent" />
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-2">
              {project.placeholder && <span className="text-ink/40">Exemple</span>}
              <Tag tone={statusTone[project.status]}>{statusLabels[project.status]}</Tag>
            </span>
          </div>
          <h3 className="font-display text-3xl leading-[0.9] font-extrabold tracking-[-0.04em] uppercase sm:text-4xl">{project.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{project.summary}</p>
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </TiltCard>
  );
}
