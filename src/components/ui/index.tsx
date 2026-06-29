"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  POP_SPRING,
  POP_TAP_SPRING,
  popScaleHover,
  popScaleTap,
  popSmHover,
  popSmRestShadow,
  popSmTap,
} from "@/lib/motion-presets";

export function Card({
  className,
  children,
  accent,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { accent?: "yellow" | "cyan" | "pink" | "lime" | "purple" | "none" }) {
  return (
    <div
      className={clsx(
        "brutal-card flex flex-col gap-4 text-black",
        accent === "yellow" && "bg-accent-yellow",
        accent === "cyan" && "bg-accent-cyan",
        accent === "pink" && "bg-accent-pink",
        accent === "lime" && "bg-accent-lime",
        accent === "purple" && "bg-accent-purple",
        (!accent || accent === "none") && "bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("border-b-[3px] border-black px-5 pt-5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={clsx("brutal-heading text-lg leading-none", className)} {...props}>
      {children}
    </h4>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("px-5 pb-5 [&:last-child]:pb-5", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "lime" | "cyan" | "pink";
}) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit shrink-0 items-center border-2 border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        variant === "default" && "bg-black text-white",
        variant === "secondary" && "bg-white text-black",
        variant === "outline" && "bg-transparent text-black",
        variant === "lime" && "bg-accent-lime text-black",
        variant === "cyan" && "bg-accent-cyan text-black",
        variant === "pink" && "bg-accent-pink text-black",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Button({
  className,
  variant = "default",
  size = "default",
  pop = true,
  children,
  style,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof motion.button>, "children"> & {
  variant?: "default" | "outline" | "ghost" | "lime" | "pink" | "cyan" | "yellow";
  size?: "default" | "sm" | "icon";
  pop?: boolean;
  children?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const usePopShadow = pop && variant !== "ghost";

  return (
    <motion.button
      style={{
        ...(usePopShadow ? { boxShadow: popSmRestShadow } : undefined),
        ...style,
      }}
      whileHover={
        reduceMotion || props.disabled
          ? undefined
          : usePopShadow
            ? popSmHover
            : popScaleHover
      }
      whileTap={
        reduceMotion || props.disabled
          ? undefined
          : usePopShadow
            ? popSmTap
            : popScaleTap
      }
      transition={POP_TAP_SPRING}
      className={clsx(
        "inline-flex items-center justify-center border-[3px] border-black font-bold uppercase tracking-wide disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-black text-white hover:bg-black/90",
        variant === "outline" && "bg-white text-black",
        variant === "ghost" && "border-transparent bg-transparent shadow-none hover:bg-black/5",
        variant === "lime" && "bg-accent-lime text-black",
        variant === "pink" && "bg-accent-pink text-black",
        variant === "cyan" && "bg-accent-cyan text-black",
        variant === "yellow" && "bg-accent-yellow text-black",
        !usePopShadow && variant !== "ghost" && "brutal-shadow-sm",
        size === "default" && "h-10 px-4 py-2 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full border-[3px] border-black bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent-cyan",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex w-fit">
      <select
        className={clsx(
          "appearance-none border-[3px] border-black bg-white py-2 pl-3 pr-8 text-sm font-bold uppercase brutal-shadow-sm outline-none focus:ring-2 focus:ring-accent-cyan",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
        aria-hidden
      />
    </div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={clsx("h-[3px] w-full shrink-0 bg-black", className)} />;
}

export function Checkbox({
  id,
  checked,
  onChange,
  className,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="inline-flex shrink-0"
      whileTap={reduceMotion ? undefined : { scale: 0.86 }}
      transition={POP_TAP_SPRING}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={clsx("h-5 w-5 border-2 border-black accent-black", className)}
      />
    </motion.span>
  );
}
