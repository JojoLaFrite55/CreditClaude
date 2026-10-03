"use client";

import { ReactLenis } from "lenis/react";
import { scroll } from "@/config/ui";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: scroll.lerp,
        wheelMultiplier: scroll.wheelMultiplier,
        touchMultiplier: scroll.touchMultiplier,
        anchors: true,
        autoRaf: true,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
