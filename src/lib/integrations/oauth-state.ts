import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { IntegrationProvider } from "@/lib/types";

const STATE_COOKIE = "jt-oauth-state";

export async function createOAuthState(provider: IntegrationProvider) {
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(STATE_COOKIE, JSON.stringify({ provider, state }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return state;
}

export async function verifyOAuthState(provider: IntegrationProvider, state: string | null) {
  if (!state) return false;
  const jar = await cookies();
  const raw = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { provider: IntegrationProvider; state: string };
    return parsed.provider === provider && parsed.state === state;
  } catch {
    return false;
  }
}

export function demoEmail(provider: IntegrationProvider) {
  return `demo+${provider}@jobtracker.local`;
}

export function hashState(provider: IntegrationProvider, nonce: string) {
  return createHash("sha256").update(`${provider}:${nonce}`).digest("hex").slice(0, 24);
}
