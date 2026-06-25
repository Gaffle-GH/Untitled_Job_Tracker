"use client";

import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <OnboardingGate>
        <AppShell>{children}</AppShell>
      </OnboardingGate>
    </AppProvider>
  );
}
