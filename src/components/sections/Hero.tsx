"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Terminal } from "@/components/sections/Terminal";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { duration, easing, variants } from "@/config/ui";
import { profile } from "@/content/profile";

const letter = {
  hidden: { y: "110%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: duration.slow, ease: easing.out } },
};

function AnimatedWord({ word, className }: { word: string; className?: string }) {
  return (
    <motion.span
      className={`inline-flex overflow-hidden pb-1 ${className ?? ""}`}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.035 } } }}
    >
      {Array.from(word).map((char, index) => (
        <motion.span key={`${char}-${index}`} variants={letter} className="inline-block">
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function Hero() {
  return (
    <Container as="section" className="relative grid min-h-[92dvh] items-center gap-14 pt-32 pb-16 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <motion.div initial="hidden" animate="visible" variants={variants.stagger} className="flex flex-col gap-7">
        {profile.availability.open && (
          <motion.span
            variants={variants.fadeUp}
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs text-accent-soft"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-accent" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {profile.availability.label}
          </motion.span>
        )}

        <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="sr-only">{profile.fullName}</span>
          <span aria-hidden className="flex flex-col">
            <AnimatedWord word={profile.firstName} />
            <span className="flex flex-wrap gap-x-[0.25em]">
              {profile.lastName.split(" ").map((word, index, words) => (
                <AnimatedWord key={word} word={word} className={index === words.length - 1 ? "text-gradient" : undefined} />
              ))}
            </span>
          </span>
        </h1>

        <motion.div variants={variants.fadeUp} className="space-y-2">
          <p className="font-display text-xl font-medium text-ink sm:text-2xl">{profile.role}</p>
          <p className="font-mono text-sm text-accent">{profile.education}</p>
        </motion.div>

        <motion.p variants={variants.fadeUp} className="max-w-xl text-lg text-pretty text-muted">
          {profile.tagline}
        </motion.p>

        <motion.div variants={variants.fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
          <MagneticButton href="/projets">
            Voir mes projets <ArrowRight className="size-4" />
          </MagneticButton>
          <MagneticButton href={profile.cvPath} download variant="secondary">
            Télécharger mon CV <Download className="size-4" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease: easing.out, delay: 0.35 }}
        style={{ transformPerspective: 1200 }}
      >
        <Terminal lines={profile.terminal} />
      </motion.div>
    </Container>
  );
}
