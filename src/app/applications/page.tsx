"use client";

import { Suspense } from "react";
import { ApplicationsPageContent } from "@/components/applications/ApplicationsPageContent";

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center p-8 text-sm font-bold uppercase tracking-wide">
          Loading applications…
        </div>
      }
    >
      <ApplicationsPageContent />
    </Suspense>
  );
}
