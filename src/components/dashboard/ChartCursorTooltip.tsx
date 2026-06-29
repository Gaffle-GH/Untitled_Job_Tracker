"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TooltipContentProps, TooltipProps } from "recharts";

type ChartTooltipEntry = {
  label?: string;
  description?: string;
  count?: number;
  color?: string;
};

const OFFSET = 14;

function setTooltipPosition(el: HTMLElement, clientX: number, clientY: number) {
  el.style.transform = `translate3d(${clientX + OFFSET}px, ${clientY + OFFSET}px, 0)`;
}

export function ChartCursorTooltip({
  active,
  payload,
  coordinate,
}: TooltipContentProps) {
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active) {
      wasActiveRef.current = false;
      return;
    }

    const onMove = (event: MouseEvent) => {
      const el = tooltipRef.current;
      if (el) setTooltipPosition(el, event.clientX, event.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);

  useLayoutEffect(() => {
    if (!active || !coordinate) return;

    const el = tooltipRef.current;
    if (!el) return;

    if (!wasActiveRef.current) {
      const wrapper = document.querySelector<HTMLElement>(".recharts-wrapper");
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        setTooltipPosition(el, rect.left + coordinate.x, rect.top + coordinate.y);
      }
      wasActiveRef.current = true;
    }
  }, [active, coordinate?.x, coordinate?.y]);

  if (!mounted || !active || !payload?.length) return null;

  const entry = payload[0]?.payload as ChartTooltipEntry | undefined;
  if (!entry) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed left-0 top-0 border-[3px] border-black bg-[#fffef5] px-3 py-2 text-black brutal-shadow-sm will-change-transform"
      style={{ zIndex: 99999 }}
    >
      <div className="flex items-center gap-2">
        {entry.color ? (
          <span
            className="h-3 w-3 shrink-0 border-2 border-black"
            style={{ backgroundColor: entry.color }}
          />
        ) : null}
        <p className="text-xs font-black uppercase leading-none">{entry.label}</p>
      </div>
      {entry.description ? (
        <p className="mt-1 max-w-[200px] text-[11px] font-medium leading-snug">{entry.description}</p>
      ) : null}
      <p className="mt-1.5 text-xl font-black tabular-nums leading-none">{entry.count}</p>
    </div>,
    document.body,
  );
}

/** Hide Recharts' in-chart wrapper; content portals to document.body instead. */
export const chartTooltipProps: Partial<TooltipProps> = {
  content: ChartCursorTooltip,
  cursor: false,
  animationDuration: 0,
  isAnimationActive: false,
  offset: OFFSET,
  allowEscapeViewBox: { x: true, y: true },
  wrapperStyle: {
    width: 0,
    height: 0,
    overflow: "visible",
    visibility: "hidden",
    pointerEvents: "none",
  },
};
