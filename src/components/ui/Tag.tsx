import { cn } from "@/lib/cn";

type TagProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "accent" | "neutral" | "cta";
};

const tones = {
  accent: "border-accent/30 bg-accent/10 text-accent-soft",
  neutral: "border-line bg-surface/80 text-ink/80",
  cta: "border-cta/30 bg-cta/10 text-cta-soft",
} as const;

export function Tag({ children, className, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
