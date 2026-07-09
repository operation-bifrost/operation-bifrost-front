import type { HeatCell } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";
import { ChartFrame } from "@/components/dashboard/ui/chart-frame";

interface ActivityHeatmapProps {
  heat: HeatCell[];
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export function ActivityHeatmap({ heat }: ActivityHeatmapProps) {
  const { weekdays, title, caption } = dashboardContent.heatmap;
  const byKey = new Map(heat.map((c) => [`${c.weekday}-${c.hour}`, c.count]));
  const max = Math.max(...heat.map((c) => c.count), 1);

  return (
    <ChartFrame title={title} a11yLabel={`${title} — ${caption}`}>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="flex flex-col gap-1">
            {weekdays.map((label, weekday) => (
              <div key={label} className="flex items-center gap-1">
                <span className="text-muted-foreground w-8 font-mono text-[0.6rem] tracking-widest uppercase">
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
                              ? "var(--secondary)"
                              : `color-mix(in srgb, var(--color-nixie-base) ${Math.round(intensity * 100)}%, transparent)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-2 pl-9 font-mono text-[0.6rem] tracking-widest">
            {caption}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
