import { KineticText } from "@/components/ui/KineticText";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type { Diploma } from "@/types/content";

const layouts = ["lg:col-span-6 lg:col-start-1", "lg:col-span-5 lg:col-start-8 lg:mt-20"];

export function EducationList({ items }: { items: Diploma[] }) {
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-16">
      {items.map((diploma, index) => (
        <Parallax key={diploma.title} speed={0.08 + index * 0.14} className={cn("col-span-12", layouts[index % layouts.length])}>
          <article className="border-t border-ink/80 pt-5">
            <div className="flex items-start justify-between gap-4 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              <span>{diploma.period}</span>
              <Tag tone={diploma.status === "Obtenu" ? "accent" : "solid"}>{diploma.status}</Tag>
            </div>
            <KineticText
              as="h3"
              by="char"
              text={diploma.title}
              className="mt-5 font-display text-[clamp(2.25rem,4.6cqw,4rem)] leading-[0.95] font-extrabold tracking-[-0.03em]"
            />
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-md text-ink/80">{diploma.speciality}</p>
              <p className="mt-1 font-mono text-xs text-muted">{diploma.school}</p>
            </Reveal>
          </article>
        </Parallax>
      ))}
    </div>
  );
}
