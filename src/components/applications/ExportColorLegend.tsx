import { SectionTitle } from "@/components/layout/PageShell";
import {
  SOURCE_COLORS,
  SOURCE_LABELS,
  SOURCE_TEXT_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationStatus,
  type JobSource,
} from "@/lib/types";

const SOURCE_ORDER: JobSource[] = ["handshake", "linkedin", "indeed", "discover", "manual"];

const STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "phone_screen",
  "technical",
  "onsite",
  "final_round",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
];

function ColorChip({
  label,
  backgroundColor,
  color = "#000000",
}: {
  label: string;
  backgroundColor: string;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center border-2 border-black px-1.5 py-0.5 text-[10px] font-bold uppercase leading-tight"
      style={{ backgroundColor, color }}
    >
      {label}
    </span>
  );
}

function LegendSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <SectionTitle as="p" className="mb-0">
        {label}
      </SectionTitle>
      <div className="border-[3px] border-black bg-[#fffef5] p-2.5 brutal-shadow-sm">
        <div className="flex flex-wrap gap-1.5">{children}</div>
      </div>
    </div>
  );
}

export function ExportColorLegend() {
  return (
    <div className="border-[3px] border-black bg-white p-4 brutal-shadow-sm">
      <p className="text-xs font-medium">Exports use the same colors as your tracker:</p>

      <div className="mt-3 space-y-3">
        <LegendSection label="Source">
          {SOURCE_ORDER.map((source) => (
            <ColorChip
              key={source}
              label={SOURCE_LABELS[source]}
              backgroundColor={SOURCE_COLORS[source]}
              color={SOURCE_TEXT_COLORS[source]}
            />
          ))}
        </LegendSection>

        <LegendSection label="Status">
          {STATUS_ORDER.map((status) => (
            <ColorChip
              key={status}
              label={STATUS_LABELS[status]}
              backgroundColor={STATUS_COLORS[status]}
            />
          ))}
        </LegendSection>
      </div>
    </div>
  );
}
