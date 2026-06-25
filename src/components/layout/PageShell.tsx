"use client";

import clsx from "clsx";
import { PopIn } from "@/components/motion/Pop";

const accentClasses = {
  cyan: "bg-accent-cyan",
  yellow: "bg-accent-yellow",
  pink: "bg-accent-pink",
  lime: "bg-accent-lime",
  purple: "bg-accent-purple",
  white: "bg-white",
} as const;

type PageAccent = keyof typeof accentClasses;

export function PageShell({
  children,
  className,
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 pb-24 pt-4 md:px-8 md:pb-8",
        fullWidth ? "max-w-6xl" : "max-w-4xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  label,
  title,
  description,
  accent = "cyan",
  action,
}: {
  label: string;
  title: string;
  description?: string;
  accent?: PageAccent;
  action?: React.ReactNode;
}) {
  return (
    <PopIn y={18}>
      <header
        className={clsx(
          "mb-8 border-[3px] border-black p-5 brutal-shadow-lg md:p-6",
          accentClasses[accent],
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="brutal-label mb-2">{label}</p>
            <h1 className="brutal-heading text-2xl md:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>
    </PopIn>
  );
}
