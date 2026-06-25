"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ChartContainerProps {
  height: number;
  children: (size: { width: number; height: number }) => ReactNode;
  className?: string;
}

/** Measures its box and passes explicit pixel dimensions to Recharts (avoids width/height -1 warnings). */
export function ChartContainer({ height, children, className }: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const nextWidth = element.getBoundingClientRect().width;
      if (nextWidth > 0) setWidth(nextWidth);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", height, minWidth: 0, minHeight: height }}
    >
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
}
