import { useId } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { VersionCount } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";
import { formatCount } from "@/lib/dashboard/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface VersionBarsProps {
  data: VersionCount[];
  total: number;
}

export interface VersionRow {
  version: string;
  count: number;
  pct: number;
}

export function toVersionRows(data: VersionCount[], total: number): VersionRow[] {
  return data.map((v) => ({
    version: v.version,
    count: v.count,
    pct: total > 0 ? Math.round((v.count / total) * 100) : 0,
  }));
}

const chartConfig = {
  count: { label: dashboardContent.version.metric, color: "var(--chart-1)" },
} satisfies ChartConfig;

// Vertical band per version row; the bar thickness is capped below this so a
// short list never balloons into a fat rectangle, and the chart height tracks
// the row count instead of a fixed 256px block.
const ROW_BAND = 56;
const MAX_BAR_SIZE = 40;

/** A lone version is always 100% of the total, so a single full-width bar just
 *  reads as a rectangle with no distribution to compare. Show it as a readout
 *  instead: the version tag plus a mono (Nixie) download count. */
function SoleVersion({ row }: { row: VersionRow }) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <span className="text-foreground text-sm font-medium">{row.version}</span>
      <span className="dash-readout text-3xl leading-none">{formatCount(row.count)}</span>
      <span className="text-muted-foreground text-xs">{dashboardContent.version.metric}</span>
    </div>
  );
}

export function VersionBars({ data, total }: VersionBarsProps) {
  const rows = toVersionRows(data, total);
  const titleId = useId();
  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="dash-eyebrow">
          {dashboardContent.version.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">—</p>
        ) : rows.length === 1 ? (
          <SoleVersion row={rows[0]} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: rows.length * ROW_BAND }}
          >
            <BarChart
              accessibilityLayer
              data={rows}
              layout="vertical"
              margin={{ left: 8, right: 40 }}
            >
              <XAxis type="number" dataKey="count" hide />
              <YAxis
                type="category"
                dataKey="version"
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} maxBarSize={MAX_BAR_SIZE}>
                <LabelList
                  dataKey="pct"
                  position="right"
                  className="fill-muted-foreground"
                  fontSize={11}
                  formatter={(v) => `${v}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
