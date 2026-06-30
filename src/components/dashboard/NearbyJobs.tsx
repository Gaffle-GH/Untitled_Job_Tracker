"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { PopItem, PopPress, PopStagger, PopIn } from "@/components/motion/Pop";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useApp } from "@/lib/store";

export function NearbyJobs() {
  const { nearbyJobs, profile } = useApp();

  return (
    <Card accent="lime" className="gap-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Jobs Near You</CardTitle>
            <p className="mt-2 text-sm font-medium">
              Matched to your profile · {profile.location}
            </p>
          </div>
          <Link href="/discover">
            <Button variant="default" size="sm" className="gap-1">
              Swipe all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {nearbyJobs.length === 0 ? (
          <PopIn>
            <div className="border-[3px] border-black bg-white p-6 text-center brutal-shadow-sm">
            <Sparkles className="mx-auto mb-2 h-8 w-8" />
            <p className="font-bold">No matches right now</p>
            <p className="mt-1 text-sm">Update your profile in Settings or refresh Discover</p>
            <Link href="/settings" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Edit profile
              </Button>
            </Link>
          </div>
          </PopIn>
        ) : (
          <PopStagger className="space-y-3">
            {nearbyJobs.map(({ job, matchReasons }) => (
              <PopItem key={job.id}>
                <PopPress
                  className="flex flex-col gap-3 border-[3px] border-black bg-white p-4 sm:flex-row sm:items-stretch sm:gap-4"
                  shadow="2px 2px 0 0 #000000"
                >
              <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
              <CompanyLogo
                company={job.company}
                url={job.url}
                companyDomain={job.companyDomain}
                logoUrl={job.logoUrl}
                size="lg"
                rounded="lg"
                className="shrink-0 border-[3px] border-black brutal-shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">{job.title}</p>
                <p className="text-sm font-medium">{job.company}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                  {job.remote && " · Remote"}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {matchReasons.map((reason) => (
                    <Badge key={reason} variant="cyan" className="text-[10px]">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
              </div>
              {(job.salary || job.url) && (
                <div className="flex shrink-0 items-center justify-between gap-3 border-t-2 border-black/10 pt-3 sm:flex-col sm:items-end sm:justify-between sm:self-stretch sm:border-t-0 sm:pt-0">
                  {job.salary ? (
                    <p className="text-right text-xs font-bold">{job.salary}</p>
                  ) : null}
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex h-8 items-center justify-center gap-1 border-[3px] border-black bg-white px-3 text-xs font-bold uppercase tracking-wide brutal-shadow-sm transition-colors hover:bg-accent-cyan/30"
                    >
                      View
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  ) : null}
                </div>
              )}
                </PopPress>
              </PopItem>
            ))}
          </PopStagger>
        )}
      </CardContent>
    </Card>
  );
}
