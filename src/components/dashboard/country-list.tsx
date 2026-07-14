import { useId } from "react";

import type { CountryCount } from "@/lib/downloads/repository";
import { codeToFlagEmoji, resolveCountryName, formatCount } from "@/lib/dashboard/format";
import { dashboardContent } from "@/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountryListProps {
  data: CountryCount[];
  total: number;
}

export function CountryList({ data, total }: CountryListProps) {
  const { topN, othersLabel, unknownLabel, title } = dashboardContent.country;
  const top = data.slice(0, topN);
  const othersCount = data.slice(topN).reduce((sum, c) => sum + c.count, 0);

  const topRows = top.map((c) => ({
    key: c.country,
    flag: c.country === "UNKNOWN" ? "🌐" : codeToFlagEmoji(c.country),
    name: c.country === "UNKNOWN" ? unknownLabel : resolveCountryName(c.country),
    count: c.count,
  }));
  const othersRow =
    othersCount > 0 ? [{ key: "__others", flag: "…", name: othersLabel, count: othersCount }] : [];
  const rows = [...topRows, ...othersRow];
  const titleId = useId();

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="text-sm font-medium">
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
                <span className="w-5 text-center" aria-hidden="true">
                  {r.flag}
                </span>
                <span className="text-foreground w-28 truncate" title={r.name}>
                  {r.name}
                </span>
                <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-muted-foreground w-16 text-right tabular-nums">
                  {formatCount(r.count)} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
