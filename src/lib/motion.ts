import { animate, type MotionValue, type ValueAnimationTransition } from "framer-motion";
import { tweens } from "@/config/ui";

export function tweenTo(value: MotionValue<number>, target: number, transition: ValueAnimationTransition<number> = tweens.magnetic) {
  return animate(value, target, transition);
}
