"use client";

import { useState } from "react";
import clsx from "clsx";
import { FileSpreadsheet, Sheet } from "lucide-react";
import { Button } from "@/components/ui";
import {
  exportApplicationsToExcel,
  exportApplicationsToGoogleSheets,
} from "@/lib/export-applications";
import type { JobApplication } from "@/lib/types";

interface ExportApplicationsProps {
  applications: JobApplication[];
  showHint?: boolean;
}

export function ExportApplications({ applications, showHint = false }: ExportApplicationsProps) {
  const [busy, setBusy] = useState<"excel" | "sheets" | null>(null);
  const [hint, setHint] = useState<{ text: string; tone: "lime" | "cyan" } | null>(null);

  const disabled = applications.length === 0 || busy !== null;

  const handleExcel = async () => {
    setBusy("excel");
    setHint(null);
    try {
      await exportApplicationsToExcel(applications);
      if (showHint) {
        setHint({
          tone: "lime",
          text: "Excel file downloaded with color-coded Source and Status columns matching your tracker.",
        });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleGoogleSheets = async () => {
    setBusy("sheets");
    setHint(null);
    try {
      const result = await exportApplicationsToGoogleSheets(applications);
      if (!result.ok) return;

      if (result.method === "clipboard") {
        setHint({
          tone: "cyan",
          text: "Color-coded data copied. In the new Google Sheet, click A1 and press Cmd+V (Mac) or Ctrl+V (Windows).",
        });
      } else {
        setHint({
          tone: "cyan",
          text: "Clipboard was blocked, so a CSV was downloaded instead. In Google Sheets: File → Import → Upload.",
        });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3 border-[3px] border-black bg-accent-lime p-4 brutal-shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center border-[3px] border-black bg-white brutal-shadow-sm">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide">Excel</p>
              <p className="text-[11px] font-medium">.xlsx with status & source colors</p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full gap-1.5 bg-black text-white"
            disabled={disabled}
            onClick={() => void handleExcel()}
          >
            {busy === "excel" ? "Exporting…" : "Download Excel"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-[3px] border-black bg-accent-cyan p-4 brutal-shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center border-[3px] border-black bg-white brutal-shadow-sm">
              <Sheet className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide">Google Sheets</p>
              <p className="text-[11px] font-medium">Paste color-coded table into a new sheet</p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full gap-1.5 bg-black text-white"
            disabled={disabled}
            onClick={() => void handleGoogleSheets()}
          >
            {busy === "sheets" ? "Opening…" : "Open in Sheets"}
          </Button>
        </div>
      </div>

      {showHint && hint ? (
        <p
          className={clsx(
            "border-[3px] border-black px-3 py-2 text-xs font-medium brutal-shadow-sm",
            hint.tone === "lime" ? "bg-accent-lime/50" : "bg-accent-cyan/50",
          )}
          role="status"
        >
          {hint.text}
        </p>
      ) : null}
    </div>
  );
}
