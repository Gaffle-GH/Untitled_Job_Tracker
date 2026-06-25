"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Compass, LayoutDashboard, Link2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { PopBar, PopIn, PopSwap } from "@/components/motion/Pop";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { useApp } from "@/lib/store";
import type { IntegrationProvider } from "@/lib/types";

const steps = ["welcome", "profile", "connect", "discover", "done"] as const;
type Step = (typeof steps)[number];

const integrations: { provider: IntegrationProvider; label: string }[] = [
  { provider: "handshake", label: "Handshake" },
  { provider: "linkedin", label: "LinkedIn" },
  { provider: "indeed", label: "Indeed" },
];

export function OnboardingFlow() {
  const router = useRouter();
  const {
    profile,
    setProfile,
    connectIntegration,
    integrations: connected,
    completeOnboarding,
  } = useApp();
  const [step, setStep] = useState<Step>("welcome");

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const goNext = () => {
    const next = steps[stepIndex + 1];
    if (next) {
      setStep(next);
      return;
    }
    completeOnboarding();
    router.push("/");
  };

  const goBack = () => {
    const prev = steps[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const finish = () => {
    completeOnboarding();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <PopIn className="w-full max-w-lg">
        <div className="mb-6 border-[3px] border-black bg-white p-2 brutal-shadow-sm">
          <PopBar progress={progress} />
        </div>

        <div className="border-[3px] border-black bg-white p-6 brutal-shadow-lg md:p-8">
          <PopSwap id={step}>
          {step === "welcome" && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-[3px] border-black bg-black brutal-shadow-sm">
                <Briefcase className="h-8 w-8 text-accent-lime" />
              </div>
              <p className="brutal-label mb-2">Step 1 of 5</p>
              <h1 className="brutal-heading text-3xl">Welcome to {APP_NAME}</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed">{APP_TAGLINE}</p>
              <p className="mt-4 text-sm font-bold">
                Track applications, connect job boards, and swipe local roles — all in one place.
              </p>
            </div>
          )}

          {step === "profile" && (
            <div className="space-y-4">
              <div>
                <p className="brutal-label mb-2">Step 2 of 5</p>
                <h2 className="brutal-heading text-2xl">Your job profile</h2>
                <p className="mt-2 text-sm font-medium">We use this to rank nearby jobs for you.</p>
              </div>
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
                <span className="brutal-label mb-2 block">Skills</span>
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
                <span className="text-sm font-bold uppercase">Open to remote</span>
              </label>
            </div>
          )}

          {step === "connect" && (
            <div className="space-y-4">
              <div>
                <p className="brutal-label mb-2">Step 3 of 5</p>
                <h2 className="brutal-heading text-2xl">Connect platforms</h2>
                <p className="mt-2 text-sm font-medium">Optional — sync applications from job boards.</p>
              </div>
              <div className="space-y-3">
                {integrations.map(({ provider, label }) => {
                  const isConnected = connected.find((i) => i.provider === provider)?.connected;
                  return (
                    <div
                      key={provider}
                      className="flex items-center justify-between gap-3 border-[3px] border-black bg-accent-yellow/40 p-3 brutal-shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        <span className="text-sm font-bold uppercase">{label}</span>
                      </div>
                      <Button
                        variant={isConnected ? "outline" : "default"}
                        size="sm"
                        type="button"
                        disabled={isConnected}
                        onClick={() => connectIntegration(provider)}
                      >
                        {isConnected ? "Connected" : "Connect"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === "discover" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border-[3px] border-black bg-accent-pink brutal-shadow-sm">
                <Compass className="h-7 w-7" />
              </div>
              <div>
                <p className="brutal-label mb-2">Step 4 of 5</p>
                <h2 className="brutal-heading text-2xl">Swipe to discover</h2>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Head to <strong>Discover</strong> and swipe right to save jobs, left to pass. Saved roles
                land in your Applications pipeline automatically.
              </p>
              <div className="flex justify-center gap-6 text-xs font-bold uppercase">
                <span className="border-2 border-black bg-[#ff4757] px-3 py-2">← Pass</span>
                <span className="border-2 border-black bg-accent-lime px-3 py-2">Save →</span>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border-[3px] border-black bg-accent-cyan brutal-shadow-sm">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <div>
                <p className="brutal-label mb-2">Step 5 of 5</p>
                <h2 className="brutal-heading text-2xl">You&apos;re all set</h2>
              </div>
              <p className="text-sm font-medium">
                Your dashboard is ready. Track your pipeline, explore nearby matches, and keep swiping.
              </p>
            </div>
          )}

          </PopSwap>

          <div className="mt-8 flex flex-wrap gap-3">
            {stepIndex > 0 && step !== "done" ? (
              <Button variant="outline" type="button" onClick={goBack}>
                Back
              </Button>
            ) : null}
            {step === "done" ? (
              <Button type="button" className="flex-1" onClick={finish}>
                Go to dashboard
              </Button>
            ) : (
              <Button type="button" className="flex-1" onClick={goNext}>
                {step === "connect" ? "Skip for now" : "Continue"}
              </Button>
            )}
          </div>
        </div>
      </PopIn>
    </div>
  );
}
