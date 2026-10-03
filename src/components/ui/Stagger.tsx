"use client";

import { motion } from "framer-motion";
import { variants, viewport } from "@/config/ui";

const containers = { div: motion.div, ul: motion.ul, ol: motion.ol } as const;
const items = { div: motion.div, li: motion.li, span: motion.span } as const;

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof containers;
  immediate?: boolean;
};

export function Stagger({ children, className, as = "div", immediate = false }: StaggerProps) {
  const Component = containers[as];

  return (
    <Component
      className={className}
      initial="hidden"
      animate={immediate ? "visible" : undefined}
      whileInView={immediate ? undefined : "visible"}
      viewport={viewport}
      variants={variants.stagger}
    >
      {children}
    </Component>
  );
}

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof items;
  variant?: "fadeUp" | "fadeIn" | "scaleIn";
};

export function StaggerItem({ children, className, as = "div", variant = "fadeUp" }: StaggerItemProps) {
  const Component = items[as];

  return (
    <Component className={className} variants={variants[variant]}>
      {children}
    </Component>
  );
}
