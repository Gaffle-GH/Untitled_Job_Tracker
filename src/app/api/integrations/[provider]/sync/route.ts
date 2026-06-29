import { NextResponse } from "next/server";
import { syncProvider } from "@/lib/integrations/sync";
import { getSession, setSession } from "@/lib/integrations/token-store";
import type { IntegrationProvider } from "@/lib/types";

const PROVIDERS: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];

function isProvider(value: string): value is IntegrationProvider {
  return PROVIDERS.includes(value as IntegrationProvider);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await params;
  if (!isProvider(rawProvider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const provider = rawProvider;
  const session = await getSession(provider);
  if (!session) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  try {
    const result = await syncProvider(provider);
    await setSession({
      ...session,
      lastSyncedAt: result.syncedAt,
      email: result.email ?? session.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
