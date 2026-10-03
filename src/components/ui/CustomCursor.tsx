"use client";

import { useEffect, useRef } from "react";
import { interaction } from "@/config/ui";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Shape = { x: number; y: number; w: number; h: number; r: number; o: number };

const INTERACTIVE = "a, button, [data-cursor], input, textarea, select, label[for]";
const BASE = 14;

function lerp(from: number, to: number, factor: number) {
  return from + (to - from) * factor;
}

export function CustomCursor() {
  const shell = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine)");

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current: Shape = { x: pointer.x, y: pointer.y, w: BASE, h: BASE, r: BASE / 2, o: 0 };
    const dotPos = { x: pointer.x, y: pointer.y };
    let target: Element | null = null;
    let pressed = false;
    let visible = false;
    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      visible = true;
      const hit = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
      if (hit !== target) {
        target = hit;
        const text = hit?.getAttribute("data-cursor-label") ?? "";
        if (labelRef.current) labelRef.current.textContent = text;
      }
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
      let goal: Shape = { x: pointer.x, y: pointer.y, w: BASE, h: BASE, r: BASE / 2, o: visible ? 1 : 0 };

      if (target && target.isConnected) {
        const mode = target.getAttribute("data-cursor");
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          goal = { ...goal, w: 3, h: 30, r: 2 };
        } else if (mode === "label") {
          goal = { ...goal, w: 92, h: 92, r: 46 };
        } else {
          const rect = target.getBoundingClientRect();
          const fits = rect.width < 360 && rect.height < 140;
          if (fits || mode === "magnetic") {
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const radius = parseFloat(getComputedStyle(target).borderRadius) || 4;
            goal = {
              x: cx + (pointer.x - cx) * 0.12,
              y: cy + (pointer.y - cy) * 0.12,
              w: rect.width + 14,
              h: rect.height + 10,
              r: Math.min(radius + 4, (rect.height + 10) / 2),
              o: goal.o,
            };
          } else {
            goal = { ...goal, w: 46, h: 46, r: 23 };
          }
        }
      }

      if (pressed) {
        goal.w *= 0.86;
        goal.h *= 0.86;
      }

      const move = interaction.cursorLerp;
      const morph = interaction.cursorMorphLerp;
      current.x = lerp(current.x, goal.x, move);
      current.y = lerp(current.y, goal.y, move);
      current.w = lerp(current.w, goal.w, morph);
      current.h = lerp(current.h, goal.h, morph);
      current.r = lerp(current.r, goal.r, morph);
      current.o = lerp(current.o, goal.o, 0.2);
      dotPos.x = lerp(dotPos.x, pointer.x, 0.6);
      dotPos.y = lerp(dotPos.y, pointer.y, 0.6);

      const node = shell.current;
      if (node) {
        node.style.transform = `translate3d(${current.x - current.w / 2}px, ${current.y - current.h / 2}px, 0)`;
        node.style.width = `${current.w}px`;
        node.style.height = `${current.h}px`;
        node.style.borderRadius = `${current.r}px`;
        node.style.opacity = `${current.o}`;
      }
      if (dot.current) {
        dot.current.style.transform = `translate3d(${dotPos.x - 2}px, ${dotPos.y - 2}px, 0)`;
        dot.current.style.opacity = target ? "0" : `${current.o}`;
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
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] mix-blend-difference">
      <div
        ref={shell}
        className="absolute top-0 left-0 flex items-center justify-center bg-white opacity-0 will-change-transform"
        style={{ width: BASE, height: BASE, borderRadius: BASE / 2 }}
      >
        <span ref={labelRef} className="font-mono text-[10px] tracking-[0.2em] text-black uppercase" />
      </div>
      <div ref={dot} className="absolute top-0 left-0 size-1 rounded-full bg-white opacity-0" />
    </div>
  );
}
