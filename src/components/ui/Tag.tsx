import { cn } from "@/lib/cn";

type TagProps = {
  children: string;
  className?: string;
  tone?: "accent" | "neutral" | "solid";
};

const tones = {
  accent: "border-accent/50 text-accent-soft",
  neutral: "border-line text-ink/70",
  solid: "border-accent bg-accent text-void",
} as const;

export function Tag({ children, className, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase transition-colors duration-300",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
