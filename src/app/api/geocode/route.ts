import { NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/geocode";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location")?.trim() ?? "";

  if (!location) {
    return NextResponse.json({ error: "location is required" }, { status: 400 });
  }

  const geocoded = await geocodeLocation(location);
  if (!geocoded) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({ geocoded });
}
