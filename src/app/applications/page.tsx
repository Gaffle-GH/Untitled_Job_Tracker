"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { ApplicationFiltersSidebar } from "@/components/applications/ApplicationFiltersSidebar";
import { ApplicationList } from "@/components/applications/ApplicationCard";
import { PageHeader } from "@/components/layout/PageShell";
import { Button, Select } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { SortField } from "@/lib/types";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "progress", label: "Progress" },
  { value: "appliedAt", label: "Date applied" },
  { value: "company", label: "Company" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
];

export default function ApplicationsPage() {
  const { sortedApplications, sortField, setSortField, sortDirection, toggleSortDirection } =
    useApp();

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <ApplicationFiltersSidebar />

      <div className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8">
        <PageHeader
          label="Applications"
          accent="yellow"
          title="Your Pipeline"
          description={`Showing ${sortedApplications.length} application${sortedApplications.length !== 1 ? "s" : ""}`}
        />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={toggleSortDirection} className="gap-1">
            {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {sortDirection === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>

        <ApplicationList applications={sortedApplications} />
      </div>
    </div>
  );
}
