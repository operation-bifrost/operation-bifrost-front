import { Monitor, Smartphone, Tablet, Bot, HelpCircle } from "lucide-react";

import type { LabelCount } from "@/lib/downloads/user-agent";
import { UNKNOWN, type DeviceKind } from "@/lib/downloads/user-agent";
import { dashboardContent } from "@/data/dashboard";
import { BreakdownList, type BreakdownRow } from "@/components/dashboard/ui/breakdown-list";

const { clients } = dashboardContent;

const DEVICE_ICON: Record<DeviceKind, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  bot: Bot,
  [UNKNOWN]: HelpCircle,
};

function isDeviceKind(label: string): label is DeviceKind {
  return label in DEVICE_ICON;
}

/** `UNKNOWN` is the parser's sentinel for a missing/unrecognized family; every
 *  other label is a brand name that stays as-is in Thai copy. */
function displayLabel(label: string): string {
  return label === UNKNOWN ? clients.unknownLabel : label;
}

interface BreakdownCardProps {
  title: string;
  data: LabelCount[];
  total: number;
}

function toRows(data: LabelCount[]): BreakdownRow[] {
  return data.map((d) => ({ key: d.label, label: displayLabel(d.label), count: d.count }));
}

/** Browser or OS share — plain label rows, no icon column. */
function BreakdownCard({ title, data, total }: BreakdownCardProps) {
  return (
    <BreakdownList
      title={title}
      rows={toRows(data)}
      total={total}
      topN={clients.topN}
      showAllLabel={clients.showAllLabel}
      showLessLabel={clients.showLessLabel}
    />
  );
}

export function BrowserBreakdown({ data, total }: { data: LabelCount[]; total: number }) {
  return <BreakdownCard title={clients.browser} data={data} total={total} />;
}

export function OsBreakdown({ data, total }: { data: LabelCount[]; total: number }) {
  return <BreakdownCard title={clients.os} data={data} total={total} />;
}

/** Device split — the one breakdown with a fixed, closed set of labels, so each
 *  row gets a matching glyph and a translated name. */
export function DeviceBreakdown({ data, total }: { data: LabelCount[]; total: number }) {
  const rows: BreakdownRow[] = data.map((d) => {
    const kind = isDeviceKind(d.label) ? d.label : UNKNOWN;
    const Icon = DEVICE_ICON[kind];
    return {
      key: d.label,
      label: clients.deviceLabels[kind],
      count: d.count,
      leading: <Icon className="text-muted-foreground size-4" />,
    };
  });

  return (
    <BreakdownList
      title={clients.device}
      rows={rows}
      total={total}
      topN={clients.topN}
      showAllLabel={clients.showAllLabel}
      showLessLabel={clients.showLessLabel}
    />
  );
}
