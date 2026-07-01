import type { JobApplication, User, UserProfile } from "@/lib/types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

async function parseApiJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? fallbackMessage,
      response.status,
    );
  }
  return data as T;
}

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
  return parseApiJson<JobApplication>(response, "Failed to update status");
}

export async function patchApplicationNotes(id: string, notes: string | null) {
  const response = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ notes }),
  });
  return parseApiJson<JobApplication>(response, "Failed to update notes");
}

export async function createApplicationApi(job: Omit<JobApplication, "id">) {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(job),
  });
  return parseApiJson<JobApplication>(response, "Failed to create application");
}

export async function deleteApplicationApi(id: string) {
  const response = await fetch(`/api/applications/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new ApiError(data.error ?? "Failed to delete application", response.status);
  }
}

export async function geocodeLocationApi(location: string) {
  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("location", location);
  const response = await fetch(url.toString());
  if (!response.ok) return null;
  const data = (await response.json()) as {
    geocoded: { latitude: number; longitude: number; displayName: string };
  };
  return data.geocoded;
}

export async function searchLocationsApi(query: string, signal?: AbortSignal) {
  const url = new URL("/api/geocode/search", window.location.origin);
  url.searchParams.set("q", query);
  const response = await fetch(url.toString(), { signal });
  if (!response.ok) return [];
  const data = (await response.json()) as {
    suggestions: import("@/lib/geocode").LocationSuggestion[];
  };
  return data.suggestions;
}

export async function fetchProfileDocumentsApi() {
  const response = await fetch("/api/profile/documents", { credentials: "include" });
  return parseApiJson<{ documents: import("@/lib/types").ProfileDocumentMeta[] }>(
    response,
    "Failed to load documents",
  );
}

export async function uploadProfileDocumentApi(
  type: import("@/lib/types").ProfileDocumentType,
  file: File,
) {
  const formData = new FormData();
  formData.set("type", type);
  formData.set("file", file);
  const response = await fetch("/api/profile/documents", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return parseApiJson<{ document: import("@/lib/types").ProfileDocumentMeta }>(
    response,
    "Failed to upload document",
  );
}

export async function deleteProfileDocumentApi(
  type: import("@/lib/types").ProfileDocumentType,
) {
  const response = await fetch(`/api/profile/documents/${type}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseApiJson<{ ok: boolean }>(response, "Failed to delete document");
}

export async function searchJobsApi(params: {
  location?: string;
  query?: string;
  radius?: number;
  openToRemote?: boolean;
}) {
  const url = new URL("/api/jobs/search", window.location.origin);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.query) url.searchParams.set("query", params.query);
  if (params.radius) url.searchParams.set("radius", String(params.radius));
  if (params.openToRemote === false) url.searchParams.set("remote", "0");

  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw new Error("Job search failed");
  return response.json() as Promise<{
    jobs: import("@/lib/types").DiscoverJob[];
    geocoded: { latitude: number; longitude: number; displayName: string } | null;
    source: string;
  }>;
}
