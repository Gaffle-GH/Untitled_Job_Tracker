"use client";

import clsx from "clsx";
import { CalendarDays, Filter, Globe, Layers, MapPin, RotateCcw } from "lucide-react";
import { SectionTitle } from "@/components/layout/PageShell";
import { Badge, Button, Dropdown } from "@/components/ui";
import { useApp } from "@/lib/store";
import {
  DEFAULT_DASHBOARD_FILTERS,
  SOURCE_LABELS,
  STATUS_LABELS,
  type ApplicationStatus,
  type DashboardFilters,
  type JobSource,
} from "@/lib/types";

const sources: (JobSource | "all")[] = [
  "all",
  "handshake",
  "linkedin",
  "indeed",
  "manual",
  "discover",
];

const statuses: (ApplicationStatus | "all")[] = [
  "all",
  "applied",
  "phone_screen",
  "technical",
  "onsite",
  "final_round",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
];

const periods: DashboardFilters["timePeriod"][] = ["all", "2026", "2025", "90d", "30d"];

const locationScopes: DashboardFilters["locationScope"][] = ["all", "near_me", "remote"];

const locationScopeLabels: Record<DashboardFilters["locationScope"], string> = {
  all: "All Locations",
  near_me: "Near Me",
  remote: "Remote Only",
};

const periodLabels: Record<DashboardFilters["timePeriod"], string> = {
  all: "All Time",
  "2026": "2026",
  "2025": "2025",
  "90d": "Last 90 Days",
  "30d": "Last 30 Days",
};

const sourceOptions = sources.map((source) => ({
  value: source,
  label: source === "all" ? "All Sources" : SOURCE_LABELS[source],
}));

const statusOptions = statuses.map((status) => ({
  value: status,
  label: status === "all" ? "All Statuses" : STATUS_LABELS[status],
}));

const periodOptions = periods.map((period) => ({
  value: period,
  label: periodLabels[period],
}));

const locationOptions = locationScopes.map((scope) => ({
  value: scope,
  label: locationScopeLabels[scope],
}));

const filterFields = [
  {
    key: "source" as const,
    label: "Source",
    icon: Layers,
    accent: "bg-accent-cyan",
  },
  {
    key: "status" as const,
    label: "Status",
    icon: Globe,
    accent: "bg-accent-pink",
  },
  {
    key: "timePeriod" as const,
    label: "Time Period",
    icon: CalendarDays,
    accent: "bg-accent-lime",
  },
  {
    key: "locationScope" as const,
    label: "Location",
    icon: MapPin,
    accent: "bg-accent-yellow",
  },
];

function countActiveFilters(filters: DashboardFilters) {
  let count = 0;
  if (filters.source !== "all") count += 1;
  if (filters.status !== "all") count += 1;
  if (filters.timePeriod !== "all") count += 1;
  if (filters.locationScope !== "all") count += 1;
  return count;
}

export function DashboardFilterBar() {
  const { dashboardFilters, setDashboardFilters } = useApp();
  const activeCount = countActiveFilters(dashboardFilters);

  const update = (key: keyof DashboardFilters, value: string) => {
    setDashboardFilters({ ...dashboardFilters, [key]: value });
  };

  const resetFilters = () => {
    setDashboardFilters(DEFAULT_DASHBOARD_FILTERS);
  };

  return (
    <div className="overflow-hidden border-[3px] border-black bg-white brutal-shadow-sm">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-b-[3px] border-black bg-accent-purple/25 px-4 py-3 sm:px-5">
        <SectionTitle as="h3" className="!mb-0 inline-flex items-center gap-1.5 self-center leading-none">
          <Filter className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Dashboard filters
        </SectionTitle>
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <Badge variant="secondary" className="text-[10px]">
              {activeCount} active
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={activeCount === 0}
            className="h-8 gap-1.5 px-2.5 text-[10px] normal-case tracking-normal"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-4">
        {filterFields.map(({ key, label, icon: Icon, accent }) => {
          const isActive = dashboardFilters[key] !== DEFAULT_DASHBOARD_FILTERS[key];

          return (
            <div
              key={key}
              className={clsx(
                "flex flex-col gap-2.5 border-[3px] border-black p-3 brutal-shadow-sm transition-colors",
                isActive ? "bg-accent-yellow/35" : "bg-white",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black",
                    accent,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                {isActive ? (
                  <Badge variant="lime" className="ml-auto text-[9px]">
                    On
                  </Badge>
                ) : null}
              </span>

              {key === "source" ? (
                <Dropdown
                  value={dashboardFilters.source}
                  onChange={(value) => update("source", value)}
                  options={sourceOptions}
                  aria-label="Filter by source"
                  className="w-full"
                  triggerClassName="text-xs"
                />
              ) : null}

              {key === "status" ? (
                <Dropdown
                  value={dashboardFilters.status}
                  onChange={(value) => update("status", value)}
                  options={statusOptions}
                  aria-label="Filter by status"
                  className="w-full"
                  triggerClassName="text-xs"
                />
              ) : null}

              {key === "timePeriod" ? (
                <Dropdown
                  value={dashboardFilters.timePeriod}
                  onChange={(value) => update("timePeriod", value)}
                  options={periodOptions}
                  aria-label="Filter by time period"
                  className="w-full"
                  triggerClassName="text-xs"
                />
              ) : null}

              {key === "locationScope" ? (
                <Dropdown
                  value={dashboardFilters.locationScope}
                  onChange={(value) => update("locationScope", value)}
                  options={locationOptions}
                  aria-label="Filter by location"
                  className="w-full"
                  triggerClassName="text-xs"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
