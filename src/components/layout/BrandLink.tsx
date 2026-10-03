"use client";

import { motion } from "framer-motion";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Logo } from "@/components/ui/Logo";
import { profile } from "@/content/profile";

export function BrandLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <TransitionLink href="/" onClick={onNavigate} aria-label="Retour à l'accueil" className="inline-flex items-center gap-3" data-cursor="magnetic">
      <motion.span initial="rest" animate="rest" whileHover="hover" className="flex items-center gap-3">
        <Logo className="size-8" />
        <span className="flex flex-col font-mono text-[11px] leading-tight tracking-[0.16em] uppercase">
          <span className="text-ink">{profile.firstName} T.C.</span>
          <span className="text-ink/50">sys / net</span>
        </span>
      </motion.span>
    </TransitionLink>
  );
}
