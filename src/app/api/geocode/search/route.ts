export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/geocode";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await searchLocations(query, 8);
  return NextResponse.json({ suggestions });
}
