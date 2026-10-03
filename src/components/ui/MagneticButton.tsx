"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { interaction, springs } from "@/config/ui";
import { cn } from "@/lib/cn";

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
  primary:
    "bg-cta text-obsidian shadow-[0_0_0_1px_rgba(245,158,11,0.4),0_10px_40px_-10px_rgba(245,158,11,0.6)] hover:bg-cta-soft",
  secondary: "border border-accent/40 bg-accent/5 text-accent-soft hover:border-accent hover:bg-accent/10",
  ghost: "text-ink/80 hover:text-ink hover:bg-surface",
};

export function MagneticButton(props: MagneticButtonProps) {
  const { children, className, variant = "primary" } = props;
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springs.magnetic);
  const springY = useSpring(y, springs.magnetic);
  const ratio = interaction.magneticLabelStrength / interaction.magneticStrength;
  const labelX = useTransform(springX, (value) => value * ratio);
  const labelY = useTransform(springY, (value) => value * ratio);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * interaction.magneticStrength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * interaction.magneticStrength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60",
    styles[variant],
    className,
  );

  const label = (
    <motion.span className="inline-flex items-center gap-2" style={{ x: labelX, y: labelY }}>
      {children}
    </motion.span>
  );

  const renderInner = () => {
    if (props.href === undefined) {
      return (
        <button type={props.type ?? "button"} disabled={props.disabled} onClick={props.onClick} className={classes}>
          {label}
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
          {label}
        </a>
      );
    }
    return (
      <TransitionLink href={props.href} className={classes}>
        {label}
      </TransitionLink>
    );
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className="inline-block"
    >
      {renderInner()}
    </motion.div>
  );
}
