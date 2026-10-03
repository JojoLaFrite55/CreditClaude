"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { interaction } from "@/config/ui";
import type { TerminalLine } from "@/types/content";

type Cursor = { line: number; char: number };

function Prompt() {
  return (
    <span className="text-accent">
      joan@infra<span className="text-muted">:</span>
      <span className="text-cta-soft">~</span>
      <span className="text-muted">$</span>{" "}
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
    <div className="glass overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(20,184,166,0.35)]">
      <div className="flex items-center gap-2 border-b border-line/80 px-4 py-3">
        <span className="size-3 rounded-full bg-danger/80" />
        <span className="size-3 rounded-full bg-cta/80" />
        <span className="size-3 rounded-full bg-accent/80" />
        <span className="ml-3 font-mono text-xs text-muted">ssh joan@infra — bash</span>
      </div>
      <div className="min-h-[248px] space-y-3 p-5 font-mono text-[13px] leading-relaxed sm:text-sm" aria-live="polite">
        {lines.map((line, index) => {
          if (index > cursor.line) return null;
          const isCurrent = index === cursor.line;
          const typed = isCurrent ? line.command.slice(0, cursor.char) : line.command;
          return (
            <div key={line.command}>
              <p className="break-words">
                <Prompt />
                <span className="text-ink">{typed}</span>
                {isCurrent && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />}
              </p>
              {!isCurrent && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="break-words text-accent-soft/90"
                >
                  {line.output}
                </motion.p>
              )}
            </div>
          );
        })}
        {done && (
          <p>
            <Prompt />
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
          </p>
        )}
      </div>
    </div>
  );
}
