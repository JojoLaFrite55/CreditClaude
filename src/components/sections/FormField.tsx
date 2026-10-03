"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ChangeEvent, FocusEvent } from "react";
import { cn } from "@/lib/cn";

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: "text" | "email";
  multiline?: boolean;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export function FormField({ id, label, error, multiline = false, type = "text", maxLength, ...rest }: FormFieldProps) {
  const errorId = `${id}-error`;
  const classes = cn(
    "w-full rounded-xl border bg-obsidian/70 px-4 py-3 text-sm text-ink placeholder:text-muted/50 transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
    error ? "border-danger/70" : "border-line hover:border-line/40",
  );
  const shared = {
    id,
    name: id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className: classes,
    maxLength,
    ...rest,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink/90">
          {label}
        </label>
        {multiline && maxLength && (
          <span className="font-mono text-[11px] text-muted/60">
            {rest.value.length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? <textarea rows={6} {...shared} className={cn(classes, "resize-y")} /> : <input type={type} {...shared} />}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            className="text-xs text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
