"use client";

import { motion } from "framer-motion";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Logo } from "@/components/ui/Logo";
import { profile } from "@/content/profile";

export function BrandLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <TransitionLink href="/" onClick={onNavigate} aria-label="Retour à l'accueil" className="flex items-center gap-3">
      <motion.span initial="rest" animate="rest" whileHover="hover" className="flex items-center gap-3">
        <Logo />
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-sm font-semibold tracking-tight">{profile.fullName}</span>
          <span className="font-mono text-[11px] text-muted">sys &amp; net admin</span>
        </span>
      </motion.span>
    </TransitionLink>
  );
}
