"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

const PUBLIC_PATHS = ["/onboarding", "/login", "/signup"];

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { onboardingComplete, hydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;

    if (!onboardingComplete && !isPublic) {
      router.replace("/onboarding");
      return;
    }

    if (onboardingComplete && pathname === "/onboarding") {
      router.replace("/");
    }
  }, [hydrated, onboardingComplete, isPublic, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="brutal-heading text-lg">Loading…</p>
      </div>
    );
  }

  if (!onboardingComplete && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="brutal-heading text-lg">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
