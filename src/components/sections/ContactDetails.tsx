"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { profile } from "@/content/profile";
import type { IconName } from "@/types/content";

type Detail = {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
  copy?: string;
};

const details: Detail[] = [
  { icon: "mail", label: "E-mail", value: profile.email, href: `mailto:${profile.email}`, copy: profile.email },
  { icon: "phone", label: "Téléphone", value: profile.phone, href: `tel:${profile.phoneHref}`, copy: profile.phone },
  { icon: "pin", label: "Localisation", value: `${profile.location}, Occitanie` },
  { icon: "car", label: "Mobilité", value: profile.license },
];

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
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
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

export function ContactDetails() {
  return (
    <Stagger as="ul" className="flex flex-col gap-4">
      {details.map((detail) => (
        <StaggerItem
          as="li"
          key={detail.label}
          className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-accent/30"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Icon name={detail.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs tracking-wide text-muted uppercase">{detail.label}</p>
            {detail.href ? (
              <a href={detail.href} className="block truncate font-medium transition-colors hover:text-accent-soft">
                {detail.value}
              </a>
            ) : (
              <p className="truncate font-medium">{detail.value}</p>
            )}
          </div>
          {detail.copy && <CopyButton value={detail.copy} label={detail.label} />}
        </StaggerItem>
      ))}
    </Stagger>
  );
}
