"use client";

import Link from "next/link";
import { StatusChart } from "@/components/StatusChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { NearbyJobs } from "@/components/dashboard/NearbyJobs";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { PopBadge, PopIn, PopStagger } from "@/components/motion/Pop";
import { APP_NAME } from "@/lib/brand";
import { useApp } from "@/lib/store";

export default function DashboardPage() {
  const { user, integrations } = useApp();
  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="min-h-full">
      <PageShell>
        <PageHeader
          label="Dashboard"
          accent="cyan"
          title={user ? `Hey, ${user.name.split(" ")[0]}!` : APP_NAME}
          description="Track applications from Handshake, LinkedIn & Indeed — then swipe local jobs."
          action={
            <div className="flex flex-wrap gap-2">
              <PopBadge delay={0.1}>
                <span className="inline-flex w-fit shrink-0 items-center border-2 border-black bg-accent-lime px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-black">
                  {connectedCount}/3 linked
                </span>
              </PopBadge>
              <PopBadge delay={0.18}>
                <span className="inline-flex w-fit shrink-0 items-center border-2 border-black bg-accent-pink px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-black">
                  Live pipeline
                </span>
              </PopBadge>
            </div>
          }
        />

        <PopStagger className="space-y-8">
          <PopIn className="w-full" delay={0}>
            <KpiCards />
          </PopIn>
          <PopIn className="w-full" delay={0.05}>
            <StatusChart />
          </PopIn>
          <PopIn className="w-full" delay={0.1}>
            <NearbyJobs />
          </PopIn>
          <PopIn delay={0.14}>
            <p className="text-center text-sm font-bold uppercase tracking-wide">
              <Link href="/applications" className="underline underline-offset-4 hover:bg-accent-yellow">
                View all applications →
              </Link>
            </p>
          </PopIn>
        </PopStagger>
      </PageShell>
    </div>
  );
}
