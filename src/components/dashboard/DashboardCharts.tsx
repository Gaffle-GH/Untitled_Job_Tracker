"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { useApp } from "@/lib/store";
import {
  CHART_PALETTE,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationStatus,
  type JobSource,
} from "@/lib/types";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ApplicationsTrendChart() {
  const { dashboardApplications } = useApp();

  const { data, total, growth } = useMemo(() => {
    const grouped: Record<string, { month: string; count: number; sortKey: string }> = {};

    for (const app of dashboardApplications) {
      const date = new Date(app.appliedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) {
        grouped[key] = {
          month: monthNames[date.getMonth()],
          count: 0,
          sortKey: key,
        };
      }
      grouped[key].count += 1;
    }

    const sorted = Object.values(grouped)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12);

    const totalCount = sorted.reduce((sum, item) => sum + item.count, 0);
    const growthRate =
      sorted.length > 1
        ? ((sorted[sorted.length - 1].count - sorted[0].count) / Math.max(sorted[0].count, 1)) *
          100
        : 0;

    return { data: sorted, total: totalCount, growth: growthRate };
  }, [dashboardApplications]);

  return (
    <Card className="gap-0">
      <CardHeader className="border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Application Trend
          </CardTitle>
          <div className="text-right">
            <div className="text-xl font-semibold text-gray-900">{total}</div>
            <div className={`text-sm ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer height={280}>
          {({ width, height }) => (
            <AreaChart width={width} height={height} data={data}>
              <defs>
                <linearGradient id="appsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={{ stroke: "#d4d4d4" }}
                tickLine={{ stroke: "#d4d4d4" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#737373" }}
                axisLine={{ stroke: "#d4d4d4" }}
                tickLine={{ stroke: "#d4d4d4" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#appsGradient)"
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function StatusDonutChart() {
  const { dashboardApplications, chartSelection, setChartSelection } = useApp();

  const { data, total } = useMemo(() => {
    const grouped: Record<string, { status: ApplicationStatus; count: number }> = {};

    for (const app of dashboardApplications) {
      if (!grouped[app.status]) {
        grouped[app.status] = { status: app.status, count: 0 };
      }
      grouped[app.status].count += 1;
    }

    const items = Object.values(grouped).sort((a, b) => b.count - a.count);
    const sum = items.reduce((acc, item) => acc + item.count, 0);

    return {
      data: items.map((item) => ({
        ...item,
        label: STATUS_LABELS[item.status],
        percentage: sum > 0 ? ((item.count / sum) * 100).toFixed(1) : "0",
        color: STATUS_COLORS[item.status],
      })),
      total: sum,
    };
  }, [dashboardApplications]);

  const toggleStatus = (status: ApplicationStatus) => {
    setChartSelection({
      ...chartSelection,
      status: chartSelection.status === status ? null : status,
    });
  };

  return (
    <Card className="gap-0">
      <CardHeader className="border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Status Breakdown
          </CardTitle>
          <div className="text-xl font-semibold text-gray-900">{total}</div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer height={200}>
          {({ width, height }) => (
            <PieChart width={width} height={height}>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx={width / 2}
                cy={height / 2}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                onClick={(_, index) => {
                  const entry = data[index];
                  if (entry) toggleStatus(entry.status);
                }}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={entry.color}
                    stroke={chartSelection.status === entry.status ? "#374151" : "#ffffff"}
                    strokeWidth={chartSelection.status === entry.status ? 2 : 1}
                    style={{
                      cursor: "pointer",
                      filter:
                        chartSelection.status === entry.status ? "brightness(1.1)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, "Applications"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
            </PieChart>
          )}
        </ChartContainer>

        <div className="mt-4 space-y-2">
          {data.slice(0, 5).map((entry) => (
            <button
              key={entry.status}
              type="button"
              onClick={() => toggleStatus(entry.status)}
              className={`flex w-full items-center justify-between rounded-lg p-2 transition-colors duration-200 ${
                chartSelection.status === entry.status ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-900">{entry.label}</span>
              </div>
              <span className="text-sm text-gray-600">
                {entry.count} ({entry.percentage}%)
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SourceBarChart() {
  const { dashboardApplications, chartSelection, setChartSelection } = useApp();

  const data = useMemo(() => {
    const grouped: Record<JobSource, number> = {
      handshake: 0,
      linkedin: 0,
      indeed: 0,
      manual: 0,
      discover: 0,
    };
    for (const app of dashboardApplications) {
      grouped[app.source] += 1;
    }
    return Object.entries(grouped)
      .filter(([, count]) => count > 0)
      .map(([source, count], index) => ({
        source: source as JobSource,
        label: SOURCE_LABELS[source as JobSource],
        count,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      }));
  }, [dashboardApplications]);

  const toggleSource = (source: JobSource) => {
    setChartSelection({
      ...chartSelection,
      source: chartSelection.source === source ? null : source,
    });
  };

  return (
    <Card className="gap-0">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-lg text-gray-900">Applications by Source</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-6">
        {data.map((entry) => (
          <button
            key={entry.source}
            type="button"
            onClick={() => toggleSource(entry.source)}
            className={`flex w-full items-center gap-3 rounded-lg p-3 transition-colors ${
              chartSelection.source === entry.source ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="min-w-0 flex-1 text-left text-sm font-medium text-gray-900">
              {entry.label}
            </span>
            <div className="flex items-center gap-3">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((entry.count / Math.max(...data.map((d) => d.count), 1)) * 100, 8)}%`,
                    backgroundColor: entry.color,
                  }}
                />
              </div>
              <span className="w-6 text-sm font-semibold text-gray-700">{entry.count}</span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
