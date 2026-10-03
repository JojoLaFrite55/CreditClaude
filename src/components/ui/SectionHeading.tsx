import { KineticText } from "@/components/ui/KineticText";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  index?: string;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, index, as = "h2", className }: SectionHeadingProps) {
  const primary = as === "h1";

  return (
    <header className={cn("mb-14 grid grid-cols-12 gap-x-4 sm:mb-20", className)}>
      <Reveal
        variant="fadeIn"
        className="col-span-12 mb-5 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase sm:col-span-3 sm:mb-0 sm:flex-col sm:items-start sm:gap-1 sm:pt-3"
      >
        {index && <span className="text-ink/35">{index}</span>}
        <span>{eyebrow}</span>
      </Reveal>
      <div className="col-span-12 sm:col-span-9">
        <KineticText
          as={as}
          by="char"
          text={title}
          className={cn(
            "font-display leading-[0.95] font-extrabold tracking-[-0.035em] text-ink",
            primary ? "text-[clamp(2.4rem,6cqw,5.5rem)]" : "text-[clamp(2rem,4.6cqw,4.25rem)]",
          )}
        />
        {description && (
          <Reveal delay={0.25} className="mt-6 max-w-xl">
            <p className="text-base leading-relaxed text-pretty text-muted sm:text-lg">{description}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
