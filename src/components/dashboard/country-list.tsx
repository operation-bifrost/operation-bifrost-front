import { useId, type ComponentType } from "react";
import * as Flags from "country-flag-icons/react/3x2";

import type { CountryCount } from "@/lib/downloads/repository";
import { resolveCountryName, formatCount } from "@/lib/dashboard/format";
import { dashboardContent } from "@/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountryListProps {
  data: CountryCount[];
  total: number;
}

const OTHERS_KEY = "__others";

type FlagComponent = ComponentType<{ title?: string; className?: string }>;
// country-flag-icons exports one component per ISO-3166 alpha-2 code. Index it
// dynamically (data-driven codes), tolerating unknown keys.
const flagByCode = Flags as unknown as Record<string, FlagComponent | undefined>;

/** Real SVG flag (renders cross-platform, unlike regional-indicator emoji on
 *  Windows). Falls back to a globe for UNKNOWN / unrecognized codes and an
 *  ellipsis for the rolled-up "others" row. Decorative — the row shows the
 *  country name as text, so the wrapper is aria-hidden. */
function CountryFlag({ code }: { code: string }) {
  if (code === OTHERS_KEY) return <span className="text-muted-foreground">…</span>;
  const Flag = code === "UNKNOWN" ? undefined : flagByCode[code.toUpperCase()];
  if (!Flag) return <span className="text-muted-foreground">🌐</span>;
  return <Flag className="w-5 rounded-[1px]" />;
}

export function CountryList({ data, total }: CountryListProps) {
  const { topN, othersLabel, unknownLabel, title } = dashboardContent.country;
  const top = data.slice(0, topN);
  const othersCount = data.slice(topN).reduce((sum, c) => sum + c.count, 0);

  const topRows = top.map((c) => ({
    key: c.country,
    code: c.country,
    name: c.country === "UNKNOWN" ? unknownLabel : resolveCountryName(c.country),
    count: c.count,
  }));
  const othersRow =
    othersCount > 0
      ? [{ key: OTHERS_KEY, code: OTHERS_KEY, name: othersLabel, count: othersCount }]
      : [];
  const rows = [...topRows, ...othersRow];
  const titleId = useId();

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
      </CardContent>
    </Card>
  );
}
