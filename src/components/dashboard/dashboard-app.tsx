import { useCallback, useState } from "react";

import type { DashboardSnapshot } from "@/lib/downloads/repository";
import { computeDelta } from "@/lib/dashboard/format";
import {
  dashboardContent,
  type RangeKey,
  type SeriesMode,
  type CustomRange,
} from "@/data/dashboard";
import { ConsoleBar } from "@/components/dashboard/console-bar";
import { HeroTotal } from "@/components/dashboard/hero-total";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TimeseriesChart } from "@/components/dashboard/timeseries-chart";
import { VersionBars } from "@/components/dashboard/version-bars";
import { CountryList } from "@/components/dashboard/country-list";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardAppProps {
  snapshot: DashboardSnapshot;
}

function daysSpan(firstAt: number | null, lastAt: number | null): number {
  if (firstAt === null || lastAt === null) return 1;
  return Math.max(1, Math.round((lastAt - firstAt) / 86_400_000) + 1);
}

export function DashboardApp({ snapshot: initial }: DashboardAppProps) {
  const [snapshot, setSnapshot] = useState(initial);
  const [range, setRange] = useState<RangeKey>("30d");
  const [series, setSeries] = useState<SeriesMode>("daily");
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/snapshot");
      if (res.ok) setSnapshot((await res.json()) as DashboardSnapshot);
    } catch {
      /* keep last-good data on screen */
    } finally {
      setRefreshing(false);
    }
  }, []);

  const { tiles } = dashboardContent;
  const spark = snapshot.daily.slice(-14).map((d) => d.count);
  const avgPerDay = Math.round(snapshot.total / daysSpan(snapshot.firstAt, snapshot.lastAt));

  return (
    <div className="wide:max-w-8xl mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <ConsoleBar syncedAt={snapshot.generatedAt} onRefresh={refresh} refreshing={refreshing} />

      <Card>
        <CardContent className="p-6">
          <HeroTotal
            total={snapshot.total}
            version={snapshot.currentVersion}
            hasData={snapshot.total > 0}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label={tiles.last24h}
          value={snapshot.windows.last24h}
          delta={computeDelta(snapshot.windows.last24h, snapshot.windows.prev24h)}
          sparkline={spark}
        />
        <StatTile
          label={tiles.last7d}
          value={snapshot.windows.last7d}
          delta={computeDelta(snapshot.windows.last7d, snapshot.windows.prev7d)}
          sparkline={spark}
        />
        <StatTile
          label={tiles.peakDay}
          value={snapshot.peakDay?.count ?? 0}
          subLabel={snapshot.peakDay?.day}
        />
        <StatTile label={tiles.avgPerDay} value={avgPerDay} />
      </div>

      <TimeseriesChart
        daily={snapshot.daily}
        hourly={snapshot.hourly}
        generatedAt={snapshot.generatedAt}
        range={range}
        series={series}
        customRange={customRange}
        onRangeChange={setRange}
        onSeriesChange={setSeries}
        onCustomRangeChange={setCustomRange}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VersionBars data={snapshot.byVersion} total={snapshot.total} />
        <CountryList data={snapshot.byCountry} total={snapshot.total} />
      </div>

      <ActivityHeatmap heat={snapshot.heat} />

      <p className="text-muted-foreground border-border border-t pt-4 text-center text-xs">
        {dashboardContent.provenance}
      </p>
    </div>
  );
}
