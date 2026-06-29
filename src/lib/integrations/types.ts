import type { DiscoverJob, IntegrationProvider, JobApplication } from "@/lib/types";

export type IntegrationMode = "demo" | "live";

export interface StoredIntegrationSession {
  provider: IntegrationProvider;
  mode: IntegrationMode;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
}

export interface IntegrationSyncResult {
  provider: IntegrationProvider;
  mode: IntegrationMode;
  applications: JobApplication[];
  availableJobs: DiscoverJob[];
  email?: string;
  syncedAt: string;
}

export interface IntegrationStatus {
  provider: IntegrationProvider;
  connected: boolean;
  mode: IntegrationMode | null;
  email?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  liveAvailable: boolean;
}
