import { useId, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { DayBucket } from "@/lib/downloads/repository";
import { bangkokDayKey, enumerateDays, rangeStartDay } from "@/lib/dashboard/time";
import { RANGE_OPTIONS, dashboardContent, type RangeKey, type SeriesMode } from "@/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TimeseriesChartProps {
  daily: DayBucket[];
  generatedAt: number;
  range: RangeKey;
  series: SeriesMode;
  onRangeChange: (r: RangeKey) => void;
  onSeriesChange: (s: SeriesMode) => void;
}

const chartConfig = {
  value: { label: "Downloads", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function TimeseriesChart({
  daily,
  generatedAt,
  range,
  series,
  onRangeChange,
  onSeriesChange,
}: TimeseriesChartProps) {
  const points = useMemo(() => {
    const byDay = new Map(daily.map((d) => [d.day, d.count]));
    const todayKey = bangkokDayKey(generatedAt);
    const rangeDays = RANGE_OPTIONS.find((o) => o.key === range)?.days ?? null;
    const startDay =
      rangeDays === null ? (daily[0]?.day ?? todayKey) : rangeStartDay(todayKey, rangeDays);
    const days = enumerateDays(startDay, todayKey);
    const dailyCounts = days.map((day) => byDay.get(day) ?? 0);
    const cumulativeCounts = dailyCounts.reduce<number[]>((acc, count) => {
      const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
      return [...acc, prev + count];
    }, []);
    return days.map((day, i) => ({
      day,
      value: series === "cumulative" ? cumulativeCounts[i] : dailyCounts[i],
    }));
  }, [daily, generatedAt, range, series]);

  const hasData = points.some((p) => p.value > 0);
  const { timeseries } = dashboardContent;
  const titleId = useId();

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle id={titleId} className="text-sm font-medium">
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
            <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
            <ToggleGroupItem value="cumulative">Cumulative</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={range}
            onValueChange={(v) => v && onRangeChange(v as RangeKey)}
          >
            {RANGE_OPTIONS.map((o) => (
              <ToggleGroupItem key={o.key} value={o.key}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <AreaChart accessibilityLayer data={points} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
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
