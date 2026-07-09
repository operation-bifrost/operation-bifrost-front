import type { Delta } from "@/lib/dashboard/format";
import { formatCount } from "@/lib/dashboard/format";
import { Sparkline } from "@/components/dashboard/ui/sparkline";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: number;
  delta?: Delta;
  sparkline?: number[];
  subLabel?: string;
}

export function StatTile({ label, value, delta, sparkline, subLabel }: StatTileProps) {
  const showDelta = delta && delta.pct !== null;
  const marker = delta?.direction === "up" ? "▲" : delta?.direction === "down" ? "▼" : "→";
  return (
    <div className="dash-scanline bg-card/90 border-border flex flex-col gap-2 rounded-md border p-4 backdrop-blur-sm">
      <span className="text-muted-foreground font-mono text-[0.7rem] tracking-widest uppercase">
        {label}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-foreground font-mono text-2xl font-bold tabular-nums">
          {formatCount(value)}
        </span>
        {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
      </div>
      <div className="flex items-center gap-2 font-mono text-xs">
        {showDelta && (
          <span className={cn(delta.direction === "down" ? "text-destructive" : "text-primary")}>
            {marker} {Math.abs(delta.pct as number)}%
          </span>
        )}
        {subLabel && <span className="text-muted-foreground">{subLabel}</span>}
      </div>
    </div>
  );
}
