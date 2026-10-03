import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
};

export function SectionHeading({ eyebrow, title, description, align = "left", as: Heading = "h2" }: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal className={cn("mb-12 flex flex-col gap-4", centered && "items-center text-center")}>
      <span className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-accent uppercase">
        <span className="h-px w-8 bg-accent" />
        {eyebrow}
      </span>
      <Heading className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        <span className="text-gradient">{title}</span>
      </Heading>
      {description && <p className={cn("max-w-2xl text-lg text-pretty text-muted", centered && "mx-auto")}>{description}</p>}
    </Reveal>
  );
}
