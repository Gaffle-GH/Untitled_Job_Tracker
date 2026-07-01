import { continentForCountryCode } from "@/lib/country-continent";
import { dedupeLocationSuggestions, formatLocationDisplay, normalizeLocationStorage } from "@/lib/location-normalize";
import { searchFallbackLocations } from "@/lib/location-fallback";
import {
  formatUsZipLabel,
  isUsZipInput,
  lookupUsZip,
  parseUsZipQuery,
  searchUsZipSuggestions,
} from "@/lib/us-zip";

export interface GeoPoint {
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface LocationSuggestion {
  id: string;
  label: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
  zipCode?: string;
  city?: string;
  state?: string;
}

type PhotonProperties = {
  osm_id: number;
  name?: string;
  city?: string;
  state?: string;
  region?: string;
  country?: string;
  countrycode?: string;
  type?: string;
  osm_value?: string;
  county?: string;
};

type PhotonFeature = {
  properties: PhotonProperties;
  geometry: { coordinates: [number, number] };
};

const PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "locality",
  "county",
  "state",
  "country",
  "district",
  "hamlet",
]);

function formatPhotonLabel(props: PhotonProperties) {
  const name = props.name?.trim();
  if (!name) return "";

  const parts: string[] = [name];
  if (props.state && props.state !== name) parts.push(props.state);
  if (props.country && !parts.includes(props.country)) parts.push(props.country);
  return parts.join(", ");
}

function photonToSuggestion(feature: PhotonFeature): LocationSuggestion | null {
  const props = feature.properties;

  if (props.countrycode === "US" && props.osm_value === "postcode" && props.name) {
    const [longitude, latitude] = feature.geometry.coordinates;
    const city = props.city ?? props.county ?? "";
    const state = props.state ?? "";
    const zipCode = props.name;
    const stored = normalizeLocationStorage({
      label: formatUsZipLabel(city, state, zipCode),
      zipCode,
      city,
      state,
      country: "United States",
    });
    return {
      id: `photon-${props.osm_id}`,
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

  const type = props.type;
  if (type && !PLACE_TYPES.has(type)) return null;

  const label = formatPhotonLabel(props);
  if (!label) return null;

  const [longitude, latitude] = feature.geometry.coordinates;
  const city = props.name?.trim() ?? "";
  const stored = normalizeLocationStorage({
    label,
    city,
    state: props.state ?? props.region,
    country: props.country ?? "Unknown",
  });

  return {
    id: `photon-${props.osm_id}`,
    label: formatLocationDisplay(stored.location, stored.zipCode),
    country: props.country ?? "Unknown",
    continent: continentForCountryCode(props.countrycode),
    latitude,
    longitude,
    zipCode: stored.zipCode,
    city,
    state: props.state ?? props.region,
  };
}

async function fetchPhoton(query: string, limit: number): Promise<LocationSuggestion[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lang", "en");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return [];

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const suggestions: LocationSuggestion[] = [];

  for (const feature of data.features ?? []) {
    const suggestion = photonToSuggestion(feature);
    if (suggestion) suggestions.push(suggestion);
  }

  return suggestions;
}

/** Geocode a city/address — US ZIP, Photon, then offline fallback. */
export async function geocodeLocation(query: string): Promise<GeoPoint | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const zipQuery = parseUsZipQuery(trimmed);
  if (zipQuery) {
    const zipHit = await lookupUsZip(zipQuery.zip);
    if (zipHit) {
      const stored = normalizeLocationStorage({
        label: zipHit.label,
        zipCode: zipHit.zipCode,
        city: zipHit.city,
        state: zipHit.state,
        country: zipHit.country,
      });
      return {
        latitude: zipHit.latitude,
        longitude: zipHit.longitude,
        displayName: formatLocationDisplay(stored.location, stored.zipCode),
      };
    }
  }

  try {
    const photonResults = await fetchPhoton(trimmed, 1);
    const hit = photonResults[0];
    if (hit) {
      return {
        latitude: hit.latitude,
        longitude: hit.longitude,
        displayName: hit.label,
      };
    }
  } catch {
    /* try fallback */
  }

  const fallback = searchFallbackLocations(trimmed, 1)[0];
  if (!fallback) return null;

  return {
    latitude: fallback.latitude,
    longitude: fallback.longitude,
    displayName: fallback.label,
  };
}

/** Return multiple location suggestions for autocomplete. */
export async function searchLocations(query: string, limit = 8): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const collected: LocationSuggestion[] = [];

  if (isUsZipInput(trimmed)) {
    collected.push(...(await searchUsZipSuggestions(trimmed, limit)));
  }

  try {
    const photonResults = await fetchPhoton(trimmed, limit);
    collected.push(...photonResults);
  } catch {
    /* try fallback */
  }

  if (collected.length === 0) {
    collected.push(...searchFallbackLocations(trimmed, limit));
  }

  return dedupeLocationSuggestions(collected).slice(0, limit);
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
