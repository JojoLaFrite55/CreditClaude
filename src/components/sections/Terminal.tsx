"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { interaction } from "@/config/ui";
import type { TerminalLine } from "@/types/content";

type Cursor = { line: number; char: number };

function Prompt() {
  return (
    <span className="text-accent">
      joan@infra<span className="text-muted">:</span>~<span className="text-muted">$</span>{" "}
    </span>
  );
}

export function Terminal({ lines }: { lines: TerminalLine[] }) {
  const reduceMotion = useReducedMotion();
  const [cursor, setCursor] = useState<Cursor>({ line: 0, char: 0 });
  const [started, setStarted] = useState(false);
  const done = cursor.line >= lines.length;

  useEffect(() => {
    if (reduceMotion) {
      if (done) return;
      const id = window.setTimeout(() => setCursor({ line: lines.length, char: 0 }), 0);
      return () => window.clearTimeout(id);
    }
    if (!started) {
      const id = window.setTimeout(() => setStarted(true), interaction.typingStartDelayMs);
      return () => window.clearTimeout(id);
    }
    if (done) return;
    const current = lines[cursor.line];
    const typing = cursor.char < current.command.length;
    const id = window.setTimeout(
      () => setCursor(typing ? { line: cursor.line, char: cursor.char + 1 } : { line: cursor.line + 1, char: 0 }),
      typing ? interaction.typingSpeedMs : interaction.typingPauseMs,
    );
    return () => window.clearTimeout(id);
  }, [cursor, done, lines, reduceMotion, started]);

  return (
    <div className="relative border border-line bg-void/85">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
        <span>tty1 — ssh joan@infra</span>
        <span className="text-accent">● live</span>
      </div>
      <div className="min-h-[232px] space-y-3 p-5 font-mono text-[12px] leading-relaxed sm:text-[13px]" aria-live="polite">
        {lines.map((line, index) => {
          if (index > cursor.line) return null;
          const isCurrent = index === cursor.line;
          const typed = isCurrent ? line.command.slice(0, cursor.char) : line.command;
          return (
            <div key={line.command}>
              <p className="break-words">
                <Prompt />
                <span className="text-ink">{typed}</span>
                {isCurrent && <span className="ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-accent" />}
              </p>
              {!isCurrent && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="break-words text-ink/55">
                  {line.output}
                </motion.p>
              )}
            </div>
          );
        })}
        {done && (
          <p>
            <Prompt />
            <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-accent" />
          </p>
        )}
      </div>
      <span aria-hidden className="absolute -top-1.5 -right-1.5 size-3 bg-accent" />
    </div>
  );
}
