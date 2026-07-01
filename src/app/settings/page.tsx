"use client";

import { Suspense } from "react";
import { ExportSettings } from "@/components/settings/ExportSettings";
import { IntegrationSettings } from "@/components/IntegrationSettings";
import { IntegrationSyncHandler } from "@/components/IntegrationSyncHandler";
import { IntegrationErrorBanner } from "@/components/settings/IntegrationErrorBanner";
import { PageHeader, PageShell, SectionTitle } from "@/components/layout/PageShell";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";
import Link from "next/link";
import { User } from "lucide-react";

export default function SettingsPage() {
  const { user } = useApp();

  return (
    <div className="min-h-full">
      <Suspense fallback={null}>
        <IntegrationSyncHandler />
        <IntegrationErrorBanner />
      </Suspense>
      <PageShell>
        <PageHeader
          label="Settings"
          accent="purple"
          title="Your Setup"
          description="Account, profile, exports & platform connections"
        />

        <div className="space-y-10">
          <section>
            <SectionTitle>Account</SectionTitle>
            {user ? (
              <Card accent="cyan" className="gap-0">
                <CardContent className="flex items-center gap-4 !p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-black bg-accent-yellow">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black">{user.name}</p>
                    <p className="truncate text-sm font-medium">{user.email}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="gap-0">
                <CardContent className="!p-5 text-center">
                  <p className="font-medium">Sign in to sync your data</p>
                  <Link href="/login" className="mt-4 inline-block">
                    <span className="brutal-card-hover inline-block border-[3px] border-black bg-black px-6 py-2.5 text-sm font-bold uppercase text-white brutal-shadow-sm">
                      Sign in
                    </span>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <SectionTitle>Job Profile</SectionTitle>
            <ProfileSettings />
          </section>

          <section>
            <SectionTitle>Exporting</SectionTitle>
            <ExportSettings />
          </section>

          <section id="integrations">
            <SectionTitle>Connected Platforms</SectionTitle>
            <IntegrationSettings />
          </section>
        </div>
      </PageShell>
    </div>
  );
}
