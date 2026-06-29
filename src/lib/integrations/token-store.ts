import { cookies } from "next/headers";
import type { IntegrationProvider } from "@/lib/types";
import type { StoredIntegrationSession } from "./types";

const COOKIE_PREFIX = "jt-int-";

function cookieName(provider: IntegrationProvider) {
  return `${COOKIE_PREFIX}${provider}`;
}

export async function getSession(
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

export async function setSession(session: StoredIntegrationSession) {
  const jar = await cookies();
  jar.set(cookieName(session.provider), JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(provider: IntegrationProvider) {
  const jar = await cookies();
  jar.delete(cookieName(provider));
}

export async function getAllSessions(): Promise<StoredIntegrationSession[]> {
  const providers: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];
  const sessions = await Promise.all(providers.map((provider) => getSession(provider)));
  return sessions.filter((session): session is StoredIntegrationSession => session !== null);
}
