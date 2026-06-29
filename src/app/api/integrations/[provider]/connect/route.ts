import { NextResponse } from "next/server";
import {
  getIndeedAuthUrl,
  getLinkedInAuthUrl,
  isProviderLive,
} from "@/lib/integrations/config";
import { createOAuthState, demoEmail } from "@/lib/integrations/oauth-state";
import { setSession } from "@/lib/integrations/token-store";
import type { IntegrationProvider } from "@/lib/types";

const PROVIDERS: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];

function isProvider(value: string): value is IntegrationProvider {
  return PROVIDERS.includes(value as IntegrationProvider);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await params;
  if (!isProvider(rawProvider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const provider = rawProvider;
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const settingsUrl = new URL("/settings", appBase);

  if (provider === "handshake" && isProviderLive("handshake")) {
    const connectedAt = new Date().toISOString();
    await setSession({
      provider,
      mode: "live",
      email: "handshake@institution",
      connectedAt,
    });
    settingsUrl.searchParams.set("connected", provider);
    settingsUrl.searchParams.set("sync", "1");
    return NextResponse.redirect(settingsUrl);
  }

  if (provider === "linkedin" && isProviderLive("linkedin")) {
    const state = await createOAuthState(provider);
    return NextResponse.redirect(getLinkedInAuthUrl(state));
  }

  if (provider === "indeed" && isProviderLive("indeed")) {
    const state = await createOAuthState(provider);
    return NextResponse.redirect(getIndeedAuthUrl(state));
  }

  const demoCallback = new URL(`/api/integrations/${provider}/callback`, appBase);
  demoCallback.searchParams.set("demo", "1");
  return NextResponse.redirect(demoCallback);
}
