"use client";

import { ScreenQuad } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, type ShaderMaterial, Vector2 } from "three";
import { fragmentShader, vertexShader } from "@/components/webgl/shaders";
import { palette } from "@/config/ui";

type MeshGradientProps = {
  animate: boolean;
};

export function MeshGradient({ animate }: MeshGradientProps) {
  const material = useRef<ShaderMaterial>(null);
  const pointer = useRef(new Vector2(0.5, 0.6));
  const scrollState = useRef({ current: 0, last: 0, velocity: 0 });
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.6) },
      uResolution: { value: new Vector2(1, 1) },
      uAccent: { value: new Color(palette.accent) },
    }),
    [],
  );

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      pointer.current.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    };
    const handleScroll = () => {
      scrollState.current.current = window.scrollY;
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) return;
    const u = shader.uniforms;
    const state = scrollState.current;
    state.velocity += (Math.min(Math.abs(state.current - state.last) / 40, 1) - state.velocity) * 0.08;
    state.last = state.current;
    if (animate) u.uTime.value += delta;
    u.uScroll.value += (state.current - u.uScroll.value) * 0.06;
    u.uVelocity.value = state.velocity;
    (u.uMouse.value as Vector2).lerp(pointer.current, 0.045);
    (u.uResolution.value as Vector2).set(size.width * viewport.dpr, size.height * viewport.dpr);
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        depthTest={false}
      />
    </ScreenQuad>
  );
}
