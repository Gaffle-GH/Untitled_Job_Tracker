import { NextResponse } from "next/server";
import { getCurrentUser, ensureUserProfile, profileFromRecord } from "@/lib/auth/server";
import { isDatabaseConfigured } from "@/lib/db";
import { searchJobsNearby } from "@/lib/jobs/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location") ?? "";
  const query = url.searchParams.get("query") ?? undefined;
  const radiusMiles = Number.parseInt(url.searchParams.get("radius") ?? "25", 10);
  const latParam = url.searchParams.get("lat");
  const lngParam = url.searchParams.get("lng");
  const openToRemote = url.searchParams.get("remote") !== "0";

  let latitude: number | undefined;
  let longitude: number | undefined;
  let searchLocation = location;

  if (isDatabaseConfigured()) {
    const user = await getCurrentUser();
    if (user) {
      const profile = await ensureUserProfile(user.id);
      const parsed = profileFromRecord(profile);
      searchLocation = location || parsed.location;
      if (profile.latitude != null && profile.longitude != null) {
        latitude = profile.latitude;
        longitude = profile.longitude;
      }
    }
  }

  if (latParam && lngParam) {
    latitude = Number.parseFloat(latParam);
    longitude = Number.parseFloat(lngParam);
  }

  const result = await searchJobsNearby({
    location: searchLocation,
    latitude,
    longitude,
    radiusMiles: Number.isFinite(radiusMiles) ? radiusMiles : 25,
    query,
    openToRemote,
  });

  return NextResponse.json(result);
}
