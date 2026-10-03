"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { variants } from "@/config/ui";

type Phase = "idle" | "cover" | "reveal";

type TransitionContextValue = {
  navigate: (href: string) => void;
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const target = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== "idle") return;
      if (href === pathname) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      target.current = href;
      setPhase("cover");
    },
    [pathname, phase],
  );

  useEffect(() => {
    if (phase !== "cover" || target.current === null) return;
    if (pathname !== target.current.split(/[?#]/)[0]) return;
    const id = window.setTimeout(() => setPhase("reveal"), 80);
    return () => window.clearTimeout(id);
  }, [pathname, phase]);

  const handleComplete = useCallback(
    (definition: unknown) => {
      if (definition === "cover" && target.current) router.push(target.current);
      if (definition === "reveal") {
        target.current = null;
        setPhase("idle");
      }
    },
    [router],
  );

  const value = useMemo(() => ({ navigate, isTransitioning: phase !== "idle" }), [navigate, phase]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <motion.div
        aria-hidden
        initial="idle"
        animate={phase}
        variants={variants.curtain}
        onAnimationComplete={handleComplete}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-2"
        style={{ pointerEvents: phase === "idle" ? "none" : "auto", visibility: phase === "idle" ? "hidden" : "visible" }}
      >
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-accent to-transparent" />
        {phase !== "idle" && (
          <div className="flex flex-col items-center gap-4">
            <Logo className="size-14" mode="loop" />
            <span className="font-mono text-xs tracking-[0.3em] text-accent uppercase">chargement…</span>
          </div>
        )}
      </motion.div>
    </TransitionContext.Provider>
  );
}

export function useTransitionRouter() {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransitionRouter doit être utilisé dans TransitionProvider");
  return context;
}
