import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { TiltCard } from "@/components/ui/TiltCard";
import { ProjectPreview } from "@/components/sections/ProjectPreview";
import { statusLabels } from "@/content/projects";
import type { Project } from "@/types/content";

const statusTone = {
  "en-cours": "cta",
  termines: "accent",
  futurs: "neutral",
} as const;

export function ProjectCard({ project }: { project: Project }) {
  return (
    <TiltCard>
      <article className="flex h-full flex-col gap-5 p-5">
        <ProjectPreview preview={project.preview} />
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
            <Icon name={project.icon} className="size-5" />
          </span>
          <div className="flex items-center gap-2">
            {project.placeholder && (
              <span className="font-mono text-[10px] tracking-wider text-muted/70 uppercase">Exemple</span>
            )}
            <Tag tone={statusTone[project.status]}>{statusLabels[project.status]}</Tag>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold">{project.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{project.summary}</p>
        </div>
        <ul className="mt-auto flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
      </article>
    </TiltCard>
  );
}
