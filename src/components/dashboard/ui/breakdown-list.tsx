import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { formatCount } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BreakdownRow {
  key: string;
  /** Display label, already localized by the caller. */
  label: string;
  count: number;
  /** Optional leading graphic (a flag, an icon). Decorative — the label carries the meaning. */
  leading?: ReactNode;
}

interface BreakdownListProps {
  title: string;
  rows: BreakdownRow[];
  /** Denominator for the share bars; a 0 total renders every bar empty. */
  total: number;
  /** Rows shown before the tail is folded behind the toggle. */
  topN: number;
  showAllLabel: string;
  showLessLabel: string;
  /** Extra classes for the label cell — e.g. a mono face for IP addresses. */
  labelClassName?: string;
}

/**
 * Share-of-total bar list used by every "top N by X" card on the dashboard
 * (country, browser, OS, device). The tail past `topN` is hidden behind a
 * toggle rather than rolled up into an aggregate row, so a long tail never
 * masquerades as a single large bucket.
 */
export function BreakdownList({
  title,
  rows,
  total,
  topN,
  showAllLabel,
  showLessLabel,
  labelClassName,
}: BreakdownListProps) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();

  const hasOverflow = rows.length > topN;
  const visible = expanded || !hasOverflow ? rows : rows.slice(0, topN);

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="dash-eyebrow">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {visible.length === 0 && <li className="text-muted-foreground text-sm">—</li>}
          {visible.map((r) => {
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
            return (
              <li key={r.key} className="flex items-center gap-3 text-sm">
                {r.leading !== undefined && (
                  <span
                    className="flex w-5 shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    {r.leading}
                  </span>
                )}
                <span
                  className={cn("text-foreground w-28 truncate", labelClassName)}
                  title={r.label}
                >
                  {r.label}
                </span>
                <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-muted-foreground flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="w-16 text-right">{formatCount(r.count)}</span>
                  <span className="text-muted-foreground/60 w-10 text-right font-bold">{pct}%</span>
                </div>
              </li>
            );
          })}
        </ul>
        {hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-muted-foreground focus-visible:ring-ring/50 mt-3 flex cursor-pointer items-center gap-1.5 rounded-sm text-xs font-medium outline-none focus-visible:ring-2"
          >
            {expanded ? showLessLabel : showAllLabel}
            <ChevronDown
              className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
