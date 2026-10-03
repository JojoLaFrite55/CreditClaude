"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { navigation } from "@/config/site";
import { curtainPaths, duration, easing } from "@/config/ui";

type Phase = "idle" | "cover" | "reveal";

type TransitionContextValue = {
  navigate: (href: string) => void;
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const pathVariants = {
  idle: { d: curtainPaths.hidden, transition: { duration: 0 } },
  cover: {
    d: [curtainPaths.hidden, curtainPaths.rising, curtainPaths.covered],
    transition: { duration: duration.curtain, ease: easing.inOut, times: [0, 0.55, 1] },
  },
  reveal: {
    d: [curtainPaths.covered, curtainPaths.leaving, curtainPaths.gone],
    transition: { duration: duration.curtain, ease: easing.inOut, times: [0, 0.5, 1] },
  },
};

const echoVariants = {
  idle: { d: curtainPaths.hidden, transition: { duration: 0 } },
  cover: {
    d: [curtainPaths.hidden, curtainPaths.rising, curtainPaths.covered],
    transition: { duration: duration.curtain * 0.85, ease: easing.inOut, times: [0, 0.6, 1] },
  },
  reveal: {
    d: [curtainPaths.covered, curtainPaths.leaving, curtainPaths.gone],
    transition: { duration: duration.curtain, ease: easing.inOut, times: [0, 0.5, 1], delay: 0.08 },
  },
};

function labelFor(href: string) {
  return navigation.find((item) => item.href === href)?.label ?? href;
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const target = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== "idle") return;
      if (href === pathname) {
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      target.current = href;
      setLabel(labelFor(href));
      lenis?.stop();
      setPhase("cover");
    },
    [lenis, pathname, phase],
  );

  useEffect(() => {
    if (phase !== "cover" || target.current === null) return;
    if (pathname !== target.current.split(/[?#]/)[0]) return;
    const id = window.setTimeout(() => setPhase("reveal"), 120);
    return () => window.clearTimeout(id);
  }, [pathname, phase]);

  const handleComplete = useCallback(
    (definition: unknown) => {
      if (definition === "cover" && target.current) {
        lenis?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);
        router.push(target.current);
      }
      if (definition === "reveal") {
        target.current = null;
        setPhase("idle");
        lenis?.start();
      }
    },
    [lenis, router],
  );

  const value = useMemo(() => ({ navigate, isTransitioning: phase !== "idle" }), [navigate, phase]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div
        aria-hidden
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: phase === "idle" ? "none" : "auto", visibility: phase === "idle" ? "hidden" : "visible" }}
      >
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path fill="var(--color-accent)" initial="idle" animate={phase} variants={echoVariants} />
          <motion.path
            fill="var(--color-carbon)"
            initial="idle"
            animate={phase}
            variants={pathVariants}
            onAnimationComplete={handleComplete}
          />
        </svg>
        <AnimatePresence>
          {phase === "cover" && (
            <motion.div
              key="label"
              className="absolute inset-0 flex items-end justify-between p-6 sm:p-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: duration.curtain * 0.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <span className="overflow-hidden">
                <motion.span
                  className="block font-display text-[clamp(2.5rem,7vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.03em] text-ink"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%", transition: { duration: duration.base, ease: easing.out, delay: duration.curtain * 0.45 } }}
                >
                  {label}
                </motion.span>
              </span>
              <span className="hidden font-mono text-xs tracking-[0.3em] text-accent uppercase sm:block">routing…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransitionRouter() {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransitionRouter doit être utilisé dans TransitionProvider");
  return context;
}
