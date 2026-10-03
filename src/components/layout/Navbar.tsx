"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLink } from "@/components/layout/BrandLink";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { navigation } from "@/config/site";
import { duration, easing, springs } from "@/config/ui";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = navigation.filter((item) => item.href !== "/contact");

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: duration.slow, ease: easing.out }}
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5",
          scrolled || open ? "glass shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]" : "border border-transparent",
        )}
        aria-label="Navigation principale"
      >
        <BrandLink onNavigate={() => setOpen(false)} />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="relative">
                <TransitionLink
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative z-10 block rounded-full px-4 py-2 text-sm transition-colors",
                    active ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </TransitionLink>
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    transition={springs.layout}
                    className="absolute inset-0 rounded-full border border-accent/30 bg-accent/10"
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <MagneticButton href="/contact" className="px-5 py-2.5">
            Me contacter
          </MagneticButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="grid size-10 place-items-center rounded-xl border border-line text-ink md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: duration.fast }}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: duration.fast, ease: easing.out }}
            className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden"
          >
            <ul className="flex flex-col">
              {navigation.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: duration.fast }}
                >
                  <TransitionLink
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3 text-base",
                      isActive(pathname, item.href) ? "bg-accent/10 text-ink" : "text-muted",
                    )}
                  >
                    {item.label}
                    <span className="font-mono text-xs text-accent">0{index + 1}</span>
                  </TransitionLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
