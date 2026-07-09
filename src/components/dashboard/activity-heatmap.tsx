import type { HeatCell } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityHeatmapProps {
  heat: HeatCell[];
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
// 24 hour-columns need a floor width to stay legible; the grid scrolls on
// narrow screens below this.
const GRID_MIN_WIDTH = 560;

export function ActivityHeatmap({ heat }: ActivityHeatmapProps) {
  const { weekdays, title, caption } = dashboardContent.heatmap;
  const byKey = new Map(heat.map((c) => [`${c.weekday}-${c.hour}`, c.count]));
  const max = Math.max(...heat.map((c) => c.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
                      return (
                        <div
                          key={hour}
                          title={`${label} ${String(hour).padStart(2, "0")}:00 · ${count}`}
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
      </CardContent>
    </Card>
  );
}
