import { useId, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DayBucket, HourBucket } from "@/lib/downloads/repository";
import { bangkokDayKey } from "@/lib/dashboard/time";
import { buildSeriesPoints, buildHourlyPoints, isCustomRangeActive } from "@/lib/dashboard/series";
import {
  RANGE_OPTIONS,
  dashboardContent,
  type RangeKey,
  type SeriesMode,
  type CustomRange,
} from "@/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** "YYYY-MM-DD" day key → local-midnight Date (for the calendar's Date model). */
function dayKeyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local Date → "YYYY-MM-DD" day key (matches the repository's day-key format). */
function dateToDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface TimeseriesChartProps {
  daily: DayBucket[];
  hourly: HourBucket[];
  generatedAt: number;
  range: RangeKey;
  series: SeriesMode;
  customRange: CustomRange | null;
  onRangeChange: (r: RangeKey) => void;
  onSeriesChange: (s: SeriesMode) => void;
  onCustomRangeChange: (c: CustomRange | null) => void;
}

const chartConfig = {
  value: { label: dashboardContent.timeseries.metric, color: "var(--chart-1)" },
} satisfies ChartConfig;

export function TimeseriesChart({
  daily,
  hourly,
  generatedAt,
  range,
  series,
  customRange,
  onRangeChange,
  onSeriesChange,
  onCustomRangeChange,
}: TimeseriesChartProps) {
  // The 24h preset is shown at hourly resolution; every other preset (and any
  // custom day-range) stays daily.
  const useHourly = range === "24h" && !isCustomRangeActive(customRange);
  const points = useMemo(
    () =>
      useHourly
        ? buildHourlyPoints(hourly, generatedAt, series)
        : buildSeriesPoints(daily, generatedAt, range, series, customRange),
    [useHourly, hourly, daily, generatedAt, range, series, customRange],
  );

  const hasData = points.some((p) => p.value > 0);
  const { timeseries } = dashboardContent;
  const titleId = useId();

  const customActive = isCustomRangeActive(customRange);
  const maxDate = dayKeyToDate(bangkokDayKey(generatedAt));
  const minDate = daily[0]?.day ? dayKeyToDate(daily[0].day) : undefined;
  const selectedRange: DateRange | undefined = customRange
    ? {
        from: customRange.from ? dayKeyToDate(customRange.from) : undefined,
        to: customRange.to ? dayKeyToDate(customRange.to) : undefined,
      }
    : undefined;
  const handleRangeSelect = (range: DateRange | undefined) => {
    onCustomRangeChange(
      range?.from
        ? { from: dateToDayKey(range.from), to: range.to ? dateToDayKey(range.to) : "" }
        : null,
    );
  };

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle id={titleId} className="dash-eyebrow">
          {timeseries.title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={series}
            onValueChange={(v) => v && onSeriesChange(v as SeriesMode)}
          >
            <ToggleGroupItem value="daily">
              {useHourly ? timeseries.hourly : timeseries.daily}
            </ToggleGroupItem>
            <ToggleGroupItem value="cumulative">{timeseries.cumulative}</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={customActive ? "" : range}
            onValueChange={(v) => {
              if (v) {
                onRangeChange(v as RangeKey);
                onCustomRangeChange(null);
              }
            }}
          >
            {RANGE_OPTIONS.map((o) => (
              <ToggleGroupItem key={o.key} value={o.key}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label={timeseries.customRangeAria}
                className={cn("gap-2", !customActive && "text-muted-foreground")}
              >
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {isCustomRangeActive(customRange)
                  ? `${customRange.from} – ${customRange.to}`
                  : timeseries.customRange}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                numberOfMonths={2}
                autoFocus
                defaultMonth={selectedRange?.from ?? maxDate}
                selected={selectedRange}
                onSelect={handleRangeSelect}
                disabled={minDate ? [{ before: minDate }, { after: maxDate }] : { after: maxDate }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <AreaChart accessibilityLayer data={points} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip cursor content={<ChartTooltipContent />} />
              <Area
                dataKey="value"
                type="monotone"
                fill="var(--color-value)"
                fillOpacity={0.2}
                stroke="var(--color-value)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground flex h-72 w-full items-center justify-center text-sm">
            {timeseries.empty}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
