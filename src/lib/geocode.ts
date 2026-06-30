export interface GeoPoint {
  latitude: number;
  longitude: number;
  displayName: string;
}

/** Geocode a city/address via OpenStreetMap Nominatim (free, no API key). */
export async function geocodeLocation(query: string): Promise<GeoPoint | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "TrackerJobApp/1.0 (job-tracker)" },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return null;

    const results = (await response.json()) as {
      lat: string;
      lon: string;
      display_name: string;
    }[];

    const hit = results[0];
    if (!hit) return null;

    return {
      latitude: Number.parseFloat(hit.lat),
      longitude: Number.parseFloat(hit.lon),
      displayName: hit.display_name,
    };
  } catch {
    return null;
  }
}

/** Haversine distance in miles between two lat/lng points. */
export function distanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
