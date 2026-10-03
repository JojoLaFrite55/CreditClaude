"use client";

import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { easing } from "@/config/ui";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: easing.out }}>
      <SmoothScroll>
        <TransitionProvider>{children}</TransitionProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
