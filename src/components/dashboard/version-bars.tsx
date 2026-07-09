import type { VersionCount } from "@/lib/downloads/repository";
import { formatCount } from "@/lib/dashboard/format";
import { dashboardContent } from "@/data/dashboard";
import { ChartFrame } from "@/components/dashboard/ui/chart-frame";

interface VersionBarsProps {
  data: VersionCount[];
  total: number;
}

export function VersionBars({ data, total }: VersionBarsProps) {
  return (
    <ChartFrame title={dashboardContent.version.title} a11yLabel="Downloads by version">
      <ul className="flex flex-col gap-3">
        {data.length === 0 && <li className="text-muted-foreground font-mono text-xs">—</li>}
        {data.map((v) => {
          const pct = total > 0 ? Math.round((v.count / total) * 100) : 0;
          return (
            <li key={v.version} className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-foreground">{v.version}</span>
                <span className="text-muted-foreground">
                  {formatCount(v.count)} · {pct}%
                </span>
              </div>
              <div className="bg-secondary h-2.5 w-full overflow-hidden rounded-sm">
                <div
                  className="bg-chart-nixie-1 h-full rounded-sm transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}
