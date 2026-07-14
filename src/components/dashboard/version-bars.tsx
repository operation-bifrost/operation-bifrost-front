import { useId } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { VersionCount } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";
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
  count: { label: "Downloads", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function VersionBars({ data, total }: VersionBarsProps) {
  const rows = toVersionRows(data, total);
  const titleId = useId();
  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="text-sm font-medium">
          {dashboardContent.version.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">—</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
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
              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
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
