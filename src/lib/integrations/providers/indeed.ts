import type { DiscoverJob, JobApplication } from "@/lib/types";
import { getDemoApplications, getDemoAvailableJobs } from "@/lib/integrations/demo-data";
import type { IntegrationMode } from "../types";

async function fetchIndeedApplications(accessToken: string): Promise<JobApplication[]> {
  void accessToken;
  return [];
}

async function fetchIndeedJobs(accessToken: string): Promise<DiscoverJob[]> {
  void accessToken;
  return [];
}

export async function syncIndeed(mode: IntegrationMode, accessToken?: string) {
  if (mode === "demo") {
    return {
      applications: getDemoApplications("indeed"),
      availableJobs: getDemoAvailableJobs("indeed"),
      email: "demo@indeed.com",
    };
  }

  if (!accessToken) throw new Error("Indeed session is missing an access token");

  const [applications, availableJobs] = await Promise.all([
    fetchIndeedApplications(accessToken),
    fetchIndeedJobs(accessToken),
  ]);

  if (applications.length === 0 && availableJobs.length === 0) {
    return {
      applications: getDemoApplications("indeed"),
      availableJobs: getDemoAvailableJobs("indeed"),
      email: "indeed@connected",
      partnerApiPending: true,
    };
  }

  return {
    applications,
    availableJobs,
    email: "indeed@connected",
  };
}

export async function exchangeIndeedCode(code: string) {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/integrations/indeed/callback`;
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.INDEED_CLIENT_ID!,
    client_secret: process.env.INDEED_CLIENT_SECRET!,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://apis.indeed.com/oauth/v2/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error("Indeed token exchange failed");
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    email: "indeed@connected",
  };
}
