import { NextResponse } from "next/server";
import { getIntegrationStatuses } from "@/lib/integrations/sync";

export async function GET() {
  const integrations = await getIntegrationStatuses();
  return NextResponse.json({ integrations });
}
