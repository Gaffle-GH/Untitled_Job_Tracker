import type { LocationSuggestion } from "@/lib/geocode";
import {
  abbreviateUsState,
  formatLocationDisplay,
  normalizeLocationStorage,
} from "@/lib/location-normalize";

type ZippopotamResponse = {
  "post code": string;
  country: string;
  "country abbreviation": string;
  places: Array<{
    "place name": string;
    latitude: string;
    longitude: string;
    state: string;
    "state abbreviation": string;
  }>;
};

type PhotonZipFeature = {
  properties: {
    osm_id: number;
    name?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    osm_value?: string;
  };
  geometry: { coordinates: [number, number] };
};

/** 5-digit US ZIP or ZIP+4 (e.g. 90210 or 90210-1234). */
export function parseUsZipQuery(query: string) {
  const match = query.trim().match(/^(\d{5})(?:-(\d{4}))?$/);
  if (!match) return null;
  return { zip: match[1] };
}

export function isUsZipInput(query: string) {
  return /^\d{2,5}(-\d{0,4})?$/.test(query.trim());
}

export function formatUsZipLabel(city: string, state: string, zip: string) {
  const statePart = abbreviateUsState(state.trim());
  const cityPart = city.trim();
  if (cityPart && statePart) return `${cityPart}, ${statePart} ${zip}`;
  if (cityPart) return `${cityPart}, ${zip}`;
  return `${zip}, United States`;
}

function suggestionFromZip(
  zip: string,
  city: string,
  state: string,
  latitude: number,
  longitude: number,
  id: string,
): LocationSuggestion {
  const stored = normalizeLocationStorage({
    label: formatUsZipLabel(city, state, zip),
    zipCode: zip,
    city,
    state,
    country: "United States",
  });

  return {
    id,
    label: formatLocationDisplay(stored.location, stored.zipCode),
    country: "United States",
    continent: "North America",
    latitude,
    longitude,
    zipCode: stored.zipCode,
    city: stored.location.split(",")[0]?.trim(),
    state: stored.location.split(",")[1]?.trim(),
  };
}

export async function lookupUsZip(zip: string): Promise<LocationSuggestion | null> {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: "no-store" });
    if (!response.ok) return null;

    const data = (await response.json()) as ZippopotamResponse;
    const place = data.places[0];
    if (!place) return null;

    return suggestionFromZip(
      data["post code"],
      place["place name"],
      place["state abbreviation"],
      Number.parseFloat(place.latitude),
      Number.parseFloat(place.longitude),
      `zip-${zip}`,
    );
  } catch {
    return null;
  }
}

export async function searchUsZipSuggestions(
  query: string,
  limit = 8,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  const parsed = parseUsZipQuery(trimmed);

  if (parsed) {
    const exact = await lookupUsZip(parsed.zip);
    return exact ? [exact] : [];
  }

  if (!/^\d{2,4}$/.test(trimmed)) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", String(Math.max(limit * 4, 20)));
  url.searchParams.set("lang", "en");

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) return [];

    const data = (await response.json()) as { features?: PhotonZipFeature[] };
    const suggestions: LocationSuggestion[] = [];
    const seen = new Set<string>();

    for (const feature of data.features ?? []) {
      const props = feature.properties;
      if (props.countrycode !== "US" || props.osm_value !== "postcode") continue;

      const zip = props.name?.trim();
      if (!zip || !zip.startsWith(trimmed)) continue;
      if (seen.has(zip)) continue;
      seen.add(zip);

      const [longitude, latitude] = feature.geometry.coordinates;
      const city = props.city ?? props.county ?? "";
      const state = props.state ?? "";

      suggestions.push(
        suggestionFromZip(zip, city, state, latitude, longitude, `zip-photon-${props.osm_id}`),
      );

      if (suggestions.length >= limit) break;
    }

    return suggestions;
  } catch {
    return [];
  }
}
