import type { JobApplication, ApplicationStatus, JobSource } from "@/lib/types";

export function applicationToClient(record: {
  id: string;
  company: string;
  title: string;
  location: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  source: string;
  status: string;
  appliedAt: string;
  salary: string | null;
  url: string | null;
  notes: string | null;
  companyDomain: string | null;
  logoUrl: string | null;
}): JobApplication {
  return {
    id: record.id,
    company: record.company,
    title: record.title,
    location: record.location,
    ...(record.zipCode ? { zipCode: record.zipCode } : {}),
    ...(record.latitude != null ? { latitude: record.latitude } : {}),
    ...(record.longitude != null ? { longitude: record.longitude } : {}),
    source: record.source as JobSource,
    status: record.status as ApplicationStatus,
    appliedAt: record.appliedAt,
    salary: record.salary ?? undefined,
    url: record.url ?? undefined,
    notes: record.notes ?? undefined,
    companyDomain: record.companyDomain ?? undefined,
    logoUrl: record.logoUrl ?? undefined,
  };
}
