"use client";

import React from "react";
import type { HTMLMotionProps, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const pageEase = [0.22, 1, 0.36, 1] as const;

const pageVariants: Variants = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(8px)" },
};

const staggerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

type MotionDivProps = HTMLMotionProps<"div">;

type MotionCardProps = MotionDivProps & {
  className?: string;
  glowClassName?: string;
};

type MotionButtonProps = HTMLMotionProps<"button"> & {
  className?: string;
};

type MotionBadgeProps = HTMLMotionProps<"div"> & {
  className?: string;
};

export function MotionPage({ className, children, ...props }: MotionDivProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : "initial"}
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: pageEase }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({ className, children, ...props }: MotionDivProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : "initial"}
      animate="animate"
      variants={staggerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({ className, children, ...props }: MotionDivProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerItemVariants}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: pageEase }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({
  className,
  glowClassName,
  children,
  whileHover,
  whileTap,
  transition,
  ...props
}: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : whileHover ?? { y: -4, scale: 1.01 }}
      whileTap={prefersReducedMotion ? undefined : whileTap ?? { scale: 0.99 }}
      transition={
        transition ?? {
          type: "spring",
          stiffness: 280,
          damping: 24,
          mass: 0.9,
        }
      }
      className={cn(
        "relative overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        glowClassName,
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type RippleButtonProps = MotionButtonProps & {
  rippleColorClassName?: string;
};

const rippleVariants = {
  initial: { scale: 0, opacity: 0.35 },
  animate: { scale: 1.7, opacity: 0 },
} as const;

export function MotionRippleButton({
  className,
  children,
  whileHover,
  whileTap,
  transition,
  rippleColorClassName = "bg-cyan-300/35",
  ...props
}: RippleButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  // `HTMLMotionProps` includes motion values, which can make `children` type
  // wider than ReactNode. We intentionally cast here to keep this component
  // usable as a standard button wrapper.
  const safeChildren = children as React.ReactNode;

  const [ripples, setRipples] = React.useState<Array<{ id: string; x: number; y: number }>>([]);
  const hostRef = React.useRef<HTMLButtonElement | null>(null);


  function spawnRipple(e: React.MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion) return;
    const el = hostRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }

  return (
    <motion.button
      ref={hostRef}
      onClick={spawnRipple}
      whileHover={prefersReducedMotion ? undefined : whileHover ?? { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : whileTap ?? { scale: 0.97 }}
      transition={
        transition ?? {
          type: "spring",
          stiffness: 320,
          damping: 22,
        }
      }
      className={cn(
        "relative overflow-hidden",
        "before:pointer-events-none",
        className,
      )}
      {...props}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className={cn(
            "pointer-events-none absolute",
            "left-0 top-0 h-3.5 w-3.5 rounded-full",
            rippleColorClassName,
            "mix-blend-screen",
          )}
          style={{ transform: `translate(${r.x - 14}px, ${r.y - 14}px)` }}
          variants={rippleVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: "easeOut" }}
        />
      ))}
      {safeChildren}
    </motion.button>
  );
}


export function MotionButton({
  className,
  children,
  whileHover,
  whileTap,
  transition,
  ...props
}: MotionButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  // Preserve reduced motion and performance: if reduced motion is enabled,
  // skip ripple entirely.
  if (prefersReducedMotion) {
    return (
      <motion.button
        whileHover={whileHover}
        whileTap={whileTap}
        transition={transition}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <MotionRippleButton
      className={className}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={transition}
      {...props}
    >
      {children}
    </MotionRippleButton>
  );
}

export const emergencyMotion = {

  sosPulse: {
    animate: { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] },
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  emergencyBorder: {
    animate: {
      boxShadow: [
        "0 0 0px rgba(255, 59, 95, 0.0)",
        "0 0 24px rgba(255, 59, 95, 0.35)",
        "0 0 0px rgba(255, 59, 95, 0.0)",
      ],
      borderColor: ["rgba(251, 113, 133, 0.15)", "rgba(255, 59, 95, 0.7)", "rgba(251, 113, 133, 0.15)"],
    },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.42, ease: "easeInOut" },
  },
  blink: {
    animate: { opacity: [0.35, 1, 0.35] },
    transition: { duration: 1.05, repeat: Infinity, ease: "easeInOut" },
  },
} as const;

export const notificationMotion = {
  enter: {
    opacity: 0,
    y: 16,
    filter: "blur(8px)",
  },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: 10,
    filter: "blur(8px)",
  },
} as const;

export const analyticsMotion = {
  barsContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.08, when: "beforeChildren" },
    },
  },
  bar: {
    hidden: { height: 6, opacity: 0 },
    visible: { height: "var(--h)", opacity: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
  },
} as const;


export function MotionBadge({
  className,
  children,
  whileHover,
  transition,
  ...props
}: MotionBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : whileHover ?? { y: -1, scale: 1.02 }}
      transition={
        transition ?? {
          type: "spring",
          stiffness: 300,
          damping: 24,
        }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionPulseDot({
  className,
  ...props
}: HTMLMotionProps<"span">) {
  return (
    <motion.span
      animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className={cn("inline-flex h-2.5 w-2.5 rounded-full bg-current", className)}
      {...props}
    />
  );
}

export function MotionGlowLine({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      animate={{ opacity: [0.45, 0.9, 0.45], scaleX: [0.98, 1, 0.98] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className={cn("origin-center", className)}
      {...props}
    />
  );
}

export const motionPresets = {
  pageVariants,
  staggerVariants,
  staggerItemVariants,
} as const;
