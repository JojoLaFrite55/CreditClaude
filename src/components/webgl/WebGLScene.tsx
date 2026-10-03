"use client";

import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { MeshGradient } from "@/components/webgl/MeshGradient";

export default function WebGLScene() {
  const reduceMotion = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.25]}
      gl={{ antialias: false, alpha: false, powerPreference: "low-power", depth: false, stencil: false }}
      orthographic
      frameloop="always"
      className="!pointer-events-none"
    >
      <MeshGradient animate={!reduceMotion} />
    </Canvas>
  );
}
