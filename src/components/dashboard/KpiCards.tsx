"use client";

import { Briefcase, DollarSign, TrendingUp, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { POP_IN_SPRING } from "@/lib/motion-presets";
import { useApp } from "@/lib/store";

const ACCENTS = ["bg-accent-cyan", "bg-accent-pink", "bg-accent-lime", "bg-accent-yellow"] as const;

const stats = [
  {
    key: "total" as const,
    label: "Total Applications",
    icon: Briefcase,
    format: (v: number) => String(v),
    sub: () => "Current selection",
  },
  {
    key: "interview" as const,
    label: "In Interview",
    icon: Users,
    format: (v: number) => String(v),
    sub: () => "Active pipeline",
  },
  {
    key: "offers" as const,
    label: "Offers",
    icon: DollarSign,
    format: (v: number) => String(v),
    sub: () => "Offer & accepted",
  },
  {
    key: "responseRate" as const,
    label: "Response Rate",
    icon: TrendingUp,
    format: (v: number) => `${v.toFixed(1)}%`,
    sub: (s: { rejected: number }) => `${s.rejected} rejected`,
  },
];

export function KpiCards() {
  const { dashboardStats } = useApp();
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, format, sub }, index) => (
        <motion.div
          key={key}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...POP_IN_SPRING, delay: reduceMotion ? 0 : index * 0.06 }}
          className="border-[3px] border-black bg-white p-4 brutal-shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-black/55">{label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums leading-none sm:text-3xl">
                {format(dashboardStats[key])}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase text-black/45">{sub(dashboardStats)}</p>
            </div>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black ${ACCENTS[index % ACCENTS.length]}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
