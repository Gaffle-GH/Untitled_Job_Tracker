import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/server";
import {
  clearIntegrationToken,
  getAllIntegrationTokens,
  getIntegrationToken,
  setIntegrationToken,
} from "@/lib/db/integration-tokens";
import type { IntegrationProvider } from "@/lib/types";
import type { StoredIntegrationSession } from "./types";

const COOKIE_PREFIX = "jt-int-";

function cookieName(provider: IntegrationProvider) {
  return `${COOKIE_PREFIX}${provider}`;
}

async function getCookieSession(
  provider: IntegrationProvider,
): Promise<StoredIntegrationSession | null> {
  const jar = await cookies();
  const raw = jar.get(cookieName(provider))?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredIntegrationSession;
  } catch {
    return null;
  }
}

async function setCookieSession(session: StoredIntegrationSession) {
  const jar = await cookies();
  jar.set(cookieName(session.provider), JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function clearCookieSession(provider: IntegrationProvider) {
  const jar = await cookies();
  jar.delete(cookieName(provider));
}

export async function getSession(
  provider: IntegrationProvider,
): Promise<StoredIntegrationSession | null> {
  const user = await getCurrentUser();
  if (user) {
    return getIntegrationToken(user.id, provider);
  }
  return getCookieSession(provider);
}

export async function setSession(session: StoredIntegrationSession) {
  const user = await getCurrentUser();
  if (user) {
    await setIntegrationToken(user.id, session);
    return;
  }
  await setCookieSession(session);
}

export async function clearSession(provider: IntegrationProvider) {
  const user = await getCurrentUser();
  if (user) {
    await clearIntegrationToken(user.id, provider);
  }
  await clearCookieSession(provider);
}

export async function getAllSessions(): Promise<StoredIntegrationSession[]> {
  const user = await getCurrentUser();
  if (user) {
    return getAllIntegrationTokens(user.id);
  }

  const providers: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];
  const sessions = await Promise.all(providers.map((provider) => getCookieSession(provider)));
  return sessions.filter((session): session is StoredIntegrationSession => session !== null);
}
