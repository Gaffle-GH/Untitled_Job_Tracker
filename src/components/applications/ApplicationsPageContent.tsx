"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Search } from "lucide-react";
import { AddApplicationModal } from "@/components/applications/AddApplicationModal";
import { ApplicationFiltersSidebar } from "@/components/applications/ApplicationFiltersSidebar";
import { ApplicationList } from "@/components/applications/ApplicationCard";
import {
  APPLICATIONS_PAGE_SIZE,
  ApplicationPagination,
} from "@/components/applications/ApplicationPagination";
import { PageHeader } from "@/components/layout/PageShell";
import { Button, Dropdown, Input } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { SortField } from "@/lib/types";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "progress", label: "Progress" },
  { value: "appliedAt", label: "Date applied" },
  { value: "company", label: "Company" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
];

function listQueryKey(
  sortField: SortField,
  sortDirection: string,
  selectedSources: string[],
  selectedStatuses: string[],
  searchQuery: string,
) {
  return [
    sortField,
    sortDirection,
    [...selectedSources].sort().join(","),
    [...selectedStatuses].sort().join(","),
    searchQuery.trim().toLowerCase(),
  ].join("|");
}

export function ApplicationsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") ?? "1";
  const [addOpen, setAddOpen] = useState(false);
  const {
    sortedApplications,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    listFilters,
    setListFilters,
  } = useApp();

  const queryKey = useMemo(
    () =>
      listQueryKey(
        sortField,
        sortDirection,
        listFilters.selectedSources,
        listFilters.selectedStatuses,
        listFilters.searchQuery,
      ),
    [sortField, sortDirection, listFilters.selectedSources, listFilters.selectedStatuses, listFilters.searchQuery],
  );
  const prevQueryKey = useRef(queryKey);

  const rawPage = Number.parseInt(pageParam, 10);
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const totalPages = Math.max(1, Math.ceil(sortedApplications.length / APPLICATIONS_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const pageApplications = useMemo(() => {
    const start = (currentPage - 1) * APPLICATIONS_PAGE_SIZE;
    return sortedApplications.slice(start, start + APPLICATIONS_PAGE_SIZE);
  }, [sortedApplications, currentPage]);

  const setPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams.toString());
      if (page <= 1) next.delete("page");
      else next.set("page", String(page));
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (prevQueryKey.current !== queryKey) {
      prevQueryKey.current = queryKey;
      if (requestedPage !== 1) setPage(1);
      return;
    }

    if (requestedPage !== currentPage) setPage(currentPage);
  }, [queryKey, requestedPage, currentPage, setPage]);

  const rangeStart =
    sortedApplications.length === 0 ? 0 : (currentPage - 1) * APPLICATIONS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * APPLICATIONS_PAGE_SIZE, sortedApplications.length);

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <ApplicationFiltersSidebar />

      <div className="min-w-0 flex-1 px-4 pb-mobile-nav pt-4 md:px-8 md:pb-8">
        <PageHeader
          label="Applications"
          accent="yellow"
          title="Your Pipeline"
          description={
            sortedApplications.length === 0
              ? "No applications match your filters"
              : `Showing ${rangeStart}–${rangeEnd} of ${sortedApplications.length} application${sortedApplications.length !== 1 ? "s" : ""}`
          }
          action={
            <Button variant="lime" size="sm" className="gap-1" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          }
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={listFilters.searchQuery}
              onChange={(e) => setListFilters({ ...listFilters, searchQuery: e.target.value })}
              placeholder="Search company, title, notes…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              value={sortField}
              onChange={(value) => setSortField(value as SortField)}
              options={sortOptions}
              aria-label="Sort applications"
            />
            <Button variant="outline" size="sm" onClick={toggleSortDirection} className="gap-1">
              {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {sortDirection === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>
        </div>

        <ApplicationList
          applications={pageApplications}
          layoutApplications={sortedApplications}
          page={currentPage}
        />

        <ApplicationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedApplications.length}
          pageSize={APPLICATIONS_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <AddApplicationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
