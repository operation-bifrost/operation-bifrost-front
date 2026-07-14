import { useId, useState, type ComponentType } from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { ChevronDown } from "lucide-react";

import type { CountryCount } from "@/lib/downloads/repository";
import { resolveCountryName, formatCount } from "@/lib/dashboard/format";
import { dashboardContent } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountryListProps {
  data: CountryCount[];
  total: number;
}

type FlagComponent = ComponentType<{ title?: string; className?: string }>;
// country-flag-icons exports one component per ISO-3166 alpha-2 code. Index it
// dynamically (data-driven codes), tolerating unknown keys.
const flagByCode = Flags as unknown as Record<string, FlagComponent | undefined>;

/** Real SVG flag (renders cross-platform, unlike regional-indicator emoji on
 *  Windows). Falls back to a globe for UNKNOWN / unrecognized codes. Decorative
 *  — the row shows the country name as text, so the wrapper is aria-hidden. */
function CountryFlag({ code }: { code: string }) {
  const Flag = code === "UNKNOWN" ? undefined : flagByCode[code.toUpperCase()];
  if (!Flag) return <span className="text-muted-foreground">🌐</span>;
  return <Flag className="w-5 rounded-[1px]" />;
}

interface CountryRow {
  key: string;
  code: string;
  name: string;
  count: number;
}

export function CountryList({ data, total }: CountryListProps) {
  const { topN, unknownLabel, title, showAllLabel, showLessLabel } = dashboardContent.country;
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();

  const toRow = (c: CountryCount): CountryRow => ({
    key: c.country,
    code: c.country,
    name: c.country === "UNKNOWN" ? unknownLabel : resolveCountryName(c.country),
    count: c.count,
  });

  // More countries than the top slice? The tail is hidden behind a "show all"
  // toggle — never rolled up into an aggregate row.
  const hasOverflow = data.length > topN;
  const rows = (expanded || !hasOverflow ? data : data.slice(0, topN)).map(toRow);

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="dash-eyebrow">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {rows.length === 0 && <li className="text-muted-foreground text-sm">—</li>}
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
            return (
              <li key={r.key} className="flex items-center gap-3 text-sm">
                <span className="flex w-5 shrink-0 items-center justify-center" aria-hidden="true">
                  <CountryFlag code={r.code} />
                </span>
                <span className="text-foreground w-28 truncate" title={r.name}>
                  {r.name}
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
