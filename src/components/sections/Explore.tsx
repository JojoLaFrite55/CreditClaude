"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { duration, easing, viewport } from "@/config/ui";
import { exploreCards } from "@/content/home";

const offsets = ["pl-0", "sm:pl-[6%]", "sm:pl-[3%]"];

export function Explore() {
  return (
    <Container as="section" className="py-24 sm:py-32">
      <SectionHeading
        index="(index)"
        eyebrow="Explorer"
        title="Un portfolio, trois couches."
        description="Comme un modèle OSI : chaque page s'appuie sur la précédente. Commencez où vous voulez."
      />
      <motion.ul
        className="border-t border-line"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {exploreCards.map((card, index) => (
          <motion.li
            key={card.href}
            className="border-b border-line"
            variants={{
              hidden: { clipPath: "inset(0% 100% 0% 0%)" },
              visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: duration.reveal, ease: easing.expo } },
            }}
          >
            <TransitionLink
              href={card.href}
              className={`group relative grid grid-cols-12 items-center gap-x-4 py-8 sm:py-10 ${offsets[index % offsets.length]}`}
            >
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-graphite transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
              <span className="relative col-span-2 font-mono text-xs text-muted transition-colors duration-500 sm:col-span-1">{card.index}</span>
              <span className="relative col-span-10 font-display text-[clamp(1.75rem,4cqw,3.5rem)] leading-none font-extrabold tracking-[-0.03em] transition-[color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:text-accent-soft sm:col-span-7">
                {card.title}
              </span>
              <span className="relative col-span-10 col-start-3 mt-3 max-w-sm text-sm text-muted transition-colors duration-500 sm:col-span-3 sm:mt-0">
                {card.description}
              </span>
              <span className="relative hidden justify-end sm:col-span-1 sm:flex">
                <Icon name={card.icon} className="size-5 text-accent transition-all duration-500 group-hover:opacity-0" />
                <ArrowUpRight className="absolute size-7 -translate-x-2 translate-y-2 text-accent opacity-0 transition-all duration-500 group-hover:translate-0 group-hover:opacity-100" />
              </span>
            </TransitionLink>
          </motion.li>
        ))}
      </motion.ul>
    </Container>
  );
}
