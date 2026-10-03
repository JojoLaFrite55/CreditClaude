"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, type PointerEvent } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { interaction, tweens } from "@/config/ui";
import { cn } from "@/lib/cn";
import { tweenTo } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
};

type LinkProps = BaseProps & {
  href: string;
  external?: boolean;
  download?: boolean;
};

type ButtonProps = BaseProps & {
  href?: undefined;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

type MagneticButtonProps = LinkProps | ButtonProps;

const styles: Record<Variant, string> = {
  primary: "bg-ink text-void",
  secondary: "border border-ink/30 text-ink",
  ghost: "text-ink/80",
};

const fills: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-ink",
  ghost: "bg-graphite",
};

const hoverText: Record<Variant, string> = {
  primary: "group-hover:text-void",
  secondary: "group-hover:text-void",
  ghost: "group-hover:text-ink",
};

export function MagneticButton(props: MagneticButtonProps) {
  const { children, className, variant = "primary" } = props;
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ratio = interaction.magneticLabelStrength / interaction.magneticStrength;
  const labelX = useTransform(x, (value) => value * ratio);
  const labelY = useTransform(y, (value) => value * ratio);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    tweenTo(x, (event.clientX - (rect.left + rect.width / 2)) * interaction.magneticStrength);
    tweenTo(y, (event.clientY - (rect.top + rect.height / 2)) * interaction.magneticStrength);
  };

  const reset = () => {
    tweenTo(x, 0, tweens.release);
    tweenTo(y, 0, tweens.release);
  };

  const classes = cn(
    "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-3.5 font-mono text-xs tracking-[0.18em] uppercase disabled:cursor-not-allowed disabled:opacity-50",
    styles[variant],
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 translate-y-[101%] rounded-[inherit] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0",
          fills[variant],
        )}
      />
      <motion.span
        className={cn("relative inline-flex items-center gap-3 transition-colors duration-500", hoverText[variant])}
        style={{ x: labelX, y: labelY }}
      >
        {children}
      </motion.span>
    </>
  );

  const renderInner = () => {
    if (props.href === undefined) {
      return (
        <button type={props.type ?? "button"} disabled={props.disabled} onClick={props.onClick} className={classes}>
          {inner}
        </button>
      );
    }
    if (props.external || props.download) {
      return (
        <a
          href={props.href}
          className={classes}
          download={props.download || undefined}
          target={props.external ? "_blank" : undefined}
          rel={props.external ? "noopener noreferrer" : undefined}
        >
          {inner}
        </a>
      );
    }
    return (
      <TransitionLink href={props.href} className={classes}>
        {inner}
      </TransitionLink>
    );
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      {renderInner()}
    </motion.div>
  );
}
