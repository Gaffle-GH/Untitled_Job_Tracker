import type { JobApplication, User, UserProfile } from "@/lib/types";

export type MeResponse = {
  database: boolean;
  user: (User & { notifyOnStatusChange?: boolean }) | null;
  profile?: UserProfile;
  applications?: JobApplication[];
};

export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch("/api/auth/me", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load session");
  return response.json() as Promise<MeResponse>;
}

export async function loginWithApi(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Login failed");
  return data as {
    user: User & { notifyOnStatusChange: boolean };
    profile: UserProfile;
    applications: JobApplication[];
  };
}

export async function signupWithApi(email: string, name: string, password: string) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, name, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Signup failed");
  return data as {
    user: User;
    profile: UserProfile;
    applications: JobApplication[];
  };
}

export async function logoutWithApi() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function saveProfileApi(
  profile: UserProfile,
  notifyOnStatusChange?: boolean,
) {
  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...profile, notifyOnStatusChange }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Failed to save profile");
  return data as { profile: UserProfile; notifyOnStatusChange: boolean };
}

export async function patchApplicationStatus(id: string, status: JobApplication["status"]) {
  const response = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Failed to update status");
  return data as JobApplication;
}

export async function searchJobsApi(params: {
  location?: string;
  query?: string;
  radius?: number;
}) {
  const url = new URL("/api/jobs/search", window.location.origin);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.query) url.searchParams.set("query", params.query);
  if (params.radius) url.searchParams.set("radius", String(params.radius));

  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw new Error("Job search failed");
  return response.json() as Promise<{
    jobs: import("@/lib/types").DiscoverJob[];
    geocoded: { latitude: number; longitude: number; displayName: string } | null;
    source: string;
  }>;
}
