"use client";

import { ExportApplications } from "@/components/applications/ExportApplications";
import { ExportColorLegend } from "@/components/applications/ExportColorLegend";
import { Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";

export function ExportSettings() {
  const { applications } = useApp();

  return (
    <Card accent="lime" className="gap-0">
      <CardContent className="!p-5">
        <p className="font-bold">Download your full pipeline</p>
        <p className="mt-1 text-sm font-medium">
          Export every application in your tracker — company, role, status, source, dates, and links.
          Use the file in Excel, Google Sheets, or any data tool.
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide">
          {applications.length} application{applications.length === 1 ? "" : "s"} ready to export
        </p>

        <div className="mt-4">
          <ExportApplications applications={applications} showHint />
        </div>

        <div className="mt-4">
          <ExportColorLegend />
        </div>
      </CardContent>
    </Card>
  );
}
