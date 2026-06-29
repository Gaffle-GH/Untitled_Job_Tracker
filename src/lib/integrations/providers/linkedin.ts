import type { ApplicationStatus, DiscoverJob, JobApplication } from "@/lib/types";
import { getDemoApplications, getDemoAvailableJobs } from "@/lib/integrations/demo-data";
import type { IntegrationMode } from "../types";

const LINKEDIN_STATUS_MAP: Record<string, ApplicationStatus> = {
  APPLIED: "applied",
  REVIEWED: "applied",
  INTERVIEW: "phone_screen",
  OFFER: "offer",
  HIRED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
};

async function fetchLinkedInProfile(accessToken: string) {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ email?: string; name?: string }>;
}

/** Partner Job Applications API — requires LinkedIn Talent Solutions approval. */
async function fetchLinkedInApplications(accessToken: string): Promise<JobApplication[]> {
  void accessToken;
  return [];
}

async function fetchLinkedInJobPostings(accessToken: string): Promise<DiscoverJob[]> {
  void accessToken;
  return [];
}

export async function syncLinkedIn(mode: IntegrationMode, accessToken?: string) {
  if (mode === "demo") {
    return {
      applications: getDemoApplications("linkedin"),
      availableJobs: getDemoAvailableJobs("linkedin"),
      email: "demo@linkedin.com",
    };
  }

  if (!accessToken) throw new Error("LinkedIn session is missing an access token");

  const profile = await fetchLinkedInProfile(accessToken);
  const [applications, availableJobs] = await Promise.all([
    fetchLinkedInApplications(accessToken),
    fetchLinkedInJobPostings(accessToken),
  ]);

  if (applications.length === 0 && availableJobs.length === 0) {
    return {
      applications: getDemoApplications("linkedin"),
      availableJobs: getDemoAvailableJobs("linkedin"),
      email: profile?.email ?? "linkedin@connected",
      partnerApiPending: true,
    };
  }

  return {
    applications,
    availableJobs,
    email: profile?.email,
  };
}

export async function exchangeLinkedInCode(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/integrations/linkedin/callback`,
  });

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error("LinkedIn token exchange failed");
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  const profile = await fetchLinkedInProfile(payload.access_token);

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    email: profile?.email ?? "linkedin@connected",
  };
}

export function mapLinkedInStatus(raw: string | undefined): ApplicationStatus {
  if (!raw) return "applied";
  return LINKEDIN_STATUS_MAP[raw.toUpperCase()] ?? "applied";
}
