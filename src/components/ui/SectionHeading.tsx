import { KineticText } from "@/components/ui/KineticText";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  index?: string;
  as?: "h1" | "h2";
  ghost?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, index, as = "h2", ghost, className }: SectionHeadingProps) {
  const primary = as === "h1";

  return (
    <header className={cn("relative mb-16 grid grid-cols-12 gap-x-4 sm:mb-24", className)}>
      {ghost && (
        <span
          aria-hidden
          className="text-outline pointer-events-none absolute -top-[0.35em] right-0 font-display text-[28vw] leading-none font-extrabold tracking-[-0.06em] uppercase opacity-40 select-none sm:text-[18vw]"
        >
          {ghost}
        </span>
      )}
      <Reveal variant="fadeIn" className="col-span-12 mb-6 flex items-center gap-4 font-mono text-[11px] tracking-[0.3em] text-accent uppercase sm:col-span-3 sm:col-start-1 sm:mb-0 sm:flex-col sm:items-start sm:pt-4">
        {index && <span className="text-ink/40">{index}</span>}
        <span>{eyebrow}</span>
      </Reveal>
      <div className="col-span-12 sm:col-span-9">
        <KineticText
          as={as}
          by="char"
          text={title}
          className={cn(
            "font-display leading-[0.9] font-extrabold break-words tracking-[-0.055em] text-ink uppercase",
            primary ? "text-[6.6vw] sm:text-[7.4vw] lg:text-[6.2vw]" : "text-[6.6vw] sm:text-[7vw] lg:text-[5.6vw]",
          )}
        />
        {description && (
          <Reveal delay={0.25} className="mt-8 max-w-xl sm:ml-[18%]">
            <p className="text-base leading-relaxed text-pretty text-muted sm:text-lg">{description}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
