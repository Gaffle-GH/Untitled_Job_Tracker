import { NextResponse } from "next/server";
import { isProviderLive } from "@/lib/integrations/config";
import { demoEmail, verifyOAuthState } from "@/lib/integrations/oauth-state";
import { exchangeIndeedCode } from "@/lib/integrations/providers/indeed";
import { exchangeLinkedInCode } from "@/lib/integrations/providers/linkedin";
import { setSession } from "@/lib/integrations/token-store";
import type { IntegrationProvider } from "@/lib/types";

const PROVIDERS: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];

function isProvider(value: string): value is IntegrationProvider {
  return PROVIDERS.includes(value as IntegrationProvider);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await params;
  if (!isProvider(rawProvider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const provider = rawProvider;
  const url = new URL(request.url);
  const settingsUrl = new URL("/settings", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  settingsUrl.searchParams.set("connected", provider);
  settingsUrl.searchParams.set("sync", "1");

  const isDemo = url.searchParams.get("demo") === "1";

  try {
    if (isDemo || !isProviderLive(provider)) {
      await setSession({
        provider,
        mode: "demo",
        email: demoEmail(provider),
        connectedAt: new Date().toISOString(),
      });
      return NextResponse.redirect(settingsUrl);
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const validState = await verifyOAuthState(provider, state);
    if (!code || !validState) {
      settingsUrl.searchParams.set("error", "oauth_failed");
      return NextResponse.redirect(settingsUrl);
    }

    if (provider === "linkedin") {
      const tokens = await exchangeLinkedInCode(code);
      await setSession({
        provider,
        mode: "live",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        email: tokens.email,
        connectedAt: new Date().toISOString(),
      });
    } else if (provider === "indeed") {
      const tokens = await exchangeIndeedCode(code);
      await setSession({
        provider,
        mode: "live",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        email: tokens.email,
        connectedAt: new Date().toISOString(),
      });
    }

    return NextResponse.redirect(settingsUrl);
  } catch {
    settingsUrl.searchParams.delete("sync");
    settingsUrl.searchParams.set("error", "connect_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
