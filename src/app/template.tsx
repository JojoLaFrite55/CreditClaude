"use client";

import { motion } from "framer-motion";
import { variants } from "@/config/ui";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={variants.page}>
      {children}
    </motion.div>
  );
}
