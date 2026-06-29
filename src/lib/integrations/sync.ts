import type { IntegrationProvider } from "@/lib/types";
import { isProviderLive } from "./config";
import { syncHandshake } from "./providers/handshake";
import { syncIndeed } from "./providers/indeed";
import { syncLinkedIn } from "./providers/linkedin";
import { getSession } from "./token-store";
import type { IntegrationMode, IntegrationSyncResult } from "./types";

export async function syncProvider(provider: IntegrationProvider): Promise<IntegrationSyncResult> {
  const session = await getSession(provider);
  if (!session) {
    throw new Error(`${provider} is not connected`);
  }

  const mode: IntegrationMode = session.mode;
  const syncedAt = new Date().toISOString();

  if (provider === "handshake") {
    const { applications, availableJobs } = await syncHandshake(mode);
    return {
      provider,
      mode,
      applications,
      availableJobs,
      email: session.email ?? "handshake@connected",
      syncedAt,
    };
  }

  if (provider === "linkedin") {
    const result = await syncLinkedIn(mode, session.accessToken);
    return {
      provider,
      mode,
      applications: result.applications,
      availableJobs: result.availableJobs,
      email: result.email ?? session.email,
      syncedAt,
    };
  }

  const result = await syncIndeed(mode, session.accessToken);
  return {
    provider,
    mode,
    applications: result.applications,
    availableJobs: result.availableJobs,
    email: result.email ?? session.email,
    syncedAt,
  };
}

export async function getIntegrationStatuses() {
  const providers: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];

  return Promise.all(
    providers.map(async (provider) => {
      const session = await getSession(provider);
      return {
        provider,
        connected: Boolean(session),
        mode: session?.mode ?? null,
        email: session?.email,
        connectedAt: session?.connectedAt,
        lastSyncedAt: session?.lastSyncedAt,
        liveAvailable: isProviderLive(provider),
      };
    }),
  );
}
