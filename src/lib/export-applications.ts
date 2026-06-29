import type { JobApplication } from "@/lib/types";
import {
  SOURCE_COLORS,
  SOURCE_LABELS,
  SOURCE_TEXT_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/types";

export const EXPORT_COLUMNS = [
  "Company",
  "Title",
  "Location",
  "Source",
  "Status",
  "Applied",
  "Salary",
  "URL",
  "Notes",
] as const;

export type ExportRow = Record<(typeof EXPORT_COLUMNS)[number], string>;

const HEADER_FILL = "#ffe066";

export function applicationsToExportRows(applications: JobApplication[]): ExportRow[] {
  return applications.map((app) => ({
    Company: app.company,
    Title: app.title,
    Location: app.location,
    Source: SOURCE_LABELS[app.source],
    Status: STATUS_LABELS[app.status],
    Applied: app.appliedAt,
    Salary: app.salary ?? "",
    URL: app.url ?? "",
    Notes: app.notes ?? "",
  }));
}

function exportFilename(extension: "xlsx" | "csv") {
  const date = new Date().toISOString().slice(0, 10);
  return `tracker-applications-${date}.${extension}`;
}

function hexToArgb(hex: string) {
  return `FF${hex.replace("#", "").toUpperCase()}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeDelimitedCell(value: string) {
  if (/[\t\n",]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToTsv(rows: ExportRow[]) {
  const lines = [
    EXPORT_COLUMNS.join("\t"),
    ...rows.map((row) => EXPORT_COLUMNS.map((col) => escapeDelimitedCell(row[col])).join("\t")),
  ];
  return lines.join("\n");
}

function rowsToCsv(rows: ExportRow[]) {
  const lines = [
    EXPORT_COLUMNS.join(","),
    ...rows.map((row) => EXPORT_COLUMNS.map((col) => escapeDelimitedCell(row[col])).join(",")),
  ];
  return lines.join("\n");
}

function applicationsToHtmlTable(applications: JobApplication[]) {
  const header = EXPORT_COLUMNS.map(
    (col) =>
      `<th style="border:1px solid #000;background:${HEADER_FILL};font-weight:bold;padding:6px 8px;">${col}</th>`,
  ).join("");

  const body = applications
    .map((app) => {
      const cells = [
        { key: "Company", value: app.company },
        { key: "Title", value: app.title },
        { key: "Location", value: app.location },
        {
          key: "Source",
          value: SOURCE_LABELS[app.source],
          bg: SOURCE_COLORS[app.source],
          color: SOURCE_TEXT_COLORS[app.source],
        },
        {
          key: "Status",
          value: STATUS_LABELS[app.status],
          bg: STATUS_COLORS[app.status],
          color: "#000000",
        },
        { key: "Applied", value: app.appliedAt },
        { key: "Salary", value: app.salary ?? "" },
        { key: "URL", value: app.url ?? "" },
        { key: "Notes", value: app.notes ?? "" },
      ];

      const tds = cells
        .map((cell) => {
          const style = [
            "border:1px solid #000",
            "padding:6px 8px",
            cell.bg ? `background:${cell.bg}` : "background:#ffffff",
            cell.color ? `color:${cell.color}` : "color:#000000",
          ].join(";");
          return `<td style="${style}">${escapeHtml(cell.value)}</td>`;
        })
        .join("");

      return `<tr>${tds}</tr>`;
    })
    .join("");

  const table = `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt;">${`<thead><tr>${header}</tr></thead>`}<tbody>${body}</tbody></table>`;

  return `<html><body><!--StartFragment-->${table}<!--EndFragment--></body></html>`;
}

function downloadTextFile(contents: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF", contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBuffer(buffer: ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function solidFill(hex: string) {
  return {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: hexToArgb(hex) },
  };
}

function cellFont(color = "#000000", bold = false) {
  return { bold, color: { argb: hexToArgb(color) } };
}

export async function exportApplicationsToExcel(applications: JobApplication[]) {
  if (applications.length === 0) return false;

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applications", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = EXPORT_COLUMNS.map((key) => ({
    header: key,
    key,
    width: key === "URL" || key === "Notes" ? 36 : key === "Company" || key === "Title" ? 22 : 14,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.fill = solidFill(HEADER_FILL);
    cell.font = cellFont("#000000", true);
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "medium", color: { argb: "FF000000" } },
    };
  });

  for (const app of applications) {
    const row = sheet.addRow({
      Company: app.company,
      Title: app.title,
      Location: app.location,
      Source: SOURCE_LABELS[app.source],
      Status: STATUS_LABELS[app.status],
      Applied: app.appliedAt,
      Salary: app.salary ?? "",
      URL: app.url ?? "",
      Notes: app.notes ?? "",
    });

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };

      if (colNumber === 4) {
        cell.fill = solidFill(SOURCE_COLORS[app.source]);
        cell.font = cellFont(SOURCE_TEXT_COLORS[app.source], true);
      } else if (colNumber === 5) {
        cell.fill = solidFill(STATUS_COLORS[app.status]);
        cell.font = cellFont("#000000", true);
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBuffer(
    buffer,
    exportFilename("xlsx"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  return true;
}

export function exportApplicationsToCsv(applications: JobApplication[]) {
  if (applications.length === 0) return false;

  const rows = applicationsToExportRows(applications);
  downloadTextFile(rowsToCsv(rows), exportFilename("csv"), "text/csv;charset=utf-8;");
  return true;
}

export type GoogleSheetsExportResult =
  | { ok: false }
  | { ok: true; method: "clipboard" }
  | { ok: true; method: "download" };

/** Copy color-coded table to clipboard and open a new Google Sheet (paste into A1). */
export async function exportApplicationsToGoogleSheets(
  applications: JobApplication[],
): Promise<GoogleSheetsExportResult> {
  if (applications.length === 0) return { ok: false };

  const rows = applicationsToExportRows(applications);
  const tsv = rowsToTsv(rows);
  const html = applicationsToHtmlTable(applications);

  const openSheet = () => {
    window.open("https://docs.google.com/spreadsheets/create", "_blank", "noopener,noreferrer");
  };

  try {
    if (typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([tsv], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(tsv);
    }
    openSheet();
    return { ok: true, method: "clipboard" };
  } catch {
    exportApplicationsToCsv(applications);
    openSheet();
    return { ok: true, method: "download" };
  }
}
