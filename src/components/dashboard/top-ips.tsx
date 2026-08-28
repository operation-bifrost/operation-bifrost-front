import type { IpCount } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";
import { BreakdownList, type BreakdownRow } from "@/components/dashboard/ui/breakdown-list";

interface TopIpsProps {
  data: IpCount[];
  total: number;
}

/** Busiest client IPs. Addresses are monospaced and truncate with a title
 *  tooltip — IPv6 does not fit the label column at any sane width. */
export function TopIps({ data, total }: TopIpsProps) {
  const { topIps, topN, showAllLabel, showLessLabel } = dashboardContent.clients;

  const rows: BreakdownRow[] = data.map((row) => ({
    key: row.ip,
    label: row.ip,
    count: row.count,
  }));

  return (
    <BreakdownList
      title={topIps}
      rows={rows}
      total={total}
      topN={topN}
      showAllLabel={showAllLabel}
      showLessLabel={showLessLabel}
      labelClassName="font-mono text-xs"
    />
  );
}
