"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { KineticText } from "@/components/ui/KineticText";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { profile } from "@/content/profile";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copié` : `Copier ${label.toLowerCase()}`}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "done" : "copy"}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const rows = [
  { label: "Téléphone", value: profile.phone, href: `tel:${profile.phoneHref}`, copy: profile.phone },
  { label: "Localisation", value: `${profile.location}, Occitanie` },
  { label: "Mobilité", value: profile.license },
];

export function ContactDetails() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-accent uppercase">/ E-mail</p>
        <div className="flex items-start gap-3">
          <a href={`mailto:${profile.email}`} data-cursor="label" data-cursor-label="Mail" className="group block min-w-0">
            <KineticText
              as="span"
              by="char"
              stagger={0.015}
              text={profile.email}
              className="block font-display text-[4.8vw] leading-[0.95] font-extrabold tracking-[-0.05em] break-all transition-colors duration-500 group-hover:text-accent sm:text-[3.4vw] lg:text-[1.8vw]"
            />
          </a>
          <CopyButton value={profile.email} label="E-mail" />
        </div>
      </div>
      <Stagger as="ul" className="border-t border-line">
        {rows.map((row) => (
          <StaggerItem as="li" key={row.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 border-b border-line py-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">{row.label}</span>
            {row.href ? (
              <a href={row.href} className="font-medium transition-colors hover:text-accent">
                {row.value}
              </a>
            ) : (
              <span className="font-medium">{row.value}</span>
            )}
            {row.copy ? <CopyButton value={row.copy} label={row.label} /> : <span />}
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
