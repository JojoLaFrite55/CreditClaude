import { GlitchText } from "@/components/ui/GlitchText";
import { cn } from "@/lib/cn";

type TagProps = {
  children: string;
  className?: string;
  tone?: "accent" | "neutral" | "solid";
};

const tones = {
  accent: "border-accent/60 text-accent-soft",
  neutral: "border-line text-ink/75",
  solid: "border-accent bg-accent text-void",
} as const;

export function Tag({ children, className, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        "glitch-host inline-flex items-center border px-2.5 py-1 font-mono text-[11px] tracking-wide whitespace-nowrap uppercase",
        tones[tone],
        className,
      )}
    >
      <GlitchText text={children} />
    </span>
  );
}
