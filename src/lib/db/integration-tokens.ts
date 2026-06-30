import { prisma } from "@/lib/db";
import type { IntegrationProvider } from "@/lib/types";
import type { StoredIntegrationSession } from "@/lib/integrations/types";

function toStoredSession(record: {
  provider: string;
  mode: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  email: string | null;
  connectedAt: Date;
  lastSyncedAt: Date | null;
}): StoredIntegrationSession {
  return {
    provider: record.provider as IntegrationProvider,
    mode: record.mode as StoredIntegrationSession["mode"],
    accessToken: record.accessToken ?? undefined,
    refreshToken: record.refreshToken ?? undefined,
    expiresAt: record.expiresAt ? record.expiresAt.getTime() : undefined,
    email: record.email ?? undefined,
    connectedAt: record.connectedAt.toISOString(),
    lastSyncedAt: record.lastSyncedAt?.toISOString(),
  };
}

export async function getIntegrationToken(
  userId: string,
  provider: IntegrationProvider,
): Promise<StoredIntegrationSession | null> {
  const record = await prisma.integrationToken.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  return record ? toStoredSession(record) : null;
}

export async function setIntegrationToken(
  userId: string,
  session: StoredIntegrationSession,
) {
  await prisma.integrationToken.upsert({
    where: { userId_provider: { userId, provider: session.provider } },
    create: {
      userId,
      provider: session.provider,
      mode: session.mode,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
      email: session.email,
      connectedAt: session.connectedAt ? new Date(session.connectedAt) : new Date(),
      lastSyncedAt: session.lastSyncedAt ? new Date(session.lastSyncedAt) : null,
    },
    update: {
      mode: session.mode,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
      email: session.email,
      lastSyncedAt: session.lastSyncedAt ? new Date(session.lastSyncedAt) : null,
    },
  });
}

export async function clearIntegrationToken(userId: string, provider: IntegrationProvider) {
  await prisma.integrationToken.deleteMany({ where: { userId, provider } });
}

export async function getAllIntegrationTokens(userId: string) {
  const records = await prisma.integrationToken.findMany({ where: { userId } });
  return records.map(toStoredSession);
}
