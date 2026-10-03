"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { duration, easing } from "@/config/ui";

const WebGLScene = dynamic(() => import("@/components/webgl/WebGLScene"), { ssr: false });

let webglSupport: boolean | null = null;

function detectWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const subscribe = () => () => {};

export function Background() {
  const supported = useSyncExternalStore(subscribe, detectWebGL, () => false);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 bg-void" />
      {supported && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.slow * 2, ease: easing.soft }}
        >
          <WebGLScene />
        </motion.div>
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden opacity-[0.07] mix-blend-overlay">
        <div className="noise absolute -inset-[20%] animate-grain" />
      </div>
    </>
  );
}
