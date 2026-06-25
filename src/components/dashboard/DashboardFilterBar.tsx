"use client";

import { Filter, Globe, Layers, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";
import {
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

const periodLabels: Record<DashboardFilters["timePeriod"], string> = {
  all: "All Time",
  "2026": "2026",
  "2025": "2025",
  "90d": "Last 90 Days",
  "30d": "Last 30 Days",
};

export function DashboardFilterBar() {
  const { dashboardFilters, setDashboardFilters } = useApp();

  const update = (key: keyof DashboardFilters, value: string) => {
    setDashboardFilters({ ...dashboardFilters, [key]: value });
  };

  return (
    <Card className="gap-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Layers className="h-4 w-4" />
              Source
            </span>
            <select
              value={dashboardFilters.source}
              onChange={(e) => update("source", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source === "all" ? "All Sources" : SOURCE_LABELS[source]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              Status
            </span>
            <select
              value={dashboardFilters.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Statuses" : STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarDays className="h-4 w-4" />
              Time Period
            </span>
            <select
              value={dashboardFilters.timePeriod}
              onChange={(e) => update("timePeriod", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              {periods.map((period) => (
                <option key={period} value={period}>
                  {periodLabels[period]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
