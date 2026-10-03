"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLink } from "@/components/layout/BrandLink";
import { LocalClock } from "@/components/layout/LocalClock";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { navigation } from "@/config/site";
import { duration, easing } from "@/config/ui";
import { profile } from "@/content/profile";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(value > 160 && value > previous && !open);
  });

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [lenis, open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <motion.nav
        aria-label="Navigation principale"
        initial={{ y: "-120%" }}
        animate={{ y: hidden ? "-120%" : "0%" }}
        transition={{ duration: duration.base, ease: easing.out }}
        className="pointer-events-auto mx-auto grid max-w-[1600px] grid-cols-12 items-start gap-x-4 px-4 pt-5 mix-blend-difference sm:px-8 lg:px-12"
      >
        <div className="col-span-8 sm:col-span-4 lg:col-span-3">
          <BrandLink onNavigate={() => setOpen(false)} />
        </div>

        <div className="hidden font-mono text-[11px] leading-relaxed tracking-[0.18em] text-ink/60 uppercase lg:col-span-3 lg:block">
          <p>{profile.location} — FR</p>
          <p className="text-accent">
            <LocalClock />
          </p>
        </div>

        <ul className="hidden gap-x-8 gap-y-1 sm:col-span-6 sm:flex sm:flex-wrap sm:justify-end lg:col-span-5">
          {navigation.map((item, index) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Magnetic strength={0.25}>
                  <TransitionLink
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group flex items-baseline gap-1.5 py-1 font-mono text-xs tracking-[0.16em] uppercase"
                  >
                    <span className="text-[9px] text-accent">0{index + 1}</span>
                    <span className={cn("relative", active ? "text-ink" : "text-ink/55 transition-colors group-hover:text-ink")}>
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          transition={{ duration: duration.base, ease: easing.inOut }}
                          className="absolute -bottom-1 left-0 h-px w-full bg-accent"
                        />
                      )}
                    </span>
                  </TransitionLink>
                </Magnetic>
              </li>
            );
          })}
        </ul>

        <div className="col-span-4 flex justify-end sm:col-span-2 sm:hidden lg:col-span-1 lg:flex">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex h-10 items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-ink uppercase"
          >
            <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
            <span className="relative block h-3 w-7">
              <motion.span
                className="absolute top-0 left-0 h-px w-full bg-ink"
                animate={open ? { top: "50%", rotate: 45 } : { top: "0%", rotate: 0 }}
                transition={{ duration: duration.fast, ease: easing.inOut }}
              />
              <motion.span
                className="absolute right-0 bottom-0 h-px bg-ink"
                animate={open ? { bottom: "50%", rotate: -45, width: "100%" } : { bottom: "0%", rotate: 0, width: "60%" }}
                transition={{ duration: duration.fast, ease: easing.inOut }}
              />
            </span>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="pointer-events-auto fixed inset-0 -z-10 flex flex-col justify-end bg-carbon px-4 pt-28 pb-10 sm:px-8"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 82%)" }}
            exit={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            transition={{ duration: duration.slow, ease: easing.expo }}
          >
            <ul className="flex flex-col">
              {navigation.map((item, index) => (
                <li key={item.href} className="overflow-hidden border-b border-line">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: duration.base, ease: easing.out, delay: 0.15 + index * 0.05 }}
                  >
                    <TransitionLink
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="flex items-baseline justify-between py-3"
                      style={{ paddingLeft: `${(index % 3) * 8}%` }}
                    >
                      <span
                        className={cn(
                          "font-display text-[clamp(2rem,9vw,4rem)] leading-none font-extrabold tracking-[-0.03em]",
                          isActive(pathname, item.href) ? "text-accent" : "text-ink",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="font-mono text-xs text-muted">0{index + 1}</span>
                    </TransitionLink>
                  </motion.div>
                </li>
              ))}
            </ul>
            <p className="mt-8 font-mono text-xs tracking-[0.2em] text-muted uppercase">{profile.email}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
