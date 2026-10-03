"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ChangeEvent, type FocusEvent } from "react";
import { duration, easing } from "@/config/ui";
import { cn } from "@/lib/cn";

type FormFieldProps = {
  id: string;
  label: string;
  index: string;
  value: string;
  error?: string;
  attempt: number;
  type?: "text" | "email";
  multiline?: boolean;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export function FormField({ id, label, index, error, attempt, multiline = false, type = "text", maxLength, onBlur, ...rest }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  const filled = rest.value.length > 0;
  const classes = cn(
    "peer w-full bg-transparent pt-2 pb-3 font-display text-xl font-bold tracking-tight text-ink outline-none placeholder:text-ink/15 sm:text-2xl",
    multiline && "resize-none",
  );
  const shared = {
    id,
    name: id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className: classes,
    maxLength,
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur(event);
    },
    ...rest,
  };

  return (
    <motion.div
      key={error ? `${id}-${attempt}` : id}
      className="relative"
      animate={error ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.5, ease: easing.out }}
    >
      <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.25em] uppercase">
        <label htmlFor={id} className={cn("transition-colors", error ? "text-danger" : focused || filled ? "text-accent" : "text-muted")}>
          <span className="mr-2 text-ink/30">{index}</span>
          {label}
        </label>
        {multiline && maxLength && (
          <span className="text-muted/60">
            {rest.value.length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? <textarea rows={5} {...shared} /> : <input type={type} {...shared} />}
      <span aria-hidden className="absolute bottom-0 left-0 h-px w-full bg-line" />
      <motion.span
        aria-hidden
        className={cn("absolute bottom-0 left-0 h-px w-full origin-left", error ? "bg-danger" : "bg-accent")}
        initial={false}
        animate={{ scaleX: focused || error ? 1 : 0 }}
        transition={{ duration: duration.base, ease: easing.out }}
      />
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            className="absolute top-full left-0 mt-2 font-mono text-[11px] text-danger"
            initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 0% 100%)" }}
            transition={{ duration: duration.base, ease: easing.expo }}
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
