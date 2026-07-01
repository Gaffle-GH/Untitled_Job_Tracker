"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { PopOverlay } from "@/components/motion/Pop";
import { MODAL_SPRING, popModalPanelHidden, popModalPanelVisible, popModalPanelExit } from "@/lib/motion-presets";
import { Button, Dropdown, Input, LocationAutocomplete } from "@/components/ui";
import { useApp } from "@/lib/store";
import { formatLocationDisplay } from "@/lib/location-normalize";
import type { ApplicationStatus, JobSource } from "@/lib/types";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/types";

const SOURCE_OPTIONS = (Object.keys(SOURCE_LABELS) as JobSource[]).map((source) => ({
  value: source,
  label: SOURCE_LABELS[source],
}));

const STATUS_OPTIONS_LIST = (Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

interface AddApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddApplicationModal({ open, onClose }: AddApplicationModalProps) {
  const { addApplication, databaseMode, profile } = useApp();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState<JobSource>("manual");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (confirmOpen) setConfirmOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, confirmOpen]);

  const reset = () => {
    setCompany("");
    setTitle("");
    setLocation("");
    setSource("manual");
    setStatus("applied");
    setSalary("");
    setUrl("");
    setNotes("");
    setConfirmOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!company.trim() || !title.trim() || saving) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!company.trim() || !title.trim() || saving) return;

    setSaving(true);
    try {
      await addApplication({
        company: company.trim(),
        title: title.trim(),
        location: location.trim() || "—",
        source,
        status,
        appliedAt: new Date().toISOString().split("T")[0],
        salary: salary.trim() || undefined,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const reduceMotion = useReducedMotion();

  return (
    <PopOverlay
      open={open}
      onClose={confirmOpen ? undefined : onClose}
      align="bottom"
      panelClassName="relative w-full max-h-[92dvh] overflow-y-auto border-[3px] border-black bg-white brutal-shadow-lg sm:max-w-md"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="add-application-title">
        <AnimatePresence>
          {confirmOpen ? (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-600/50 p-4 backdrop-blur-[1px]"
              role="presentation"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={MODAL_SPRING}
              onClick={() => !saving && setConfirmOpen(false)}
            >
              <motion.div
                role="alertdialog"
                aria-labelledby="confirm-add-title"
                aria-describedby="confirm-add-desc"
                className="w-full max-w-sm border-[3px] border-black bg-white p-5 brutal-shadow-lg"
                initial={reduceMotion ? false : popModalPanelHidden}
                animate={popModalPanelVisible}
                exit={reduceMotion ? undefined : popModalPanelExit}
                transition={MODAL_SPRING}
                onClick={(event) => event.stopPropagation()}
              >
              <h3 id="confirm-add-title" className="brutal-heading text-lg">
                Add to your pipeline?
              </h3>
              <p id="confirm-add-desc" className="mt-3 text-sm font-medium leading-relaxed">
                You&apos;re about to track{" "}
                <span className="font-black">{title.trim()}</span> at{" "}
                <span className="font-black">{company.trim()}</span>.
              </p>
              <ul className="mt-3 space-y-1.5 border-l-[3px] border-black/20 pl-3 text-xs font-bold uppercase tracking-wide text-black/65">
                <li>Status: {STATUS_LABELS[status]}</li>
                <li>Source: {SOURCE_LABELS[source]}</li>
                <li>Appears in Applications &amp; dashboard</li>
                {databaseMode ? <li>Saved to your account</li> : <li>Stored in this browser</li>}
              </ul>
              <p className="mt-3 text-xs font-medium text-black/55">
                You can change status, add notes, or remove it later from Applications.
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                  onClick={() => setConfirmOpen(false)}
                >
                  Go back
                </Button>
                <Button
                  type="button"
                  variant="lime"
                  className="flex-1"
                  disabled={saving}
                  onClick={() => void handleConfirm()}
                >
                  {saving ? "Adding…" : "Confirm"}
                </Button>
              </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex items-center justify-between border-b-[3px] border-black bg-accent-yellow px-4 py-3">
          <h2 id="add-application-title" className="brutal-heading text-lg">
            Add application
          </h2>
          <Button type="button" variant="outline" size="icon" pop={false} onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase">Role title *</span>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase">Company *</span>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase">Location</span>
            <div className="flex gap-2">
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="City, US ZIP, or Remote"
                className="flex-1"
              />
              {profile.location.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 normal-case tracking-normal"
                  onClick={() =>
                    setLocation(
                      formatLocationDisplay(profile.location, profile.zipCode),
                    )
                  }
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  Use profile
                </Button>
              ) : null}
            </div>
            <p className="text-[10px] font-medium text-black/50">
              Geocoded for dashboard &quot;near me&quot; filters
            </p>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase">Source</span>
              <Dropdown
                value={source}
                onChange={(value) => setSource(value as JobSource)}
                options={SOURCE_OPTIONS}
                aria-label="Application source"
                className="w-full"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase">Status</span>
              <Dropdown
                value={status}
                onChange={(value) => setStatus(value as ApplicationStatus)}
                options={STATUS_OPTIONS_LIST}
                aria-label="Application status"
                className="w-full"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase">Compensation</span>
            <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="$120k–$150k" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase">Job URL</span>
            <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Recruiter, referral, follow-up…"
              className="w-full resize-y border-[3px] border-black bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="lime" className="flex-1" disabled={saving}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </PopOverlay>
  );
}
