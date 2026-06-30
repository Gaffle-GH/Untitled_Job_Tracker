"use client";

import { CardStack } from "@/components/CardStack";
import { PageHeader, PageShell } from "@/components/layout/PageShell";

export default function DiscoverPage() {
  return (
    <div className="discover-scene">
      <PageShell className="flex flex-col items-center">
        <PageHeader
          label="Discover"
          accent="pink"
          title="Swipe Jobs"
          description="Right to save · Left to pass · Includes jobs from connected platforms"
        />

        <CardStack />

        <p className="discover-scene-hint hidden md:block">← Pass · Save →</p>
      </PageShell>
    </div>
  );
}
