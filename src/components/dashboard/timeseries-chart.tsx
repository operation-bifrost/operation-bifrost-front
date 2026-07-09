import { useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";
import { area, line, curveMonotoneX } from "d3-shape";

import type { DayBucket } from "@/lib/downloads/repository";
import { bangkokDayKey, enumerateDays, rangeStartDay } from "@/lib/dashboard/time";
import { RANGE_OPTIONS, dashboardContent, type RangeKey, type SeriesMode } from "@/data/dashboard";
import { ChartFrame } from "@/components/dashboard/ui/chart-frame";
import { cn } from "@/lib/utils";

interface TimeseriesChartProps {
  daily: DayBucket[];
  generatedAt: number;
  range: RangeKey;
  series: SeriesMode;
  onRangeChange: (r: RangeKey) => void;
  onSeriesChange: (s: SeriesMode) => void;
}

const W = 720;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

export function TimeseriesChart({
  daily,
  generatedAt,
  range,
  series,
  onRangeChange,
  onSeriesChange,
}: TimeseriesChartProps) {
  const [hover, setHover] = useState<{ day: string; value: number; x: number } | null>(null);

  const points = useMemo(() => {
    const byDay = new Map(daily.map((d) => [d.day, d.count]));
    const todayKey = bangkokDayKey(generatedAt);
    const rangeDays = RANGE_OPTIONS.find((o) => o.key === range)?.days ?? null;
    const startDay =
      rangeDays === null ? (daily[0]?.day ?? todayKey) : rangeStartDay(todayKey, rangeDays);
    const days = enumerateDays(startDay, todayKey);
    const dailyCounts = days.map((day) => byDay.get(day) ?? 0);
    const cumulativeCounts = dailyCounts.reduce<number[]>((acc, count) => {
      const prevRunning = acc.length > 0 ? acc[acc.length - 1] : 0;
      return [...acc, prevRunning + count];
    }, []);
    return days.map((day, i) => ({
      day,
      value: series === "cumulative" ? cumulativeCounts[i] : dailyCounts[i],
    }));
  }, [daily, generatedAt, range, series]);

  const hasData = points.some((p) => p.value > 0);
  const maxY = Math.max(...points.map((p) => p.value), 1);
  const x = scaleLinear()
    .domain([0, Math.max(points.length - 1, 1)])
    .range([PAD.left, W - PAD.right]);
  const y = scaleLinear()
    .domain([0, maxY])
    .nice()
    .range([H - PAD.bottom, PAD.top]);

  const linePath = line<{ value: number }>()
    .x((_, i) => x(i))
    .y((d) => y(d.value))
    .curve(curveMonotoneX)(points);
  const areaPath = area<{ value: number }>()
    .x((_, i) => x(i))
    .y0(y(0))
    .y1((d) => y(d.value))
    .curve(curveMonotoneX)(points);
  const yTicks = y.ticks(4);

  const rangeActions = (
    <div className="flex items-center gap-3 font-mono text-[0.7rem]">
      <div className="flex gap-1">
        {RANGE_OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onRangeChange(o.key)}
            className={cn(
              "rounded px-1.5 py-0.5 tracking-widest transition-colors",
              range === o.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(["daily", "cumulative"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSeriesChange(mode)}
            className={cn(
              "tracking-wide transition-colors",
              series === mode ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            {series === mode ? "◉" : "○"} {mode}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ChartFrame
      title={dashboardContent.timeseries.title}
      a11yLabel={`${dashboardContent.timeseries.title} chart`}
      actions={rangeActions}
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          preserveAspectRatio="xMidYMid meet"
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                className="dash-grid-line"
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
              />
              <text
                x={PAD.left - 6}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground font-mono"
                fontSize={9}
              >
                {t}
              </text>
            </g>
          ))}
          {hasData && areaPath && (
            <path d={areaPath} fill="var(--color-nixie-base)" fillOpacity={0.12} />
          )}
          {hasData && linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-nixie-base)"
              strokeWidth={2}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 4px rgba(255,199,0,0.55))" }}
            />
          )}
          {!hasData && (
            <text
              x={W / 2}
              y={H / 2}
              textAnchor="middle"
              className="fill-muted-foreground font-mono tracking-widest"
              fontSize={12}
            >
              {dashboardContent.timeseries.empty}
            </text>
          )}
          {hover && (
            <line
              className="dash-grid-line"
              x1={hover.x}
              x2={hover.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              strokeOpacity={0.4}
            />
          )}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={W - PAD.left - PAD.right}
            height={H - PAD.top - PAD.bottom}
            fill="transparent"
            onMouseMove={(e) => {
              const rect = (e.target as SVGRectElement).getBoundingClientRect();
              const rel = (e.clientX - rect.left) / rect.width;
              const idx = Math.round(rel * (points.length - 1));
              const p = points[Math.max(0, Math.min(points.length - 1, idx))];
              if (p) setHover({ day: p.day, value: p.value, x: x(idx) });
            }}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
        {hover && (
          <div className="text-foreground bg-popover border-border pointer-events-none absolute top-0 left-0 rounded border px-2 py-1 font-mono text-[0.7rem]">
            {hover.day} · {hover.value}
          </div>
        )}
      </div>
    </ChartFrame>
  );
}
