import type { DiscoverJob } from "./types";

export function shuffleDiscoverJobs(jobs: DiscoverJob[]): DiscoverJob[] {
  const copy = [...jobs];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
