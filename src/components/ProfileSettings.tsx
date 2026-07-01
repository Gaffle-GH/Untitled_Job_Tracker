"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Compass,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  Wifi,
} from "lucide-react";
import { Badge, Button, Card, CardContent, Checkbox, Input, LocationAutocomplete } from "@/components/ui";
import { DocumentUploadSection } from "@/components/profile/DocumentUpload";
import { useApp } from "@/lib/store";
import { pickRandomSkillSuggestions } from "@/lib/skill-suggestions";
import {
  formatLocationDisplay,
  normalizeFromSuggestion,
  normalizeLocationStorage,
} from "@/lib/location-normalize";
import type { UserProfile } from "@/lib/types";
import type { LocationSuggestion } from "@/lib/geocode";

function profileCompleteness(profile: UserProfile) {
  let score = 0;
  if (profile.location.trim()) score += 25;
  if (profile.rolePreference.trim()) score += 25;
  if (profile.skills.length > 0) score += 25;
  if (profile.openToRemote || profile.location.trim()) score += 25;
  return score;
}

function normalizeSkill(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [suggestionSeed, setSuggestionSeed] = useState(0);

  const suggestions = useMemo(
    () => pickRandomSkillSuggestions(skills),
    [skills, suggestionSeed],
  );

  const addSkill = (raw: string) => {
    const next = normalizeSkill(raw);
    if (!next) return;
    const exists = skills.some((skill) => skill.toLowerCase() === next.toLowerCase());
    if (exists) return;
    onChange([...skills, next]);
    setDraft("");
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((entry) => entry !== skill));
  };

  return (
    <div className="space-y-3">
      <div className="flex min-h-[2.75rem] flex-wrap gap-2 border-[3px] border-black bg-white p-2 brutal-shadow-sm">
        {skills.length === 0 ? (
          <span className="px-1 py-1 text-xs font-medium text-black/45">
            Add classes, tools, certifications, or strengths from any field
          </span>
        ) : (
          skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => removeSkill(skill)}
              className="inline-flex items-center gap-1 border-2 border-black bg-accent-lime px-2 py-0.5 text-[10px] font-bold uppercase hover:bg-accent-yellow"
              title={`Remove ${skill}`}
            >
              {skill}
              <span aria-hidden>×</span>
            </button>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addSkill(draft);
            }
          }}
          placeholder="Public speaking, Excel, lab work, Spanish…"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 normal-case tracking-normal"
          disabled={!draft.trim()}
          onClick={() => addSkill(draft)}
        >
          Add
        </Button>
      </div>

      <div className="space-y-2">
        <div className="border-[3px] border-black bg-neutral-50 p-3 brutal-shadow-sm">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-black/55">
              Suggested for you
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px] normal-case tracking-normal"
              onClick={() => setSuggestionSeed((seed) => seed + 1)}
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              New ideas
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSkill(suggestion)}
                className="group inline-flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1.5 text-left transition-colors hover:bg-accent-lime brutal-shadow-sm hover:-translate-y-px"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center border border-black bg-accent-cyan/70 text-[10px] font-black leading-none group-hover:bg-accent-yellow">
                  +
                </span>
                <span className="text-xs font-semibold leading-tight">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSettings() {
  const {
    profile,
    setProfile,
    databaseMode,
    user,
    notifyOnStatusChange,
    setNotifyOnStatusChange,
    nearbyJobs,
  } = useApp();

  const [locationDraft, setLocationDraft] = useState(
    formatLocationDisplay(profile.location, profile.zipCode),
  );

  useEffect(() => {
    setLocationDraft(formatLocationDisplay(profile.location, profile.zipCode));
  }, [profile.location, profile.zipCode]);

  const commitLocation = (
    location: string,
    coords?: { latitude: number; longitude: number },
    zipCode?: string,
  ) => {
    const stored = normalizeLocationStorage({ label: location, zipCode });
    setProfile({
      ...profile,
      location: stored.location,
      ...(stored.zipCode ? { zipCode: stored.zipCode } : { zipCode: undefined }),
      ...(coords
        ? { latitude: coords.latitude, longitude: coords.longitude }
        : { latitude: undefined, longitude: undefined }),
    });
  };

  const completeness = useMemo(() => profileCompleteness(profile), [profile]);
  const hasGeocode = profile.latitude != null && profile.longitude != null;
  const hasLocation = profile.location.trim().length > 0;

  const matchingHints = [
    hasLocation ? "Nearby jobs on your dashboard" : "Add a location for nearby matches",
    profile.rolePreference.trim()
      ? `Roles like “${profile.rolePreference}” rank higher in Discover`
      : "Set a target role to improve title matching",
    profile.skills.length > 0
      ? `${profile.skills.length} strength${profile.skills.length === 1 ? "" : "s"} used to match job listings`
      : "Add strengths, coursework, or tools from your background",
    profile.openToRemote ? "Remote roles are included in search" : "Remote roles are deprioritized",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <Card accent="cyan" className="gap-0">
        <CardContent className="!p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black bg-white/60 px-5 py-4">
            <div>
              <p className="brutal-heading text-base">Your job search profile</p>
              <p className="mt-1 text-xs font-medium text-black/60">
                Works for any major or career path — internships, grad school, full-time, and more
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={completeness === 100 ? "lime" : "secondary"} className="text-[10px]">
                {completeness}% complete
              </Badge>
              {databaseMode && user ? (
                <Badge variant="cyan" className="text-[10px]">
                  Auto-saved
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Saved in browser
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                  <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-accent-pink">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  Location
                </span>
                <LocationAutocomplete
                  value={locationDraft}
                  onChange={setLocationDraft}
                  onBlur={() => {
                    if (
                      locationDraft.trim() !==
                      formatLocationDisplay(profile.location, profile.zipCode).trim()
                    ) {
                      commitLocation(locationDraft);
                    }
                  }}
                  onSelect={(suggestion: LocationSuggestion) => {
                    const normalized = normalizeFromSuggestion(suggestion);
                    setLocationDraft(normalized.display);
                    setProfile({
                      ...profile,
                      location: normalized.location,
                      ...(normalized.zipCode ? { zipCode: normalized.zipCode } : { zipCode: undefined }),
                      latitude: normalized.latitude,
                      longitude: normalized.longitude,
                    });
                  }}
                  placeholder="City, US ZIP, or country…"
                />
                <div className="flex flex-wrap gap-1.5">
                  {hasGeocode ? (
                    <Badge variant="lime" className="text-[9px]">
                      Geocoded for search
                    </Badge>
                  ) : hasLocation || locationDraft.trim() ? (
                    <Badge variant="secondary" className="text-[9px]">
                      Geocodes when you finish typing
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px]">
                      Required for nearby jobs
                    </Badge>
                  )}
                </div>
              </label>

              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                  <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-accent-yellow">
                    <Briefcase className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  Target role
                </span>
                <Input
                  value={profile.rolePreference}
                  onChange={(e) => setProfile({ ...profile, rolePreference: e.target.value })}
                  placeholder="Marketing analyst, nurse, teacher, analyst…"
                />
                <p className="text-[10px] font-medium text-black/50">
                  Job titles you&apos;re aiming for — any industry
                </p>
              </label>
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-accent-lime">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                </span>
                Strengths & experience
              </span>
              <p className="text-[10px] font-medium text-black/50">
                Not just coding — coursework, clubs, certifications, languages, and soft skills count
              </p>
              <SkillsEditor
                skills={profile.skills}
                onChange={(skills) => setProfile({ ...profile, skills })}
              />
            </div>

            <DocumentUploadSection databaseMode={databaseMode} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                htmlFor="profile-open-remote"
                className="flex cursor-pointer items-start gap-3 border-[3px] border-black bg-white p-4 brutal-shadow-sm"
              >
                <Checkbox
                  id="profile-open-remote"
                  checked={profile.openToRemote}
                  onChange={() => setProfile({ ...profile, openToRemote: !profile.openToRemote })}
                  className="mt-0.5"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-bold uppercase">
                    <Wifi className="h-3.5 w-3.5" aria-hidden />
                    Open to remote
                  </span>
                  <span className="mt-1 block text-xs font-medium text-black/55">
                    Include remote listings in Discover and job search
                  </span>
                </span>
              </label>

              {databaseMode ? (
                <label
                  htmlFor="profile-notify"
                  className="flex cursor-pointer items-start gap-3 border-[3px] border-black bg-accent-yellow/35 p-4 brutal-shadow-sm"
                >
                  <Checkbox
                    id="profile-notify"
                    checked={notifyOnStatusChange}
                    onChange={() => setNotifyOnStatusChange(!notifyOnStatusChange)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="text-sm font-bold uppercase">Status email alerts</span>
                    <span className="mt-1 block text-xs font-medium text-black/55">
                      Get emailed when an application status changes
                    </span>
                  </span>
                </label>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <div className="border-[3px] border-black bg-white p-4 brutal-shadow-sm">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
            <Target className="h-3.5 w-3.5" aria-hidden />
            Matching preview
          </p>
          <ul className="mt-3 space-y-2">
            {matchingHints.map((hint) => (
              <li
                key={hint}
                className="border-l-[3px] border-black/20 pl-2.5 text-xs font-medium leading-relaxed"
              >
                {hint}
              </li>
            ))}
          </ul>
          {nearbyJobs.length > 0 ? (
            <p className="mt-3 text-[10px] font-bold uppercase text-black/55">
              {nearbyJobs.length} nearby match{nearbyJobs.length === 1 ? "" : "es"} on dashboard
            </p>
          ) : null}
        </div>

        <div className="border-[3px] border-black bg-accent-purple/25 p-4 brutal-shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide">Try it out</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/discover">
              <Button type="button" variant="pink" size="sm" className="w-full gap-1.5">
                <Compass className="h-3.5 w-3.5" aria-hidden />
                Open Discover
              </Button>
            </Link>
            <Link href="/">
              <Button type="button" variant="outline" size="sm" className="w-full gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                View dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="h-2 border-2 border-black bg-white">
          <div
            className="h-full border-r-2 border-black bg-accent-cyan transition-[width] duration-300"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </aside>
    </div>
  );
}
