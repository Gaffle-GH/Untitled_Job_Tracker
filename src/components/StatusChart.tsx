"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
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

export function StatusChart() {
  const { applications, statusGroupCounts, chartView, setChartView, setListFilters } = useApp();
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

  const total = applications.length;

  const openGroup = (group: DashboardStatusGroup) => {
    setListFilters({
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
          <div className="flex border-[3px] border-black bg-white brutal-shadow-sm">
            <Button
              type="button"
              pop={false}
              variant="ghost"
              size="sm"
              onClick={() => setChartView("donut")}
              className={clsx(
                "h-auto gap-1.5 rounded-none border-0 px-3 py-2 text-black shadow-none",
                chartView === "donut" ? "bg-accent-cyan brutal-shadow-sm" : "hover:bg-accent-cyan/40",
              )}
            >
              <PieChartIcon className="h-3.5 w-3.5" />
              Donut
            </Button>
            <Button
              type="button"
              pop={false}
              variant="ghost"
              size="sm"
              onClick={() => setChartView("bar")}
              className={clsx(
                "h-auto gap-1.5 rounded-none border-0 border-l-[3px] border-l-black px-3 py-2 text-black shadow-none",
                chartView === "bar" ? "bg-accent-cyan brutal-shadow-sm" : "hover:bg-accent-cyan/40",
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 border-[3px] border-black bg-white text-center brutal-shadow-sm">
            <p className="font-bold uppercase">No applications yet</p>
            <p className="text-sm">Connect a platform or browse Discover</p>
          </div>
        ) : chartView === "donut" ? (
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="relative z-50 mx-auto w-full min-w-[240px] max-w-sm border-[3px] border-black bg-white brutal-shadow-sm">
              <div className="relative h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    stroke="#000"
                    strokeWidth={2}
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
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-px text-center leading-none">
                  <span className="text-2xl font-extrabold tabular-nums leading-none">{total}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Total</span>
                </div>
              </div>
              </div>
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
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
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
                </ResponsiveContainer>
              </div>
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
      </CardContent>
    </Card>
  );
}
