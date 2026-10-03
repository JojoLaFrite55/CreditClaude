import { GraduationCap } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { Tag } from "@/components/ui/Tag";
import type { Diploma } from "@/types/content";

export function EducationList({ items }: { items: Diploma[] }) {
  return (
    <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map((diploma) => (
        <StaggerItem key={diploma.title} className="glass flex h-full flex-col gap-4 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <GraduationCap className="size-5" />
            </span>
            <Tag tone={diploma.status === "Obtenu" ? "accent" : "cta"}>{diploma.status}</Tag>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">{diploma.title}</h3>
            <p className="mt-1 text-sm text-ink/80">{diploma.speciality}</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
            <span>{diploma.school}</span>
            <span className="font-mono text-xs">{diploma.period}</span>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
