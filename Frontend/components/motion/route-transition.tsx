"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const routeVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: "blur(10px)",
    transform: "translateZ(0)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transform: "translateZ(0)",
  },

  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(10px)",
  },
};


export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? false : "initial"}
        animate="animate"
        exit="exit"
        variants={routeVariants}
        transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
