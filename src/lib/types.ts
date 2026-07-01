export type ApplicationStatus =
  | "applied"
  | "rejected"
  | "phone_screen"
  | "technical"
  | "onsite"
  | "final_round"
  | "offer"
  | "accepted"
  | "withdrawn";

export type JobSource = "handshake" | "linkedin" | "indeed" | "manual" | "discover";

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  location: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  source: JobSource;
  status: ApplicationStatus;
  appliedAt: string;
  salary?: string;
  url?: string;
  /** Known domain for logo lookup, e.g. stripe.com */
  companyDomain?: string;
  /** Direct logo URL when provided by an integration */
  logoUrl?: string;
  notes?: string;
}

export interface DiscoverJob {
  id: string;
  company: string;
  title: string;
  location: string;
  salary?: string;
  description: string;
  tags: string[];
  remote: boolean;
  employmentType?: string;
  benefits?: string[];
  postedAt: string;
  url?: string;
  companyDomain?: string;
  logoUrl?: string;
  /** Platform this listing was synced from */
  source?: IntegrationProvider;
}

export type IntegrationProvider = "handshake" | "linkedin" | "indeed";

export type IntegrationMode = "demo" | "live";

export interface IntegrationConnection {
  provider: IntegrationProvider;
  connected: boolean;
  connectedAt?: string;
  email?: string;
  mode?: IntegrationMode;
  lastSyncedAt?: string;
  applicationCount?: number;
  availableJobCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile {
  location: string;
  zipCode?: string;
  rolePreference: string;
  skills: string[];
  openToRemote: boolean;
  latitude?: number;
  longitude?: number;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  location: "San Francisco, CA",
  rolePreference: "",
  skills: [],
  openToRemote: true,
};

export type ChartView = "bar" | "donut";

export type SortField = "progress" | "appliedAt" | "company" | "title" | "status";

/** Higher = further along in the pipeline (for sorting). */
export const STATUS_PROGRESS_ORDER: Record<ApplicationStatus, number> = {
  withdrawn: -2,
  rejected: -1,
  applied: 1,
  phone_screen: 2,
  technical: 3,
  onsite: 4,
  final_round: 5,
  offer: 6,
  accepted: 7,
};
export type SortDirection = "asc" | "desc";

export interface DashboardFilters {
  source: JobSource | "all";
  status: ApplicationStatus | "all";
  timePeriod: "all" | "2026" | "2025" | "90d" | "30d";
  locationScope: "all" | "near_me" | "remote";
}

export type ProfileDocumentType = "resume" | "cover_letter";

export interface ProfileDocumentMeta {
  type: ProfileDocumentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface ChartSelection {
  status: ApplicationStatus | null;
  source: JobSource | null;
}

export interface ListFilters {
  selectedSources: JobSource[];
  selectedStatuses: ApplicationStatus[];
  searchQuery: string;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  source: "all",
  status: "all",
  timePeriod: "all",
  locationScope: "all",
};

export const DEFAULT_LIST_FILTERS: ListFilters = {
  selectedSources: [],
  selectedStatuses: [],
  searchQuery: "",
};

export const CHART_PALETTE = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export const STATUS_QUICK_FILTERS: { label: string; statuses: ApplicationStatus[] }[] = [
  { label: "Active Pipeline", statuses: ["applied", "phone_screen", "technical", "onsite", "final_round"] },
  { label: "Interview Stage", statuses: ["phone_screen", "technical", "onsite", "final_round"] },
  { label: "Offers", statuses: ["offer", "accepted"] },
  { label: "Closed Out", statuses: ["rejected", "withdrawn"] },
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  rejected: "Rejected",
  phone_screen: "Phone Screen",
  technical: "Technical",
  onsite: "On-site",
  final_round: "Final Round",
  offer: "Offer",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "#70d6ff",
  rejected: "#ff6b9d",
  phone_screen: "#b388ff",
  technical: "#ffe066",
  onsite: "#b388ff",
  final_round: "#ff6b9d",
  offer: "#c8ff00",
  accepted: "#c8ff00",
  withdrawn: "#e5e5e5",
};

/** High-level buckets for the dashboard status chart. */
export type DashboardStatusGroup =
  | "ongoing"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export const DASHBOARD_STATUS_GROUP_ORDER: DashboardStatusGroup[] = [
  "ongoing",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const STATUS_GROUP_LABELS: Record<DashboardStatusGroup, string> = {
  ongoing: "In Progress",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_GROUP_DESCRIPTIONS: Record<DashboardStatusGroup, string> = {
  ongoing: "Applied — awaiting a response",
  interview: "Any interview round",
  offer: "Offer received or accepted",
  rejected: "Application declined",
  withdrawn: "You withdrew from the process",
};

export const STATUS_GROUP_COLORS: Record<DashboardStatusGroup, string> = {
  ongoing: "#70D6FF",
  interview: "#C8FF00",
  offer: "#FFE066",
  rejected: "#FF6B9D",
  withdrawn: "#999999",
};

export const STATUS_TO_GROUP: Record<ApplicationStatus, DashboardStatusGroup> = {
  applied: "ongoing",
  phone_screen: "interview",
  technical: "interview",
  onsite: "interview",
  final_round: "interview",
  offer: "offer",
  accepted: "offer",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

export function getStatusesForGroup(group: DashboardStatusGroup): ApplicationStatus[] {
  return (Object.entries(STATUS_TO_GROUP) as [ApplicationStatus, DashboardStatusGroup][])
    .filter(([, g]) => g === group)
    .map(([status]) => status);
}

export function countByStatusGroup(
  applications: { status: ApplicationStatus }[],
): Record<DashboardStatusGroup, number> {
  const counts: Record<DashboardStatusGroup, number> = {
    ongoing: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  };
  for (const app of applications) {
    counts[STATUS_TO_GROUP[app.status]] += 1;
  }
  return counts;
}

export const SOURCE_LABELS: Record<JobSource, string> = {
  handshake: "Handshake",
  linkedin: "LinkedIn",
  indeed: "Indeed",
  manual: "Manual",
  discover: "Discover",
};

export const SOURCE_COLORS: Record<JobSource, string> = {
  discover: "#ff5757",
  handshake: "#c8ff00",
  linkedin: "#70d6ff",
  indeed: "#1a3a6b",
  manual: "#ffffff",
};

export const SOURCE_TEXT_COLORS: Record<JobSource, string> = {
  discover: "#000000",
  handshake: "#000000",
  linkedin: "#000000",
  indeed: "#ffffff",
  manual: "#000000",
};
