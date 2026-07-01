"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import type { IntegrationProvider } from "@/lib/types";

const PROVIDERS: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];

function isProvider(value: string | null): value is IntegrationProvider {
  return value !== null && PROVIDERS.includes(value as IntegrationProvider);
}

export function IntegrationSyncHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { syncIntegration } = useApp();
  const handled = useRef<string | null>(null);
  const connected = searchParams.get("connected");
  const syncParam = searchParams.get("sync");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    const shouldSync = syncParam === "1";
    const key = `${connected ?? ""}:${shouldSync}:${errorParam ?? ""}`;
    if (handled.current === key) return;
    handled.current = key;

    if (!isProvider(connected) || !shouldSync) return;

    void syncIntegration(connected).finally(() => {
      router.replace("/settings");
    });
  }, [connected, syncParam, errorParam, router, syncIntegration]);

  return null;
}
