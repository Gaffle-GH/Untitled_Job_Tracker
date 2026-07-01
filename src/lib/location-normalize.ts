import type { LocationSuggestion } from "@/lib/geocode";

const US_STATE_TO_ABBR: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

export type ParsedLocation = {
  city: string;
  state: string;
  stateAbbr: string;
  zipCode?: string;
  country: string;
};

export function abbreviateUsState(state: string) {
  const trimmed = state.trim();
  if (!trimmed) return "";
  if (/^[A-Z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  return US_STATE_TO_ABBR[trimmed.toLowerCase()] ?? trimmed;
}

export function parseLocationParts(value: string): ParsedLocation {
  const trimmed = value.trim();
  const zipMatch = trimmed.match(/\b(\d{5})(?:-\d{4})?\b/);
  const zipCode = zipMatch?.[1];
  const withoutZip = zipCode ? trimmed.replace(zipMatch![0], "").replace(/\s+/g, " ").trim() : trimmed;

  const parts = withoutZip
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const country =
    parts.length > 2 && parts[parts.length - 1].length > 2
      ? parts[parts.length - 1]
      : parts.length === 2 && /^[A-Z]{2}$/i.test(parts[1])
        ? "United States"
        : parts.length >= 3
          ? parts[parts.length - 1]
          : "United States";

  const city = parts[0] ?? "";
  let state = "";

  if (parts.length >= 2) {
    const second = parts[1];
    if (/^\d{5}/.test(second)) {
      state = "";
    } else if (parts.length === 2 && /^[A-Z]{2}$/i.test(second)) {
      state = second.toUpperCase();
    } else if (parts.length >= 3) {
      state = parts[1];
    } else {
      state = second;
    }
  }

  const stateAbbr = abbreviateUsState(state);

  return {
    city,
    state,
    stateAbbr,
    zipCode,
    country,
  };
}

export function locationPlaceKey(parts: Pick<ParsedLocation, "city" | "stateAbbr" | "country">) {
  return [parts.city, parts.stateAbbr, parts.country]
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join("|");
}

export function formatLocationDisplay(location: string, zipCode?: string) {
  const parsed = parseLocationParts(location);
  const zip = zipCode ?? parsed.zipCode;
  const isUs = parsed.country === "United States" || /^[A-Z]{2}$/i.test(parsed.state);

  if (isUs && parsed.city && parsed.stateAbbr) {
    return zip ? `${parsed.city}, ${parsed.stateAbbr} ${zip}` : `${parsed.city}, ${parsed.stateAbbr}`;
  }

  if (zip && !parsed.zipCode) {
    return `${location.trim()} ${zip}`.trim();
  }

  return location.trim();
}

export function normalizeLocationStorage(input: {
  label: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
}) {
  const parsed = parseLocationParts(input.label);
  const city = (input.city ?? parsed.city).trim();
  const stateRaw = (input.state ?? parsed.state).trim();
  const stateAbbr = abbreviateUsState(stateRaw);
  const zipCode = (input.zipCode ?? parsed.zipCode)?.trim() || undefined;
  const country = (input.country ?? parsed.country).trim() || "United States";
  const isUs = country === "United States" || country === "US" || /^[A-Z]{2}$/i.test(stateAbbr);

  if (isUs && city && stateAbbr) {
    return {
      location: `${city}, ${stateAbbr}`,
      zipCode,
    };
  }

  const location = zipCode ? input.label.replace(/\b\d{5}(?:-\d{4})?\b/, "").trim() : input.label.trim();
  return {
    location: location || input.label.trim(),
    zipCode,
  };
}

export function normalizeFromSuggestion(suggestion: LocationSuggestion) {
  const stored = normalizeLocationStorage({
    label: suggestion.label,
    zipCode: suggestion.zipCode,
    city: suggestion.city,
    state: suggestion.state,
    country: suggestion.country,
  });

  return {
    ...stored,
    display: formatLocationDisplay(stored.location, stored.zipCode),
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
  };
}

export function locationsRepresentSamePlace(a: string, b: string, zipA?: string, zipB?: string) {
  const parsedA = parseLocationParts(a);
  const parsedB = parseLocationParts(b);
  parsedA.zipCode = zipA ?? parsedA.zipCode;
  parsedB.zipCode = zipB ?? parsedB.zipCode;

  if (locationPlaceKey(parsedA) !== locationPlaceKey(parsedB)) return false;

  if (parsedA.zipCode && parsedB.zipCode) {
    return parsedA.zipCode === parsedB.zipCode;
  }

  return true;
}

function mergeSuggestionPair(
  current: LocationSuggestion,
  incoming: LocationSuggestion,
): LocationSuggestion {
  const currentStored = normalizeLocationStorage({
    label: current.label,
    zipCode: current.zipCode,
    city: current.city,
    state: current.state,
    country: current.country,
  });
  const incomingStored = normalizeLocationStorage({
    label: incoming.label,
    zipCode: incoming.zipCode,
    city: incoming.city,
    state: incoming.state,
    country: incoming.country,
  });

  const zipCode = incomingStored.zipCode ?? currentStored.zipCode;
  const location = incomingStored.location || currentStored.location;
  const display = formatLocationDisplay(location, zipCode);
  const parsed = parseLocationParts(location);

  return {
    id: current.id,
    label: display,
    country: incoming.country || current.country,
    continent: incoming.continent || current.continent,
    latitude: incoming.latitude,
    longitude: incoming.longitude,
    zipCode,
    city: parsed.city || incoming.city || current.city,
    state: parsed.stateAbbr || incoming.state || current.state,
  };
}

export function dedupeLocationSuggestions(suggestions: LocationSuggestion[]) {
  const merged = new Map<string, LocationSuggestion>();

  for (const suggestion of suggestions) {
    const stored = normalizeLocationStorage({
      label: suggestion.label,
      zipCode: suggestion.zipCode,
      city: suggestion.city,
      state: suggestion.state,
      country: suggestion.country,
    });
    const parsed = parseLocationParts(stored.location);
    parsed.zipCode = stored.zipCode;
    const key = locationPlaceKey(parsed);

    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        ...suggestion,
        label: formatLocationDisplay(stored.location, stored.zipCode),
        zipCode: stored.zipCode,
        city: parsed.city || suggestion.city,
        state: parsed.stateAbbr || suggestion.state,
      });
      continue;
    }

    merged.set(key, mergeSuggestionPair(existing, suggestion));
  }

  return Array.from(merged.values());
}

export function profileLocationCity(profile: { location: string; zipCode?: string }) {
  return parseLocationParts(profile.location).city.toLowerCase();
}
