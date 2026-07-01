"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { PopSwap } from "@/components/motion/Pop";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { chartTooltipProps } from "@/components/dashboard/ChartCursorTooltip";
import { useApp } from "@/lib/store";
import {
  DASHBOARD_STATUS_GROUP_ORDER,
  STATUS_GROUP_COLORS,
  STATUS_GROUP_DESCRIPTIONS,
  STATUS_GROUP_LABELS,
  getStatusesForGroup,
  type DashboardStatusGroup,
} from "@/lib/types";

const CHART_HEIGHT = 280;
const DONUT_INNER_RADIUS = 70;
const DONUT_OUTER_RADIUS = 110;

type DonutHoleLayout = {
  centerX: number;
  centerY: number;
  innerDiameter: number;
  numberFontSize: number;
  labelFontSize: number;
  numberY: number;
  labelY: number;
};

/** Center of the donut hole from inner-circle diameter and chart box. */
function getDonutHoleLayout(chartWidth: number, chartHeight: number, innerRadius: number): DonutHoleLayout {
  const innerDiameter = innerRadius * 2;
  const holeLeft = chartWidth / 2 - innerRadius;
  const holeRight = chartWidth / 2 + innerRadius;
  const holeTop = chartHeight / 2 - innerRadius;
  const holeBottom = chartHeight / 2 + innerRadius;

  const centerX = (holeLeft + holeRight) / 2;
  const centerY = (holeTop + holeBottom) / 2;

  const numberFontSize = innerDiameter * 0.171;
  const labelFontSize = innerDiameter * 0.071;
  const lineGap = innerDiameter * 0.043;
  const blockHeight = numberFontSize + lineGap + labelFontSize;

  return {
    centerX,
    centerY,
    innerDiameter,
    numberFontSize,
    labelFontSize,
    numberY: centerY - blockHeight / 2 + numberFontSize / 2,
    labelY: centerY + blockHeight / 2 - labelFontSize / 2,
  };
}

function DonutCenterLabel({
  layout,
  total,
}: {
  layout: DonutHoleLayout;
  total: number;
}) {
  const { centerX, numberY, labelY, numberFontSize, labelFontSize } = layout;

  return (
    <text fill="#000" textAnchor="middle">
      <tspan x={centerX} y={numberY} fontSize={numberFontSize} fontWeight={800} dominantBaseline="middle">
        {total}
      </tspan>
      <tspan x={centerX} y={labelY} fontSize={labelFontSize} fontWeight={700} dominantBaseline="middle">
        TOTAL
      </tspan>
    </text>
  );
}

export function StatusChart() {
  const { dashboardApplications, statusGroupCounts, chartView, setChartView, setListFilters, listFilters } = useApp();
  const router = useRouter();

  const data = useMemo(
    () =>
      DASHBOARD_STATUS_GROUP_ORDER.map((group) => ({
        group,
        label: STATUS_GROUP_LABELS[group],
        description: STATUS_GROUP_DESCRIPTIONS[group],
        count: statusGroupCounts[group],
        color: STATUS_GROUP_COLORS[group],
      })).filter((entry) => entry.count > 0),
    [statusGroupCounts],
  );

  const total = dashboardApplications.length;

  const chartViewOptions = [
    { id: "donut" as const, label: "Donut", icon: PieChartIcon },
    { id: "bar" as const, label: "Bar", icon: BarChart3 },
  ];

  const openGroup = (group: DashboardStatusGroup) => {
    setListFilters({
      ...listFilters,
      selectedSources: [],
      selectedStatuses: getStatusesForGroup(group),
    });
    router.push("/applications");
  };

  return (
    <Card accent="yellow" className="gap-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Application Status</CardTitle>
            <p className="mt-2 text-sm font-bold">
              {total} application{total === 1 ? "" : "s"} tracked
            </p>
          </div>
          <div role="group" aria-label="Chart view" className="flex flex-wrap gap-2">
            {chartViewOptions.map(({ id, label, icon: Icon }) => {
              const active = chartView === id;

              return (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  size="sm"
                  pop={!active}
                  onClick={() => setChartView(id)}
                  aria-pressed={active}
                  className={clsx(
                    "h-9 min-w-[4.75rem] gap-1.5",
                    active &&
                      "cursor-default border-black/25 bg-neutral-200 font-semibold text-black/40 shadow-none hover:bg-neutral-200",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 border-[3px] border-black bg-white text-center brutal-shadow-sm">
            <p className="font-bold uppercase">No applications yet</p>
            <p className="text-sm">Connect a platform or browse Discover</p>
          </div>
        ) : (
          <PopSwap id={chartView}>
            {chartView === "donut" ? (
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="relative z-50 mx-auto w-full min-w-0 max-w-sm border-[3px] border-black bg-white brutal-shadow-sm">
              <ChartContainer height={CHART_HEIGHT} className="w-full min-w-0">
                {({ width, height }) => {
                  const hole = getDonutHoleLayout(width, height, DONUT_INNER_RADIUS);

                  return (
                    <div className="relative" style={{ width, height }}>
                      <PieChart width={width} height={height} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={data}
                          dataKey="count"
                          nameKey="label"
                          cx={hole.centerX}
                          cy={hole.centerY}
                          innerRadius={DONUT_INNER_RADIUS}
                          outerRadius={DONUT_OUTER_RADIUS}
                          paddingAngle={3}
                          stroke="#000"
                          strokeWidth={2}
                          isAnimationActive={false}
                          onClick={(_, index) => {
                            const entry = data[index];
                            if (entry) openGroup(entry.group);
                          }}
                        >
                          {data.map((entry) => (
                            <Cell key={entry.group} fill={entry.color} style={{ cursor: "pointer" }} />
                          ))}
                        </Pie>
                        <Tooltip {...chartTooltipProps} />
                      </PieChart>
                      <svg
                        className="pointer-events-none absolute inset-0"
                        width={width}
                        height={height}
                        viewBox={`0 0 ${width} ${height}`}
                        aria-hidden
                      >
                        <DonutCenterLabel layout={hole} total={total} />
                      </svg>
                    </div>
                  );
                }}
              </ChartContainer>
            </div>

            <div className="w-full flex-1 space-y-2">
              {DASHBOARD_STATUS_GROUP_ORDER.map((group) => {
                const count = statusGroupCounts[group];
                if (count === 0) return null;
                return (
                  <Button
                    key={group}
                    type="button"
                    variant="outline"
                    onClick={() => openGroup(group)}
                    className="h-auto w-full justify-start gap-3 px-4 py-3 text-left normal-case tracking-normal"
                  >
                    <div
                      className="h-4 w-4 shrink-0 border-2 border-black"
                      style={{ backgroundColor: STATUS_GROUP_COLORS[group] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold uppercase">{STATUS_GROUP_LABELS[group]}</p>
                      <p className="text-xs">{STATUS_GROUP_DESCRIPTIONS[group]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black">{count}</p>
                      <p className="text-xs font-bold">
                        {total > 0 ? Math.round((count / total) * 100) : 0}%
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
            ) : (
          <div className="space-y-6">
            <div className="relative z-50 border-[3px] border-black bg-white brutal-shadow-sm">
              <ChartContainer height={CHART_HEIGHT} className="w-full min-w-0">
                {({ width, height }) => (
                  <BarChart
                    width={width}
                    height={height}
                    data={data}
                    margin={{ top: 40, right: 16, left: 8, bottom: 4 }}
                  >
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#000", fontSize: 11, fontWeight: 700 }}
                      axisLine={{ stroke: "#000", strokeWidth: 2 }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={32}
                      tick={{ fill: "#000", fontSize: 11, fontWeight: 700 }}
                      axisLine={{ stroke: "#000", strokeWidth: 2 }}
                      tickLine={false}
                    />
                    <Tooltip {...chartTooltipProps} shared={false} />
                    <Bar dataKey="count" radius={0}>
                      {data.map((entry) => (
                        <Cell
                          key={entry.group}
                          fill={entry.color}
                          stroke="#000"
                          strokeWidth={2}
                          style={{ cursor: "pointer" }}
                          onClick={() => openGroup(entry.group)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ChartContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {DASHBOARD_STATUS_GROUP_ORDER.map((group) => {
                const count = statusGroupCounts[group];
                return (
                  <div
                    key={group}
                    className="border-[3px] border-black bg-white px-3 py-3 text-center brutal-shadow-sm"
                  >
                    <div
                      className="mx-auto mb-2 h-3 w-10 border-2 border-black"
                      style={{ backgroundColor: STATUS_GROUP_COLORS[group] }}
                    />
                    <p className="text-2xl font-black">{count}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase">
                      {STATUS_GROUP_LABELS[group]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
            )}
          </PopSwap>
        )}
      </CardContent>
    </Card>
  );
}
