"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { POP_TAP_SPRING } from "@/lib/motion-presets";
import { Button } from "@/components/ui";

export const APPLICATIONS_PAGE_SIZE = 10;

interface ApplicationPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (prev !== undefined && page - prev > 1) result.push("ellipsis");
    result.push(page);
  }

  return result;
}

export function ApplicationPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: ApplicationPaginationProps) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = pageNumbers(currentPage, totalPages);

  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold uppercase tracking-wide">
        {start}–{end} of {totalItems}
      </p>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          <div className="flex flex-wrap items-center gap-1">
            {pages.map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm font-bold">
                  …
                </span>
              ) : (
                <motion.button
                  key={page}
                  type="button"
                  layout={!reduceMotion}
                  onClick={() => onPageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  whileHover={reduceMotion ? undefined : { scale: 1.06, y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.94, y: 0 }}
                  transition={POP_TAP_SPRING}
                  className={clsx(
                    "flex h-8 min-w-8 items-center justify-center border-[3px] border-black px-2 text-xs font-bold uppercase brutal-shadow-sm transition-colors",
                    page === currentPage
                      ? "bg-accent-yellow text-black"
                      : "bg-white text-black hover:bg-accent-yellow/40",
                  )}
                >
                  {page}
                </motion.button>
              ),
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
