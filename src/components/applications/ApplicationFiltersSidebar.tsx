"use client";

import clsx from "clsx";
import { Badge, Button, Checkbox, Separator } from "@/components/ui";
import { useApp } from "@/lib/store";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  STATUS_QUICK_FILTERS,
  type ApplicationStatus,
  type JobSource,
} from "@/lib/types";

const allSources: JobSource[] = ["handshake", "linkedin", "indeed", "manual", "discover"];

function statusesMatch(a: ApplicationStatus[], b: ApplicationStatus[]) {
  if (a.length !== b.length) return false;
  const selected = new Set(b);
  return a.every((status) => selected.has(status));
}

export function ApplicationFiltersSidebar() {
  const { listFilters, setListFilters, resetListFilters, applications } = useApp();

  const sourceCounts = allSources.map((source) => ({
    source,
    count: applications.filter((app) => app.source === source).length,
  }));

  const toggleSource = (source: JobSource) => {
    const selected = listFilters.selectedSources.includes(source)
      ? listFilters.selectedSources.filter((s) => s !== source)
      : [...listFilters.selectedSources, source];
    setListFilters({ ...listFilters, selectedSources: selected });
  };

  const toggleStatus = (status: ApplicationStatus) => {
    const selected = listFilters.selectedStatuses.includes(status)
      ? listFilters.selectedStatuses.filter((s) => s !== status)
      : [...listFilters.selectedStatuses, status];
    setListFilters({ ...listFilters, selectedStatuses: selected });
  };

  const applyQuickFilter = (statuses: ApplicationStatus[]) => {
    setListFilters({ ...listFilters, selectedStatuses: statuses });
  };

  return (
    <aside className="w-full shrink-0 space-y-6 border-b-[3px] border-black bg-accent-cyan/20 p-4 md:w-72 md:border-b-0 md:border-r-[3px] md:p-6 lg:w-80">
      <div className="flex items-center justify-between">
        <h2 className="brutal-heading text-lg">Filters</h2>
        <Button variant="outline" size="sm" onClick={resetListFilters}>
          Reset
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="brutal-label">Quick Select</h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_QUICK_FILTERS.map((filter) => {
            const active = statusesMatch(filter.statuses, listFilters.selectedStatuses);
            return (
              <Button
                key={filter.label}
                variant="outline"
                size="sm"
                className={clsx(
                  "h-auto min-h-8 whitespace-normal px-2 py-1.5 text-[10px] font-semibold normal-case leading-tight tracking-normal",
                  active && "bg-accent-yellow",
                )}
                onClick={() => applyQuickFilter(filter.statuses)}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="brutal-label">Application Sources</h3>
        <div className="space-y-3">
          {sourceCounts.map(({ source, count }) => (
            <div key={source} className="flex items-center space-x-3">
              <Checkbox
                id={source}
                checked={listFilters.selectedSources.includes(source)}
                onChange={() => toggleSource(source)}
              />
              <label
                htmlFor={source}
                className="flex flex-1 cursor-pointer items-center justify-between text-sm"
              >
                <span>{SOURCE_LABELS[source]}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {count}
                </Badge>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="brutal-label">Status</h3>
        <div className="space-y-3">
          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => (
            <div key={status} className="flex items-center space-x-3">
              <Checkbox
                id={`status-${status}`}
                checked={listFilters.selectedStatuses.includes(status)}
                onChange={() => toggleStatus(status)}
              />
              <label htmlFor={`status-${status}`} className="flex-1 cursor-pointer text-sm">
                {STATUS_LABELS[status]}
              </label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
