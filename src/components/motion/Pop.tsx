"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import clsx from "clsx";
import {
  POP_IN_SPRING,
  POP_SOFT_SPRING,
  POP_SPRING,
  POP_STAGGER,
  popHover,
  popRestShadow,
  popTap,
} from "@/lib/motion-presets";

export function PopIn({
  children,
  className,
  delay = 0,
  y = 14,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...POP_IN_SPRING, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function PopStagger({
  children,
  className,
  stagger = POP_STAGGER,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: reduceMotion ? { staggerChildren: 0 } : { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function PopItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, scale: 0.92, y: 12 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: POP_IN_SPRING,
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function PopSwap({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className={className}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.95, x: 24 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97, x: -24 }}
        transition={POP_SOFT_SPRING}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PopPress({
  className,
  children,
  shadow = popRestShadow,
  ...props
}: HTMLMotionProps<"div"> & { shadow?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={{ boxShadow: shadow }}
      whileHover={reduceMotion ? undefined : popHover}
      whileTap={reduceMotion ? undefined : popTap}
      transition={POP_SPRING}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PopBadge({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={className}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...POP_SPRING, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.span>
  );
}

export function PopBar({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={clsx("h-full border-2 border-black bg-accent-yellow", className)}
      initial={false}
      animate={{ width: `${progress}%` }}
      transition={reduceMotion ? { duration: 0 } : POP_SOFT_SPRING}
    />
  );
}
