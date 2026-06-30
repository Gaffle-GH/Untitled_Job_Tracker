"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { ApplicationStatus, JobSource } from "@/lib/types";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/types";

const SOURCES = Object.keys(SOURCE_LABELS) as JobSource[];
const STATUSES = Object.keys(STATUS_LABELS) as ApplicationStatus[];

interface AddApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddApplicationModal({ open, onClose }: AddApplicationModalProps) {
  const { addApplication } = useApp();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState<JobSource>("manual");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setCompany("");
    setTitle("");
    setLocation("");
    setSource("manual");
    setStatus("applied");
    setSalary("");
    setUrl("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!company.trim() || !title.trim()) return;

    addApplication({
      company: company.trim(),
      title: title.trim(),
      location: location.trim() || "—",
      source,
      status,
      appliedAt: new Date().toISOString().split("T")[0],
      salary: salary.trim() || undefined,
      url: url.trim() || undefined,
    });
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-application-title"
        className="w-full max-h-[92dvh] overflow-y-auto border-[3px] border-black bg-white brutal-shadow-lg sm:max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
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
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, ST" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase">Source</span>
              <Select value={source} onChange={(e) => setSource(e.target.value as JobSource)}>
                {SOURCES.map((entry) => (
                  <option key={entry} value={entry}>
                    {SOURCE_LABELS[entry]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase">Status</span>
              <Select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)}>
                {STATUSES.map((entry) => (
                  <option key={entry} value={entry}>
                    {STATUS_LABELS[entry]}
                  </option>
                ))}
              </Select>
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

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="lime" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
