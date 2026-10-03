"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, Download } from "lucide-react";
import { useRef } from "react";
import { Terminal } from "@/components/sections/Terminal";
import { Container } from "@/components/ui/Container";
import { KineticText } from "@/components/ui/KineticText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { duration, easing } from "@/config/ui";
import { profile } from "@/content/profile";

const [middleName, lastName] = profile.lastName.split(" ");

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const factor = reduceMotion ? 0 : 1;
  const slow = useTransform(scrollYProgress, [0, 1], [0, 140 * factor]);
  const fast = useTransform(scrollYProgress, [0, 1], [0, -220 * factor]);
  const drift = useTransform(scrollYProgress, [0, 1], [0, -120 * factor]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-28 pb-16 sm:pt-32">
      <Container className="relative grid grid-cols-12 gap-x-4">
        <motion.div style={{ y: slow }} className="col-span-12 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-ink/60 uppercase sm:col-span-6">
          {profile.availability.open && (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              <span>{profile.availability.label}</span>
            </>
          )}
        </motion.div>

        <h1 className="relative col-span-12 mt-10 font-display leading-[0.8] font-extrabold tracking-[-0.065em] uppercase sm:mt-6">
          <span className="sr-only">{profile.fullName}</span>
          <motion.span aria-hidden style={{ y: drift }} className="block">
            <KineticText as="span" by="char" text={profile.firstName} immediate delay={0.3} className="block text-[19cqw] text-ink sm:text-[19cqw]" />
          </motion.span>
          <motion.span aria-hidden style={{ y: fast }} className="relative z-10 -mt-[2cqw] block pl-[2cqw] sm:-mt-[3.5cqw] sm:pl-[16cqw]">
            <KineticText as="span" by="char" text={middleName ?? ""} immediate delay={0.5} className="block text-[10cqw] text-accent sm:text-[9cqw]" />
          </motion.span>
          <motion.span aria-hidden style={{ y: slow }} className="-mt-[1cqw] block text-right">
            <KineticText as="span" by="char" text={lastName ?? ""} immediate delay={0.7} className="text-outline block text-[9.6cqw] sm:text-[9.6cqw]" />
          </motion.span>
        </h1>

        <motion.div style={{ opacity: fade }} className="col-span-12 mt-12 grid grid-cols-12 gap-x-4 gap-y-10 sm:mt-4">
          <div className="col-span-12 space-y-5 sm:col-span-6 lg:col-span-4 lg:col-start-2">
            <Reveal delay={1.1}>
              <p className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">/ {profile.role}</p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-ink/50 uppercase">{profile.education}</p>
            </Reveal>
            <KineticText
              as="p"
              text={profile.tagline}
              delay={1.2}
              immediate
              className="max-w-md font-display text-2xl leading-[1.05] font-bold tracking-tight text-ink sm:text-3xl"
            />
            <Reveal delay={1.5} className="flex flex-wrap items-center gap-3 pt-3">
              <MagneticButton href="/projets">
                Voir mes projets <ArrowDownRight className="size-4" />
              </MagneticButton>
              <MagneticButton href={profile.cvPath} download variant="secondary">
                CV <Download className="size-4" />
              </MagneticButton>
            </Reveal>
          </div>

          <motion.div
            className="col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-8"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: duration.reveal, ease: easing.expo, delay: 1.3 }}
          >
            <Terminal lines={profile.terminal} />
          </motion.div>
        </motion.div>
      </Container>

      <div className="absolute bottom-6 left-4 hidden items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-ink/40 uppercase sm:left-8 sm:flex lg:left-12">
        <span className="block h-10 w-px origin-top animate-pulse bg-accent" />
        scroll
      </div>
    </section>
  );
}
