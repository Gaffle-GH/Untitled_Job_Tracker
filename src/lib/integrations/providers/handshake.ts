import type { ApplicationStatus, DiscoverJob, JobApplication } from "@/lib/types";
import { getDemoApplications, getDemoAvailableJobs } from "@/lib/integrations/demo-data";
import type { IntegrationMode } from "../types";

const HANDSHAKE_STATUS_MAP: Record<string, ApplicationStatus> = {
  applied: "applied",
  pending: "applied",
  reviewing: "applied",
  interview: "phone_screen",
  interviewing: "phone_screen",
  offer: "offer",
  hired: "accepted",
  declined: "rejected",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

function mapHandshakeStatus(raw: string | undefined): ApplicationStatus {
  if (!raw) return "applied";
  return HANDSHAKE_STATUS_MAP[raw.toLowerCase()] ?? "applied";
}

function handshakeBaseUrl(eduId: string) {
  return `https://edu-api.joinhandshake.com:444/edu/v1/${eduId}`;
}

async function handshakeFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.HANDSHAKE_API_KEY;
  const eduId = process.env.HANDSHAKE_EDU_ID;
  if (!apiKey || !eduId) throw new Error("Handshake API credentials are not configured");

  const response = await fetch(`${handshakeBaseUrl(eduId)}${path}`, {
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Handshake API error (${response.status}): ${body.slice(0, 200)}`);
  }

  return response.json() as Promise<T>;
}

type HandshakeList<T> = { data?: T[]; results?: T[] };

type HandshakeApplication = {
  id: string | number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  job?: {
    title?: string;
    employer_name?: string;
    location?: string;
    salary?: string;
    url?: string;
  };
};

type HandshakeJob = {
  id: string | number;
  title?: string;
  employer_name?: string;
  location?: string;
  salary?: string;
  description?: string;
  employment_type?: string;
  remote?: boolean;
  url?: string;
  created_at?: string;
};

function normalizeHandshakeApplication(row: HandshakeApplication): JobApplication {
  const job = row.job ?? {};
  const company = job.employer_name ?? "Unknown employer";
  return {
    id: `handshake-${row.id}`,
    company,
    title: job.title ?? "Role",
    location: job.location ?? "—",
    source: "handshake",
    status: mapHandshakeStatus(row.status),
    appliedAt: (row.created_at ?? row.updated_at ?? new Date().toISOString()).slice(0, 10),
    salary: job.salary,
    url: job.url,
    companyDomain: company.toLowerCase().replace(/\s+/g, "") + ".com",
  };
}

function normalizeHandshakeJob(row: HandshakeJob): DiscoverJob {
  const company = row.employer_name ?? "Employer";
  return {
    id: `handshake-job-${row.id}`,
    source: "handshake",
    company,
    title: row.title ?? "Open role",
    location: row.location ?? "—",
    salary: row.salary,
    description: row.description ?? "Open role synced from Handshake.",
    tags: ["Handshake"],
    remote: Boolean(row.remote),
    employmentType: row.employment_type,
    postedAt: (row.created_at ?? new Date().toISOString()).slice(0, 10),
    url: row.url ?? "https://joinhandshake.com",
    companyDomain: company.toLowerCase().replace(/\s+/g, "") + ".com",
  };
}

export async function syncHandshake(mode: IntegrationMode) {
  if (mode === "demo") {
    return {
      applications: getDemoApplications("handshake"),
      availableJobs: getDemoAvailableJobs("handshake"),
    };
  }

  const [applicationsPayload, jobsPayload] = await Promise.all([
    handshakeFetch<HandshakeList<HandshakeApplication>>("/applications?page_size=50"),
    handshakeFetch<HandshakeList<HandshakeJob>>("/jobs?page_size=50"),
  ]);

  const applicationRows = applicationsPayload.data ?? applicationsPayload.results ?? [];
  const jobRows = jobsPayload.data ?? jobsPayload.results ?? [];

  return {
    applications: applicationRows.map(normalizeHandshakeApplication),
    availableJobs: jobRows.map(normalizeHandshakeJob),
  };
}
