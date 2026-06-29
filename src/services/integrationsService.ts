import type { IntegrationSyncResult } from "@/lib/integrations/types";
import type { IntegrationProvider } from "@/lib/types";

export interface IntegrationStatusResponse {
  integrations: {
    provider: IntegrationProvider;
    connected: boolean;
    mode: "demo" | "live" | null;
    email?: string;
    connectedAt?: string;
    lastSyncedAt?: string;
    liveAvailable: boolean;
  }[];
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : "Request failed";
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchIntegrationStatuses() {
  const response = await fetch("/api/integrations", { cache: "no-store" });
  return parseJson<IntegrationStatusResponse>(response);
}

export async function syncIntegration(provider: IntegrationProvider) {
  const response = await fetch(`/api/integrations/${provider}/sync`, { method: "POST" });
  return parseJson<IntegrationSyncResult>(response);
}

export async function disconnectIntegration(provider: IntegrationProvider) {
  const response = await fetch(`/api/integrations/${provider}`, { method: "DELETE" });
  return parseJson<{ ok: boolean }>(response);
}

export function startIntegrationConnect(provider: IntegrationProvider) {
  window.location.assign(`/api/integrations/${provider}/connect`);
}
