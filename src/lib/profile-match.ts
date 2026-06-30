import type { DiscoverJob, UserProfile } from "./types";

export interface ScoredJob {
  job: DiscoverJob;
  score: number;
  matchReasons: string[];
}

export function scoreJobForProfile(job: DiscoverJob, profile: UserProfile): ScoredJob {
  let score = 0;
  const matchReasons: string[] = [];
  const profileSkills = profile.skills.map((s) => s.toLowerCase());
  const roleWords = profile.rolePreference.toLowerCase().split(/\s+/);
  const titleLower = job.title.toLowerCase();
  const locationLower = profile.location.toLowerCase();
  const jobLocationLower = job.location.toLowerCase();

  for (const tag of job.tags) {
    if (profileSkills.some((s) => tag.toLowerCase().includes(s) || s.includes(tag.toLowerCase()))) {
      score += 12;
      matchReasons.push(tag);
    }
  }

  for (const word of roleWords) {
    if (word.length > 2 && titleLower.includes(word)) {
      score += 8;
      if (!matchReasons.includes("Role match")) matchReasons.push("Role match");
    }
  }

  if (job.remote && profile.openToRemote) {
    score += 10;
    if (!matchReasons.includes("Remote OK")) matchReasons.push("Remote OK");
  }

  const profileCity = locationLower.split(",")[0]?.trim();
  if (profile.latitude != null && profile.longitude != null && job.location) {
    score += 8;
    if (!matchReasons.includes("Location search")) matchReasons.push("Location search");
  } else if (profileCity && jobLocationLower.includes(profileCity)) {
    score += 15;
    if (!matchReasons.includes("Near you")) matchReasons.push("Near you");
  } else if (job.remote) {
    score += 5;
  }

  return { job, score, matchReasons: [...new Set(matchReasons)].slice(0, 3) };
}

export function getNearbyJobsForProfile(
  jobs: DiscoverJob[],
  profile: UserProfile,
  limit = 4,
): ScoredJob[] {
  return jobs
    .map((job) => scoreJobForProfile(job, profile))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
