import { cn } from "@/lib/cn";

export function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span data-text={text} className={cn("glitch", className)}>
      {text}
    </span>
  );
}
