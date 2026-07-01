"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import clsx from "clsx";
import {
  FADE_SPRING,
  MODAL_SPRING,
  POP_IN_SPRING,
  POP_SOFT_SPRING,
  POP_SPRING,
  POP_STAGGER,
  popHover,
  popInHidden,
  popInVisible,
  popListItemHidden,
  popListItemVisible,
  popModalBackdropHidden,
  popModalBackdropVisible,
  popModalPanelExit,
  popModalPanelHidden,
  popModalPanelVisible,
  popRestShadow,
  popSwapExit,
  popSwapHidden,
  popSwapVisible,
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
      initial={reduceMotion ? false : { ...popInHidden, y }}
      animate={popInVisible}
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
              hidden: popListItemHidden,
              visible: {
                ...popListItemVisible,
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
        initial={reduceMotion ? false : popSwapHidden}
        animate={popSwapVisible}
        exit={reduceMotion ? undefined : popSwapExit}
        transition={POP_SOFT_SPRING}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PopPage({
  pageKey,
  children,
  className,
}: {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        className={clsx("min-h-full", className)}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 1, transition: { duration: 0 } }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PopReveal({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          className={className}
          initial={reduceMotion ? false : { opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -4 }}
          transition={POP_SOFT_SPRING}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PopOverlay({
  open,
  onClose,
  children,
  className,
  panelClassName,
  align = "center",
  zIndexClass = "z-50",
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  align?: "center" | "bottom";
  zIndexClass?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={clsx(
            "fixed inset-0 flex bg-neutral-500/45 backdrop-blur-[2px]",
            zIndexClass,
            align === "bottom"
              ? "items-end justify-center p-0 sm:items-center sm:p-4"
              : "items-center justify-center p-4",
            className,
          )}
          role="presentation"
          initial={reduceMotion ? false : popModalBackdropHidden}
          animate={popModalBackdropVisible}
          exit={reduceMotion ? undefined : popModalBackdropHidden}
          transition={FADE_SPRING}
          onClick={onClose}
        >
          <motion.div
            className={panelClassName}
            initial={reduceMotion ? false : popModalPanelHidden}
            animate={popModalPanelVisible}
            exit={reduceMotion ? undefined : popModalPanelExit}
            transition={MODAL_SPRING}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
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
      initial={reduceMotion ? false : { opacity: 0, scale: 0.5, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
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
