"use client";

import { ArrowDown, ArrowUp, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge, Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";
import {
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type SortField,
} from "@/lib/types";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "appliedAt", label: "Date applied" },
  { value: "company", label: "Company" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
];

interface ApplicationListProps {
  compact?: boolean;
}

export function ApplicationList({ compact = false }: ApplicationListProps) {
  const {
    sortedApplications,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
  } = useApp();

  const items = compact ? sortedApplications.slice(0, 5) : sortedApplications;

  return (
    <Card className="gap-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {compact ? "Recent Applications" : "All Applications"}
        </h2>
        {!compact && (
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleSortDirection}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {sortDirection === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <CardContent className="p-8 text-center text-gray-500">No applications yet</CardContent>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((app) => (
            <div
              key={app.id}
              className="flex gap-4 p-4 transition-colors hover:bg-gray-50"
            >
              <CompanyLogo
                company={app.company}
                url={app.url}
                companyDomain={app.companyDomain}
                logoUrl={app.logoUrl}
                size="md"
                rounded="lg"
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-gray-900">{app.title}</h3>
                      <Badge variant="secondary">{SOURCE_LABELS[app.source]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{app.company}</p>
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${STATUS_COLORS[app.status]}18`,
                      color: STATUS_COLORS[app.status],
                    }}
                  >
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {app.location}
                  </span>
                  {app.salary && <span>{app.salary}</span>}
                  <span>Applied {app.appliedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
