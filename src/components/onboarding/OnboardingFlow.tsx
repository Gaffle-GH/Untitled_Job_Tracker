"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Compass,
  LayoutList,
  Link2,
  LogIn,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui";
import { PopBar, PopIn, PopSwap } from "@/components/motion/Pop";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import { useApp } from "@/lib/store";

const steps = ["welcome", "pipeline", "sources", "discover", "account"] as const;
type Step = (typeof steps)[number];

const sourcePreview = ["handshake", "linkedin", "indeed", "discover"] as const;

function StepIcon({
  icon: Icon,
  shellClassName,
  iconClassName,
}: {
  icon: LucideIcon;
  shellClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={clsx(
        "mx-auto mb-5 flex h-14 w-14 items-center justify-center border-[3px] border-black brutal-shadow-sm",
        shellClassName ?? "bg-black",
      )}
    >
      <Icon className={clsx("h-7 w-7", iconClassName ?? "text-accent-lime")} />
    </div>
  );
}

function StepTextBox({
  step,
  title,
  innerClassName,
  children,
  className,
}: {
  step: number;
  title: string;
  innerClassName?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full border-[3px] border-black bg-white p-2.5 brutal-shadow-sm">
      <div
        className={clsx(
          "space-y-3 border-[3px] border-black p-4 md:p-5",
          innerClassName ?? "bg-[#fffef5]",
          className,
        )}
      >
        <p className="brutal-label text-center">Step {step} of 5</p>
        <h2 className="brutal-heading text-center text-2xl">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>("welcome");

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLast = step === "account";

  const goNext = () => {
    const next = steps[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = steps[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const goToAuth = (path: "/login" | "/signup") => {
    completeOnboarding();
    router.push(path);
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
              <div>
                <StepIcon icon={Briefcase} shellClassName="bg-black" />
                <StepTextBox step={1} title={`Meet ${APP_NAME}`} innerClassName="bg-accent-yellow/40">
                  <p className="text-center text-sm font-medium leading-relaxed">{APP_TAGLINE}</p>
                  <p className="text-center text-sm font-bold leading-relaxed">
                    One place to track every application, see where you stand, and find new roles
                    without juggling spreadsheets and browser tabs.
                  </p>
                </StepTextBox>
              </div>
            )}

            {step === "pipeline" && (
              <div>
                <StepIcon icon={LayoutList} shellClassName="bg-accent-yellow" iconClassName="text-black" />
                <StepTextBox step={2} title="Your pipeline, organized" innerClassName="bg-accent-yellow/30">
                  <p className="text-center text-sm font-medium leading-relaxed">
                    See every role in a single list — company, status, source, comp, and dates.
                    Filter by stage, sort your way, and know exactly what needs a follow-up.
                  </p>
                  <ul className="space-y-2 border-[3px] border-black bg-white p-4 text-left text-xs font-bold uppercase">
                    <li className="flex items-center gap-2">
                      <span className="h-3 w-3 border-2 border-black bg-accent-cyan" />
                      Applied → interview → offer
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-3 w-3 border-2 border-black bg-accent-lime" />
                      Quick filters for active pipeline & offers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-3 w-3 border-2 border-black bg-accent-pink" />
                      Dashboard chart for the big picture
                    </li>
                  </ul>
                </StepTextBox>
              </div>
            )}

            {step === "sources" && (
              <div>
                <StepIcon icon={Link2} shellClassName="bg-accent-cyan" iconClassName="text-black" />
                <StepTextBox step={3} title="All your sources, one list" innerClassName="bg-accent-cyan/30">
                  <p className="text-center text-sm font-medium leading-relaxed">
                    Pull applications from job boards you already use — or add them manually. Each
                    source gets a color tag so you always know where a role came from.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {sourcePreview.map((source) => (
                      <span
                        key={source}
                        className="border-2 border-black px-2 py-1 text-[10px] font-bold uppercase"
                        style={{ backgroundColor: SOURCE_COLORS[source] }}
                      >
                        {SOURCE_LABELS[source]}
                      </span>
                    ))}
                    <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase">
                      Manual
                    </span>
                  </div>
                  <p className="text-center text-xs font-medium text-black/60">
                    Connect Handshake, LinkedIn & Indeed anytime in Settings.
                  </p>
                </StepTextBox>
              </div>
            )}

            {step === "discover" && (
              <div>
                <StepIcon icon={Compass} shellClassName="bg-accent-pink" iconClassName="text-black" />
                <StepTextBox step={4} title="Swipe to discover" innerClassName="bg-accent-pink/30">
                  <p className="text-center text-sm font-medium leading-relaxed">
                    Browse local roles matched to your profile. Swipe right to save, left to pass —
                    saved jobs flow straight into your pipeline.
                  </p>
                  <div className="flex justify-center gap-4 text-xs font-bold uppercase">
                    <span className="border-2 border-black bg-[#ff5757] px-3 py-2">← Pass</span>
                    <span className="border-2 border-black bg-accent-lime px-3 py-2">Save →</span>
                  </div>
                </StepTextBox>
              </div>
            )}

            {step === "account" && (
              <div>
                <StepIcon icon={Briefcase} shellClassName="bg-black" />
                <StepTextBox step={5} title="Ready to track?" innerClassName="bg-white">
                  <p className="text-center text-sm font-medium leading-relaxed">
                    Sign in to pick up where you left off, or create a free account to start building
                    your pipeline.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto gap-2 py-3 normal-case tracking-normal"
                      onClick={() => goToAuth("/login")}
                    >
                      <LogIn className="h-4 w-4 shrink-0" />
                      Sign in
                    </Button>
                    <Button
                      type="button"
                      className="h-auto gap-2 py-3 normal-case tracking-normal"
                      onClick={() => goToAuth("/signup")}
                    >
                      <UserPlus className="h-4 w-4 shrink-0" />
                      Create account
                    </Button>
                  </div>
                  <p className="text-center text-xs font-medium text-black/55">
                    Create an account with email and password to save your pipeline securely.
                  </p>
                </StepTextBox>
              </div>
            )}
          </PopSwap>

          <div
            className={clsx(
              "mt-8 flex flex-wrap gap-3",
              isLast ? "justify-center" : undefined,
            )}
          >
            {stepIndex > 0 && !isLast ? (
              <Button variant="outline" type="button" onClick={goBack}>
                Back
              </Button>
            ) : null}
            {!isLast ? (
              <Button type="button" className="flex-1" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <p className="w-full text-center text-sm font-bold">
                Already chose?{" "}
                <Link
                  href="/login"
                  onClick={() => completeOnboarding()}
                  className="underline underline-offset-4 hover:bg-accent-yellow"
                >
                  Go to sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </PopIn>
    </div>
  );
}
