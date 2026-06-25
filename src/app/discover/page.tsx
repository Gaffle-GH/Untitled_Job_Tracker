"use client";

import { CardStack } from "@/components/CardStack";
import { PageHeader, PageShell } from "@/components/layout/PageShell";

export default function DiscoverPage() {
  return (
    <div className="discover-scene">
      <PageShell className="flex flex-col items-center pb-28">
        <PageHeader
          label="Discover"
          accent="pink"
          title="Swipe Jobs"
          description="Right to save · Left to pass"
        />

        <CardStack />

        <p className="discover-scene-hint">← Pass · Save →</p>
      </PageShell>
    </div>
  );
}
