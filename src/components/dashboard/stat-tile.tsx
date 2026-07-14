import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

import type { Delta } from "@/lib/dashboard/format";
import { formatCount } from "@/lib/dashboard/format";
import { Sparkline } from "@/components/dashboard/ui/sparkline";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: number;
  delta?: Delta;
  sparkline?: number[];
  subLabel?: string;
}

const DELTA_ICON = { up: ArrowUp, down: ArrowDown, flat: ArrowRight } as const;
const DELTA_COLOR = {
  up: "text-primary",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const;

export function StatTile({ label, value, delta, sparkline, subLabel }: StatTileProps) {
  const showDelta = delta !== undefined && delta.pct !== null;
  const Icon = delta ? DELTA_ICON[delta.direction] : null;
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-2 p-4">
        <span className="dash-eyebrow">{label}</span>
        <div className="flex items-end justify-between gap-2">
          <span className="text-foreground text-2xl font-semibold tabular-nums">
            {formatCount(value)}
          </span>
          {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {showDelta && delta && Icon && (
            <span
              className={cn("inline-flex items-center gap-1", DELTA_COLOR[delta.direction])}
              aria-label={`${delta.direction} ${Math.abs(delta.pct as number)}%`}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {Math.abs(delta.pct as number)}%
            </span>
          )}
          {subLabel && <span className="text-muted-foreground">{subLabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
