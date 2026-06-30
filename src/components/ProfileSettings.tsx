"use client";

import { Card, CardContent, Input } from "@/components/ui";
import { useApp } from "@/lib/store";

export function ProfileSettings() {
  const { profile, setProfile, databaseMode, notifyOnStatusChange, setNotifyOnStatusChange } =
    useApp();

  return (
    <Card className="gap-0">
      <CardContent className="space-y-4 !p-5">
        <label className="block">
          <span className="brutal-label mb-2 block">Location</span>
          <Input
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="San Francisco, CA"
          />
        </label>
        <label className="block">
          <span className="brutal-label mb-2 block">Target role</span>
          <Input
            value={profile.rolePreference}
            onChange={(e) => setProfile({ ...profile, rolePreference: e.target.value })}
            placeholder="Software Engineer"
          />
        </label>
        <label className="block">
          <span className="brutal-label mb-2 block">Skills (comma separated)</span>
          <Input
            value={profile.skills.join(", ")}
            onChange={(e) =>
              setProfile({
                ...profile,
                skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="TypeScript, React, Python"
          />
        </label>
        <label className="flex items-center gap-3 border-[3px] border-black bg-accent-cyan/30 p-3">
          <input
            type="checkbox"
            checked={profile.openToRemote}
            onChange={(e) => setProfile({ ...profile, openToRemote: e.target.checked })}
            className="h-5 w-5 border-2 border-black accent-black"
          />
          <span className="text-sm font-bold uppercase">Open to remote roles</span>
        </label>
        {databaseMode ? (
          <label className="flex items-center gap-3 border-[3px] border-black bg-accent-yellow/40 p-3">
            <input
              type="checkbox"
              checked={notifyOnStatusChange}
              onChange={(e) => setNotifyOnStatusChange(e.target.checked)}
              className="h-5 w-5 border-2 border-black accent-black"
            />
            <span className="text-sm font-bold uppercase">Email me on status changes</span>
          </label>
        ) : null}
        <p className="text-xs font-medium">
          Location is geocoded for nearby job search. Used to rank jobs on your Dashboard and in
          Discover.
        </p>
      </CardContent>
    </Card>
  );
}
