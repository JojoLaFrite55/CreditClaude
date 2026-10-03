"use client";

import { MotionConfig } from "framer-motion";
import { TransitionProvider } from "@/components/transition/TransitionProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TransitionProvider>{children}</TransitionProvider>
    </MotionConfig>
  );
}
