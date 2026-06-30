"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { SectionTitle } from "@/components/layout/PageShell";
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

function FilterPanel() {
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

  const activeFilterCount =
    listFilters.selectedSources.length + listFilters.selectedStatuses.length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="brutal-heading text-lg">Filters</h2>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          ) : null}
          <Button variant="outline" size="sm" onClick={resetListFilters}>
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <SectionTitle as="h3" className="mb-0">
          Quick Select
        </SectionTitle>
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
        <SectionTitle as="h3" className="mb-0">
          Application Sources
        </SectionTitle>
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
        <SectionTitle as="h3" className="mb-0">
          Status
        </SectionTitle>
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
    </>
  );
}

export function ApplicationFiltersSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { listFilters } = useApp();
  const activeFilterCount =
    listFilters.selectedSources.length + listFilters.selectedStatuses.length;

  return (
    <>
      <div className="border-b-[3px] border-black bg-accent-cyan/20 p-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex w-full items-center justify-between border-[3px] border-black bg-white px-4 py-3 text-left font-bold uppercase brutal-shadow-sm"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 ? (
              <Badge variant="secondary" className="text-[10px]">
                {activeFilterCount}
              </Badge>
            ) : null}
          </span>
          <ChevronDown className={clsx("h-4 w-4 transition-transform", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen ? (
          <div className="mt-4 space-y-6 border-[3px] border-black bg-white p-4 brutal-shadow-sm">
            <FilterPanel />
          </div>
        ) : null}
      </div>

      <aside className="hidden w-full shrink-0 space-y-6 border-r-[3px] border-black bg-accent-cyan/20 p-6 md:block md:w-72 lg:w-80">
        <FilterPanel />
      </aside>
    </>
  );
}
