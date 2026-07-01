"use client";

import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useApp } from "@/lib/store";

interface DiscoverRefreshButtonProps {
  className?: string;
  variant?: "default" | "outline";
}

export function DiscoverRefreshButton({
  className,
  variant = "outline",
}: DiscoverRefreshButtonProps) {
  const { refreshDiscoverJobs, isRefreshingDiscover } = useApp();

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => void refreshDiscoverJobs()}
      disabled={isRefreshingDiscover}
      className={clsx("gap-2", className)}
    >
      <RefreshCw
        className={clsx("h-4 w-4", isRefreshingDiscover && "animate-spin")}
      />
      {isRefreshingDiscover ? "Refreshing…" : "Refresh"}
    </Button>
  );
}
