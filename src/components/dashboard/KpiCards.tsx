"use client";

import { Briefcase, DollarSign, TrendingUp, Users, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  type ApplicationStatus,
  type JobSource,
} from "@/lib/types";

const stats = [
  {
    key: "total",
    label: "Total Applications",
    icon: Briefcase,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    format: (v: number) => String(v),
    sub: () => "Current selection",
  },
  {
    key: "interview",
    label: "In Interview",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    format: (v: number) => String(v),
    sub: () => "Active pipeline",
  },
  {
    key: "offers",
    label: "Offers",
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    format: (v: number) => String(v),
    sub: () => "Offer & accepted",
  },
  {
    key: "responseRate",
    label: "Response Rate",
    icon: TrendingUp,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    format: (v: number) => `${v.toFixed(1)}%`,
    sub: (stats: { rejected: number }) => `${stats.rejected} rejected`,
  },
] as const;

export function KpiCards() {
  const { dashboardStats } = useApp();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, iconBg, iconColor, format, sub }) => (
        <Card key={key} className="gap-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {format(dashboardStats[key])}
                </p>
                <p className="mt-1 text-sm text-gray-500">{sub(dashboardStats)}</p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ActiveSelectionsBanner() {
  const { chartSelection, clearChartSelection } = useApp();

  if (!chartSelection.status && !chartSelection.source) return null;

  return (
    <Card className="gap-0 border-amber-200 bg-amber-50 shadow-none">
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <span className="text-sm font-medium text-amber-800">Active selections:</span>
        {chartSelection.status && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            Status: {STATUS_LABELS[chartSelection.status as ApplicationStatus]}
          </span>
        )}
        {chartSelection.source && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Source: {SOURCE_LABELS[chartSelection.source as JobSource]}
          </span>
        )}
        <button
          onClick={clearChartSelection}
          className="ml-auto flex items-center gap-1 text-sm text-amber-800 hover:text-amber-900"
        >
          <XCircle className="h-4 w-4" />
          Clear
        </button>
      </CardContent>
    </Card>
  );
}
