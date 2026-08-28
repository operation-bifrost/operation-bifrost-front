import type { ComponentType } from "react";
import * as Flags from "country-flag-icons/react/3x2";

import type { CountryCount } from "@/lib/downloads/repository";
import { resolveCountryName } from "@/lib/dashboard/format";
import { dashboardContent } from "@/data/dashboard";
import { BreakdownList, type BreakdownRow } from "@/components/dashboard/ui/breakdown-list";

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
 *  — the row shows the country name as text. */
function CountryFlag({ code }: { code: string }) {
  const Flag = code === "UNKNOWN" ? undefined : flagByCode[code.toUpperCase()];
  if (!Flag) return <span className="text-muted-foreground">🌐</span>;
  return <Flag className="w-5 rounded-[1px]" />;
}

export function CountryList({ data, total }: CountryListProps) {
  const { topN, unknownLabel, title, showAllLabel, showLessLabel } = dashboardContent.country;

  const rows: BreakdownRow[] = data.map((c) => ({
    key: c.country,
    label: c.country === "UNKNOWN" ? unknownLabel : resolveCountryName(c.country),
    count: c.count,
    leading: <CountryFlag code={c.country} />,
  }));

  return (
    <BreakdownList
      title={title}
      rows={rows}
      total={total}
      topN={topN}
      showAllLabel={showAllLabel}
      showLessLabel={showLessLabel}
    />
  );
}
