import { MOCK_DISCOVER_JOBS } from "@/lib/mock-data";
import { geocodeLocation } from "@/lib/geocode";
import type { DiscoverJob } from "@/lib/types";

export interface JobSearchParams {
  location: string;
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  query?: string;
  openToRemote?: boolean;
}

export interface JobSearchResult {
  jobs: DiscoverJob[];
  geocoded: { latitude: number; longitude: number; displayName: string } | null;
  source: "adzuna" | "local" | "mock";
}

function normalizeAdzunaJob(raw: {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area?: string[] };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created: string;
}): DiscoverJob {
  const salary =
    raw.salary_min && raw.salary_max
      ? `$${Math.round(raw.salary_min / 1000)}k–$${Math.round(raw.salary_max / 1000)}k`
      : undefined;

  const locationName = raw.location.display_name;
  const remote = /remote/i.test(locationName) || /remote/i.test(raw.title);

  return {
    id: `adzuna-${raw.id}`,
    company: raw.company.display_name,
    title: raw.title,
    location: locationName,
    salary,
    description: raw.description.replace(/<[^>]+>/g, "").slice(0, 280),
    tags: raw.contract_type ? [raw.contract_type] : ["Job board"],
    remote,
    employmentType: raw.contract_type,
    postedAt: raw.created.split("T")[0] ?? new Date().toISOString().slice(0, 10),
    url: raw.redirect_url,
  };
}

async function searchAdzuna(
  params: JobSearchParams,
  geo: { latitude: number; longitude: number },
): Promise<DiscoverJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const country = process.env.ADZUNA_COUNTRY ?? "us";
  const url = new URL(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
  );
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", "20");
  url.searchParams.set("distance", String(params.radiusMiles ?? 25));
  url.searchParams.set("lat", String(geo.latitude));
  url.searchParams.set("lng", String(geo.longitude));
  if (params.query?.trim()) {
    url.searchParams.set("what", params.query.trim());
  }

  const response = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!response.ok) return [];

  const data = (await response.json()) as { results: Parameters<typeof normalizeAdzunaJob>[0][] };
  return (data.results ?? []).map(normalizeAdzunaJob);
}

function filterMockByLocation(
  jobs: DiscoverJob[],
  geo: { latitude: number; longitude: number } | null,
  params: JobSearchParams,
): DiscoverJob[] {
  const city = params.location.split(",")[0]?.trim().toLowerCase() ?? "";

  return jobs.filter((job) => {
    if (params.openToRemote && job.remote) return true;
    if (city && job.location.toLowerCase().includes(city)) return true;
    return false;
  });
}

export async function searchJobsNearby(params: JobSearchParams): Promise<JobSearchResult> {
  let geo: { latitude: number; longitude: number; displayName: string } | null = null;

  if (params.latitude != null && params.longitude != null) {
    geo = {
      latitude: params.latitude,
      longitude: params.longitude,
      displayName: params.location,
    };
  } else if (params.location.trim()) {
    const geocoded = await geocodeLocation(params.location);
    if (geocoded) {
      geo = geocoded;
    }
  }

  if (geo) {
    const adzunaJobs = await searchAdzuna(params, geo);
    if (adzunaJobs.length > 0) {
      return { jobs: adzunaJobs, geocoded: geo, source: "adzuna" };
    }
  }

  const enrichedMock = MOCK_DISCOVER_JOBS.map((job) => ({ ...job }));
  const filtered = filterMockByLocation(enrichedMock, geo, params);

  if (filtered.length > 0) {
    return {
      jobs: params.openToRemote
        ? [...filtered, ...enrichedMock.filter((j) => j.remote && !filtered.includes(j))]
        : filtered,
      geocoded: geo,
      source: geo ? "local" : "mock",
    };
  }

  return { jobs: enrichedMock, geocoded: geo, source: "mock" };
}
