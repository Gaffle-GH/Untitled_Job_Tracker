"use client";

import { useState } from "react";
import clsx from "clsx";
import { ExternalLink, MapPin, Trash2 } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Dropdown } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { ApplicationStatus, JobApplication } from "@/lib/types";
import { SOURCE_COLORS, SOURCE_LABELS, SOURCE_TEXT_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as ApplicationStatus[];

const STATUS_DROPDOWN_OPTIONS = STATUS_OPTIONS.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
  backgroundColor: STATUS_COLORS[status],
}));

function formatAppliedDate(appliedAt: string) {
  const date = new Date(`${appliedAt}T12:00:00`);
  if (Number.isNaN(date.getTime())) return appliedAt;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ApplicationMobileCard({
  application,
  onRequestDelete,
}: {
  application: JobApplication;
  index: number;
  onRequestDelete: (application: JobApplication) => void;
}) {
  const { updateApplicationStatus, updateApplicationNotes } = useApp();
  const [notesDraft, setNotesDraft] = useState(application.notes ?? "");

  const handleDelete = () => {
    onRequestDelete(application);
  };

  return (
    <article className="border-[3px] border-black bg-white p-4 brutal-shadow-sm">
      <div className="flex gap-3">
        <CompanyLogo
          company={application.company}
          url={application.url}
          companyDomain={application.companyDomain}
          logoUrl={application.logoUrl}
          size="md"
          rounded="md"
          className="shrink-0 border-[3px] border-black brutal-shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black uppercase leading-tight">{application.title}</p>
          <p className="truncate text-sm font-bold">{application.company}</p>
          <div className="mt-1 flex items-center gap-1 text-xs font-bold uppercase">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{application.location}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-white brutal-shadow-sm hover:bg-accent-pink/50"
          aria-label="Remove application"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center border-2 border-black px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{
            backgroundColor: SOURCE_COLORS[application.source],
            color: SOURCE_TEXT_COLORS[application.source],
          }}
        >
          {SOURCE_LABELS[application.source]}
        </span>
        <Dropdown
          variant="badge"
          value={application.status}
          onChange={(value) => void updateApplicationStatus(application.id, value as ApplicationStatus)}
          options={STATUS_DROPDOWN_OPTIONS}
          aria-label={`Update status for ${application.title}`}
          className="min-w-0 flex-1"
        />
      </div>

      <label className="mt-3 block space-y-1">
        <span className="text-[10px] font-bold uppercase text-black/50">Notes</span>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={() => {
            const trimmed = notesDraft.trim();
            void updateApplicationNotes(application.id, trimmed || null);
          }}
          rows={2}
          placeholder="Interview prep, recruiter name…"
          className="w-full resize-y border-2 border-black bg-white px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-accent-cyan"
        />
      </label>

      <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-black/15 pt-3">
        <div className="text-xs">
          <span className="font-bold uppercase text-black/50">Applied </span>
          <time dateTime={application.appliedAt} className="font-bold tabular-nums">
            {formatAppliedDate(application.appliedAt)}
          </time>
          {application.salary ? (
            <span className="ml-2 font-black tabular-nums">{application.salary}</span>
          ) : null}
        </div>
        {application.url ? (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "inline-flex h-8 shrink-0 items-center gap-1 border-2 border-black bg-white px-2 text-[10px] font-bold uppercase",
              "brutal-shadow-sm transition-colors hover:bg-accent-cyan/30",
            )}
          >
            View
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
      </div>
    </article>
  );
}
