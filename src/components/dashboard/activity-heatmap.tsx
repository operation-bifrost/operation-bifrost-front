import { useId, useRef, useState } from "react";

import type { HeatCell } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityHeatmapProps {
  heat: HeatCell[];
}

interface HoverState {
  label: string;
  count: number;
  x: number;
  y: number;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
// 24 hour-columns need a floor width to stay legible; the grid scrolls on
// narrow screens below this.
const GRID_MIN_WIDTH = 560;

export function ActivityHeatmap({ heat }: ActivityHeatmapProps) {
  const { weekdays, title, caption } = dashboardContent.heatmap;
  const byKey = new Map(heat.map((c) => [`${c.weekday}-${c.hour}`, c.count]));
  const max = Math.max(...heat.map((c) => c.count), 1);
  const titleId = useId();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  // Cursor-following tooltip positioned relative to the (non-clipping) wrapper,
  // so it mirrors the Recharts tooltip instead of a native title attribute.
  const showTip = (e: React.MouseEvent, label: string, count: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ label, count, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="dash-eyebrow">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={wrapperRef} className="relative" onMouseLeave={() => setHover(null)}>
          <div className="overflow-x-auto overflow-y-hidden">
            <div style={{ minWidth: GRID_MIN_WIDTH }}>
              <div className="flex flex-col gap-1">
                {weekdays.map((label, weekday) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="text-muted-foreground w-8 text-[0.65rem] uppercase">
                      {label}
                    </span>
                    <div className="flex flex-1 gap-1">
                      {HOURS.map((hour) => {
                        const count = byKey.get(`${weekday}-${hour}`) ?? 0;
                        const intensity = count === 0 ? 0 : 0.15 + 0.85 * (count / max);
                        const timeLabel = `${label} ${String(hour).padStart(2, "0")}:00`;
                        return (
                          <div
                            key={hour}
                            aria-label={`${timeLabel} · ${count}`}
                            onMouseEnter={(e) => showTip(e, timeLabel, count)}
                            onMouseMove={(e) => showTip(e, timeLabel, count)}
                            className="aspect-square flex-1 rounded-[2px]"
                            style={{
                              backgroundColor:
                                count === 0
                                  ? "var(--muted)"
                                  : `color-mix(in oklab, var(--chart-1) ${Math.round(intensity * 100)}%, transparent)`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground mt-2 pl-9 text-[0.65rem]">{caption}</div>
            </div>
          </div>

          {hover && (
            <div
              role="tooltip"
              className="border-border/50 bg-background pointer-events-none absolute z-50 grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl"
              style={{
                left: hover.x,
                top: hover.y,
                transform: "translate(-50%, calc(-100% - 10px))",
              }}
            >
              <div className="font-medium">{hover.label}</div>
              <div className="flex w-full items-center gap-2">
                <div
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: "var(--chart-1)" }}
                />
                <div className="flex flex-1 items-center justify-between leading-none">
                  <span className="text-muted-foreground">
                    {dashboardContent.heatmap.metricLabel}
                  </span>
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {hover.count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
