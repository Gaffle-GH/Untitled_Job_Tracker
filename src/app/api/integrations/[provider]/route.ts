import { NextResponse } from "next/server";
import { clearSession } from "@/lib/integrations/token-store";
import type { IntegrationProvider } from "@/lib/types";

const PROVIDERS: IntegrationProvider[] = ["handshake", "linkedin", "indeed"];

function isProvider(value: string): value is IntegrationProvider {
  return PROVIDERS.includes(value as IntegrationProvider);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await params;
  if (!isProvider(rawProvider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  await clearSession(rawProvider);
  return NextResponse.json({ ok: true });
}
