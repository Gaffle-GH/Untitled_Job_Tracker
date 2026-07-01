"use client";

import clsx from "clsx";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, MapPin, StickyNote, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { CompanyLogo } from "@/components/CompanyLogo";
import { PopSwap } from "@/components/motion/Pop";
import { ApplicationMobileCard } from "@/components/applications/ApplicationMobileCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dropdown } from "@/components/ui";
import { POP_TAP_SPRING, popSmHover, popSmRestShadow, popSmTap } from "@/lib/motion-presets";
import { useApp } from "@/lib/store";
import type { ApplicationStatus, JobApplication, ListFilters } from "@/lib/types";
import { SOURCE_COLORS, SOURCE_LABELS, SOURCE_TEXT_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as ApplicationStatus[];

const STATUS_DROPDOWN_OPTIONS = STATUS_OPTIONS.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
  backgroundColor: STATUS_COLORS[status],
}));

const CELL = "px-3 py-3.5 align-middle";
const LOCATION_HEADER = "py-3.5 pl-14 pr-3 align-middle text-center";
const LOCATION_CELL = "py-3.5 pl-14 pr-3 align-middle max-w-0";
const COMP_CELL = `${CELL} text-center whitespace-nowrap`;
const BADGE_CELL = "px-3 py-3.5 pl-6 align-middle text-center";
const APPLIED_CELL = "px-3 py-3.5 align-middle text-center whitespace-nowrap";
const LINK_CELL = "px-3 py-3.5 pr-4 align-middle";

const TRACK = "block min-w-0 w-full max-w-full overflow-hidden";

function measureNaturalWidth(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText =
    "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;width:max-content;height:auto;pointer-events:none;";
  document.body.appendChild(clone);
  const width = clone.getBoundingClientRect().width;
  document.body.removeChild(clone);
  return width;
}

const MARQUEE_GAP_PX = 16;
const MARQUEE_SPEED_PX_PER_S = 10;

type MarqueeConfig = { distance: number; duration: number };

function ScrollText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const [marquee, setMarquee] = useState<MarqueeConfig | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const text = textRef.current;
    if (!track || !text) return;

    const measure = () => {
      const host = track.parentElement;
      const hostWidth = host?.clientWidth ?? 0;
      if (hostWidth > 0) {
        track.style.width = `${hostWidth}px`;
      }

      const textWidth = measureNaturalWidth(text);
      const visibleWidth = track.clientWidth || hostWidth;
      const overflow = textWidth - visibleWidth;

      if (overflow <= 2 || reduceMotion) {
        setMarquee((prev) => (prev === null ? prev : null));
        return;
      }

      const strip = stripRef.current;
      let distance: number;
      if (strip && strip.children.length >= 2) {
        distance = Math.ceil((strip.children[1] as HTMLElement).offsetLeft);
      } else {
        distance = Math.ceil(textWidth) + MARQUEE_GAP_PX;
      }

      const duration = distance / MARQUEE_SPEED_PX_PER_S;

      setMarquee((prev) => {
        if (
          prev &&
          Math.abs(prev.distance - distance) < 1 &&
          Math.abs(prev.duration - duration) < 0.05
        ) {
          return prev;
        }
        return { distance, duration };
      });
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    measure();
    scheduleMeasure();

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(track);
    if (track.parentElement) {
      observer.observe(track.parentElement);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [children, reduceMotion]);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    if (marquee) {
      strip.style.setProperty("--marquee-distance", `-${marquee.distance}px`);
      strip.style.setProperty("--marquee-duration", `${marquee.duration}s`);
    } else {
      strip.style.removeProperty("--marquee-distance");
      strip.style.removeProperty("--marquee-duration");
    }
  }, [marquee]);

  const textClass = clsx("inline-block shrink-0 whitespace-nowrap", className);
  const active = marquee !== null;

  return (
    <div ref={trackRef} className={TRACK}>
      <div
        ref={stripRef}
        className={clsx("inline-flex w-max items-center", active && "marquee-loop gap-4")}
      >
        <span ref={textRef} className={textClass}>
          {children}
        </span>
        {active ? (
          <span aria-hidden className={textClass}>
            {children}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const BADGE_PAD_CH = 3;

function longestCh(labels: string[]) {
  if (labels.length === 0) return 0;
  return Math.max(...labels.map((label) => label.length));
}

function computeColumnBoxWidths() {
  return {
    source: longestCh(Object.values(SOURCE_LABELS)) + BADGE_PAD_CH,
    status: longestCh(Object.values(STATUS_LABELS)) + BADGE_PAD_CH,
  };
}

function computeStaticColumnWidths(applications: JobApplication[]) {
  const compLabels = applications.map((app) => app.salary ?? "—");
  const appliedLabels = applications.map((app) => formatAppliedDate(app.appliedAt));

  return {
    comp: longestCh(compLabels) + BADGE_PAD_CH,
    applied: longestCh(appliedLabels) + BADGE_PAD_CH,
  };
}

function formatAppliedDate(appliedAt: string) {
  const date = new Date(`${appliedAt}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return appliedAt;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ViewLinkButton({ url }: { url?: string }) {
  const reduceMotion = useReducedMotion();
  const className =
    "inline-flex h-8 w-[4.5rem] max-w-full items-center justify-center gap-1 border-2 px-2 text-[10px] font-bold uppercase";

  if (url) {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ boxShadow: popSmRestShadow }}
        whileHover={reduceMotion ? undefined : popSmHover}
        whileTap={reduceMotion ? undefined : popSmTap}
        transition={POP_TAP_SPRING}
        className={`${className} border-black bg-white`}
        onClick={(event) => event.stopPropagation()}
      >
        View
        <motion.span
          className="inline-flex"
          whileHover={reduceMotion ? undefined : { x: 2, y: -1 }}
          transition={POP_TAP_SPRING}
        >
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        </motion.span>
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      disabled
      className={`${className} cursor-not-allowed border-black/35 bg-black/8 text-black/35`}
      aria-label="No job link available"
    >
      View
      <ExternalLink className="h-3 w-3 shrink-0 opacity-40" aria-hidden />
    </motion.button>
  );
}

function ladderCellProps() {
  return {
    initial: false,
    animate: { opacity: 1, y: 0 },
  };
}

export function ApplicationRow({
  application,
  boxWidths,
  index,
  onRequestDelete,
}: {
  application: JobApplication;
  boxWidths: { source: number; status: number };
  index: number;
  onRequestDelete: (application: JobApplication) => void;
}) {
  const { updateApplicationStatus, updateApplicationNotes } = useApp();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(application.notes ?? "");
  const ladder = ladderCellProps();

  useLayoutEffect(() => {
    setNotesDraft(application.notes ?? "");
  }, [application.id, application.notes]);

  const handleStatusChange = (next: ApplicationStatus) => {
    if (next === application.status) return;
    void updateApplicationStatus(application.id, next);
  };

  const saveNotes = () => {
    const trimmed = notesDraft.trim();
    void updateApplicationNotes(application.id, trimmed || null);
  };

  const handleDelete = () => {
    onRequestDelete(application);
  };

  return (
    <>
    <tr className="border-b-[3px] border-black last:border-b-0 hover:bg-[#fffef5]">
      <motion.td {...ladder} className={`${CELL} max-w-0`}>
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo
            company={application.company}
            url={application.url}
            companyDomain={application.companyDomain}
            logoUrl={application.logoUrl}
            size="md"
            rounded="md"
            className="shrink-0 border-[3px] border-black brutal-shadow-sm"
          />
          <div className="min-w-0 flex-1 overflow-hidden">
            <ScrollText className="text-sm font-black uppercase leading-tight">
              {application.title}
            </ScrollText>
            <ScrollText className="text-sm font-bold">{application.company}</ScrollText>
          </div>
        </div>
      </motion.td>

      <motion.td {...ladder} className={LOCATION_CELL}>
        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 overflow-hidden">
            <ScrollText className="text-xs font-bold uppercase">{application.location}</ScrollText>
          </div>
        </div>
      </motion.td>

      <motion.td {...ladder} className={COMP_CELL}>
        <span className="text-xs font-black tabular-nums">{application.salary ?? "—"}</span>
      </motion.td>

      <motion.td {...ladder} className={BADGE_CELL}>
        <div className="flex justify-center">
          <span
            className="inline-flex min-h-[1.625rem] items-center justify-center border-2 border-black px-1.5 py-0.5 text-center text-[10px] font-bold uppercase leading-tight"
            style={{
              backgroundColor: SOURCE_COLORS[application.source],
              color: SOURCE_TEXT_COLORS[application.source],
              width: `${boxWidths.source}ch`,
            }}
          >
            {SOURCE_LABELS[application.source]}
          </span>
        </div>
      </motion.td>

      <motion.td {...ladder} className={BADGE_CELL}>
        <div className="flex justify-center">
          <Dropdown
            variant="badge"
            value={application.status}
            onChange={(value) => handleStatusChange(value as ApplicationStatus)}
            options={STATUS_DROPDOWN_OPTIONS}
            aria-label={`Update status for ${application.title}`}
            triggerStyle={{ width: `${boxWidths.status}ch` }}
          />
        </div>
      </motion.td>

      <motion.td {...ladder} className={APPLIED_CELL}>
        <time
          dateTime={application.appliedAt}
          className="text-xs font-bold uppercase tabular-nums text-black/55"
        >
          {formatAppliedDate(application.appliedAt)}
        </time>
      </motion.td>

      <motion.td {...ladder} className={`${LINK_CELL} text-center`}>
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setNotesOpen((open) => !open)}
            className={`inline-flex h-8 w-8 items-center justify-center border-2 border-black bg-white brutal-shadow-sm hover:bg-accent-yellow ${application.notes ? "bg-accent-yellow/60" : ""}`}
            title="Notes"
            aria-label="Edit notes"
          >
            <StickyNote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-8 w-8 items-center justify-center border-2 border-black bg-white brutal-shadow-sm hover:bg-accent-pink/50"
            title="Remove"
            aria-label="Remove application"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <ViewLinkButton url={application.url} />
        </div>
      </motion.td>
    </tr>
    {notesOpen ? (
      <tr className="border-b-[3px] border-black bg-accent-yellow/20">
        <td colSpan={7} className="px-4 py-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase">Notes</span>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={saveNotes}
              rows={2}
              placeholder="Interview prep, recruiter name, follow-up dates…"
              className="w-full resize-y border-[3px] border-black bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </label>
        </td>
      </tr>
    ) : null}
    </>
  );
}

function listFilterKey(filters: ListFilters) {
  return (
    [...filters.selectedSources].sort().join(",") +
    "|" +
    [...filters.selectedStatuses].sort().join(",") +
    "|" +
    filters.searchQuery.trim().toLowerCase()
  );
}

export function ApplicationList({
  applications,
  layoutApplications,
  page = 1,
}: {
  applications: JobApplication[];
  layoutApplications?: JobApplication[];
  page?: number;
}) {
  const { listFilters, sortField, sortDirection, deleteApplication, databaseMode } = useApp();
  const [deleteTarget, setDeleteTarget] = useState<JobApplication | null>(null);
  const filterKey = useMemo(() => listFilterKey(listFilters), [listFilters]);
  const listKey = `${filterKey}::${sortField}:${sortDirection}::p${page}`;
  const boxWidths = useMemo(() => computeColumnBoxWidths(), []);
  const layoutSource = layoutApplications ?? applications;
  const staticWidths = useMemo(() => computeStaticColumnWidths(layoutSource), [layoutSource]);

  if (applications.length === 0) {
    return (
      <div className="flex min-h-96 flex-1 items-center justify-center">
        <PopSwap id={`empty-${filterKey}`}>
          <div className="border-[3px] border-black bg-white p-10 text-center brutal-shadow-lg">
            <p className="text-4xl">🙁</p>
            <h2 className="mt-4 brutal-heading text-xl">Nothing matches</h2>
            <p className="mt-2 text-sm font-medium">Try adjusting your filters</p>
          </div>
        </PopSwap>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove application?"
        confirmLabel="Remove"
        cancelLabel="Keep it"
        confirmVariant="pink"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteApplication(deleteTarget.id);
        }}
        description={
          deleteTarget ? (
            <>
              <p>
                You&apos;re about to remove{" "}
                <span className="font-black">{deleteTarget.title}</span> at{" "}
                <span className="font-black">{deleteTarget.company}</span> from your pipeline.
              </p>
              <ul className="mt-3 space-y-1.5 border-l-[3px] border-black/20 pl-3 text-xs font-bold uppercase tracking-wide text-black/65">
                <li>Removed from Applications list</li>
                <li>Dashboard stats will update</li>
                {databaseMode ? <li>Deleted from your account</li> : <li>Removed from this browser</li>}
              </ul>
              <p className="mt-3 text-xs font-medium text-black/55">This can&apos;t be undone.</p>
            </>
          ) : null
        }
      />

      <PopSwap id={listKey}>
      <div className="space-y-3 md:hidden">
        {applications.map((application, index) => (
          <ApplicationMobileCard
            key={`${application.id}-${listKey}`}
            application={application}
            index={index}
            onRequestDelete={setDeleteTarget}
          />
        ))}
      </div>

      <div className="hidden w-full min-w-0 overflow-hidden border-[3px] border-black bg-white brutal-shadow md:block">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col />
          <col style={{ width: "calc(18% + 2.5rem)" }} />
          <col style={{ width: `calc(${staticWidths.comp}ch + 3.5rem)` }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: `${staticWidths.applied}ch` }} />
          <col style={{ width: "11%" }} />
        </colgroup>
        <thead className="border-b-[3px] border-black bg-accent-yellow/50">
          <tr>
            <th scope="col" className={`${CELL} text-left text-xs font-extrabold uppercase tracking-wide`}>
              Role
            </th>
            <th scope="col" className={`${LOCATION_HEADER} text-xs font-extrabold uppercase tracking-wide`}>
              Location
            </th>
            <th scope="col" className={`${COMP_CELL} text-xs font-extrabold uppercase tracking-wide`}>
              Comp
            </th>
            <th scope="col" className={`${BADGE_CELL} text-xs font-extrabold uppercase tracking-wide`}>
              Source
            </th>
            <th scope="col" className={`${BADGE_CELL} text-xs font-extrabold uppercase tracking-wide`}>
              Status
            </th>
            <th scope="col" className={`${APPLIED_CELL} text-xs font-extrabold uppercase tracking-wide`}>
              Applied
            </th>
            <th scope="col" className={`${LINK_CELL} text-center text-xs font-extrabold uppercase tracking-wide`}>
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application, index) => (
            <ApplicationRow
              key={`${application.id}-${listKey}`}
              application={application}
              boxWidths={boxWidths}
              index={index}
              onRequestDelete={setDeleteTarget}
            />
          ))}
        </tbody>
      </table>
      </div>
      </PopSwap>
    </>
  );
}

/** @deprecated Use ApplicationList */
export const ApplicationGrid = ApplicationList;

/** @deprecated Use ApplicationRow */
export const ApplicationCard = ApplicationRow;
