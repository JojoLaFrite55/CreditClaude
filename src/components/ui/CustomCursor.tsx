"use client";

import { useEffect, useRef } from "react";
import { interaction } from "@/config/ui";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Shape = { x: number; y: number; w: number; h: number; r: number; o: number; f: number };

const INTERACTIVE = "a, button, [data-cursor], input, textarea, select, label[for]";
const RING = 30;

function lerp(from: number, to: number, factor: number) {
  return from + (to - from) * factor;
}

export function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine)");

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current: Shape = { x: pointer.x, y: pointer.y, w: RING, h: RING, r: RING / 2, o: 0, f: 0 };
    let target: Element | null = null;
    let pressed = false;
    let visible = false;
    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      visible = true;
      target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
    };
    const handleDown = () => {
      pressed = true;
    };
    const handleUp = () => {
      pressed = false;
    };
    const handleLeave = () => {
      visible = false;
    };

    const tick = () => {
      let goal: Shape = { x: pointer.x, y: pointer.y, w: RING, h: RING, r: RING / 2, o: visible ? 1 : 0, f: 0 };
      let hideDot = false;

      if (target && target.isConnected) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          goal = { ...goal, w: 2, h: 26, r: 1, f: 1 };
          hideDot = true;
        } else {
          const rect = target.getBoundingClientRect();
          const small = rect.width < 280 && rect.height < 72;
          if (small) {
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const radius = parseFloat(getComputedStyle(target).borderRadius) || 6;
            goal = {
              x: cx + (pointer.x - cx) * 0.08,
              y: cy + (pointer.y - cy) * 0.08,
              w: rect.width + 12,
              h: rect.height + 10,
              r: Math.min(radius + 5, (rect.height + 10) / 2),
              o: goal.o,
              f: 0,
            };
            hideDot = true;
          } else {
            goal = { ...goal, w: 44, h: 44, r: 22 };
          }
        }
      }

      if (pressed) {
        goal.w *= 0.9;
        goal.h *= 0.9;
      }

      const move = interaction.cursorLerp;
      const morph = interaction.cursorMorphLerp;
      current.x = lerp(current.x, goal.x, move);
      current.y = lerp(current.y, goal.y, move);
      current.w = lerp(current.w, goal.w, morph);
      current.h = lerp(current.h, goal.h, morph);
      current.r = lerp(current.r, goal.r, morph);
      current.o = lerp(current.o, goal.o, 0.2);
      current.f = lerp(current.f, goal.f, 0.3);

      const node = ring.current;
      if (node) {
        node.style.transform = `translate3d(${current.x - current.w / 2}px, ${current.y - current.h / 2}px, 0)`;
        node.style.width = `${current.w}px`;
        node.style.height = `${current.h}px`;
        node.style.borderRadius = `${current.r}px`;
        node.style.opacity = `${current.o}`;
        node.style.backgroundColor = `rgba(20, 184, 166, ${current.f})`;
      }
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pointer.x - 2.5}px, ${pointer.y - 2.5}px, 0)`;
        dot.current.style.opacity = hideDot ? "0" : `${current.o}`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    document.addEventListener("pointerleave", handleLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointerleave", handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div
        ref={ring}
        className="absolute top-0 left-0 border border-accent/70 opacity-0 will-change-transform"
        style={{ width: RING, height: RING, borderRadius: RING / 2 }}
      />
      <div ref={dot} className="absolute top-0 left-0 size-[5px] rounded-full bg-accent opacity-0 will-change-transform" />
    </div>
  );
}
