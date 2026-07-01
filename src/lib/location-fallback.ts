import type { LocationSuggestion } from "@/lib/geocode";

/** Offline fallback when geocoding APIs are unavailable. */
const FALLBACK_LOCATIONS: LocationSuggestion[] = [
  {
    id: "fb-sf",
    label: "San Francisco, California, United States",
    country: "United States",
    continent: "North America",
    latitude: 37.7879,
    longitude: -122.4075,
  },
  {
    id: "fb-nyc",
    label: "New York, New York, United States",
    country: "United States",
    continent: "North America",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "fb-la",
    label: "Los Angeles, California, United States",
    country: "United States",
    continent: "North America",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: "fb-chicago",
    label: "Chicago, Illinois, United States",
    country: "United States",
    continent: "North America",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: "fb-austin",
    label: "Austin, Texas, United States",
    country: "United States",
    continent: "North America",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  {
    id: "fb-seattle",
    label: "Seattle, Washington, United States",
    country: "United States",
    continent: "North America",
    latitude: 47.6062,
    longitude: -122.3321,
  },
  {
    id: "fb-toronto",
    label: "Toronto, Ontario, Canada",
    country: "Canada",
    continent: "North America",
    latitude: 43.6532,
    longitude: -79.3832,
  },
  {
    id: "fb-london",
    label: "London, England, United Kingdom",
    country: "United Kingdom",
    continent: "Europe",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    id: "fb-paris",
    label: "Paris, Île-de-France, France",
    country: "France",
    continent: "Europe",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    id: "fb-berlin",
    label: "Berlin, Germany",
    country: "Germany",
    continent: "Europe",
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    id: "fb-tokyo",
    label: "Tokyo, Japan",
    country: "Japan",
    continent: "Asia",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    id: "fb-singapore",
    label: "Singapore",
    country: "Singapore",
    continent: "Asia",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    id: "fb-sydney",
    label: "Sydney, New South Wales, Australia",
    country: "Australia",
    continent: "Oceania",
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    id: "fb-mumbai",
    label: "Mumbai, Maharashtra, India",
    country: "India",
    continent: "Asia",
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: "fb-saopaulo",
    label: "São Paulo, Brazil",
    country: "Brazil",
    continent: "South America",
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    id: "fb-mexico",
    label: "Mexico City, Mexico",
    country: "Mexico",
    continent: "North America",
    latitude: 19.4326,
    longitude: -99.1332,
  },
  {
    id: "fb-us",
    label: "United States",
    country: "United States",
    continent: "North America",
    latitude: 39.8283,
    longitude: -98.5795,
  },
  {
    id: "fb-ca",
    label: "Canada",
    country: "Canada",
    continent: "North America",
    latitude: 56.1304,
    longitude: -106.3468,
  },
  {
    id: "fb-uk",
    label: "United Kingdom",
    country: "United Kingdom",
    continent: "Europe",
    latitude: 55.3781,
    longitude: -3.436,
  },
  {
    id: "fb-fr",
    label: "France",
    country: "France",
    continent: "Europe",
    latitude: 46.2276,
    longitude: 2.2137,
  },
  {
    id: "fb-de",
    label: "Germany",
    country: "Germany",
    continent: "Europe",
    latitude: 51.1657,
    longitude: 10.4515,
  },
  {
    id: "fb-in",
    label: "India",
    country: "India",
    continent: "Asia",
    latitude: 20.5937,
    longitude: 78.9629,
  },
  {
    id: "fb-au",
    label: "Australia",
    country: "Australia",
    continent: "Oceania",
    latitude: -25.2744,
    longitude: 133.7751,
  },
];

export function searchFallbackLocations(query: string, limit = 8): LocationSuggestion[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const scored = FALLBACK_LOCATIONS.map((location) => {
    const label = location.label.toLowerCase();
    const country = location.country.toLowerCase();
    const continent = location.continent.toLowerCase();
    let score = 0;
    if (label.startsWith(needle)) score += 3;
    else if (label.includes(needle)) score += 2;
    if (country.startsWith(needle)) score += 2;
    if (country.includes(needle)) score += 1;
    if (continent.includes(needle)) score += 1;
    return { location, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.location);
}
