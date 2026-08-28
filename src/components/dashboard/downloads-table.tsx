import { useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { DownloadRow } from "@/lib/downloads/repository";
import { parseUserAgent, UNKNOWN } from "@/lib/downloads/user-agent";
import { resolveCountryName } from "@/lib/dashboard/format";
import { formatBangkokDateTime } from "@/lib/dashboard/time";
import { dashboardContent } from "@/data/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DownloadsTableProps {
  rows: DownloadRow[];
}

interface LogRow {
  id: number;
  time: string;
  version: string;
  country: string;
  ip: string;
  /** "Chrome · Windows", or the em-dash placeholder. */
  client: string;
  /** Raw User-Agent, surfaced as the client cell's tooltip. */
  userAgent: string;
}

const { log } = dashboardContent;

/** Browser and OS joined for the client column; either half may be unknown, so
 *  the join drops the unresolved side instead of printing "UNKNOWN". */
function describeClient(userAgent: string | null): string {
  const { browser, os } = parseUserAgent(userAgent);
  const parts = [browser, os].filter((p) => p !== UNKNOWN);
  return parts.length > 0 ? parts.join(" · ") : log.unknownLabel;
}

export function toLogRows(rows: DownloadRow[]): LogRow[] {
  return rows.map((r) => ({
    id: r.id,
    time: formatBangkokDateTime(r.createdAt),
    version: r.version,
    country: r.country === null ? log.unknownLabel : resolveCountryName(r.country),
    ip: r.ip ?? log.unknownLabel,
    client: describeClient(r.userAgent),
    userAgent: r.userAgent ?? log.unknownLabel,
  }));
}

/** Fill the `{from}-{to} of {total}` template from the content module. */
function formatPageStatus(from: number, to: number, total: number): string {
  return log.pageStatus
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(total));
}

const CELL = "px-3 py-2 whitespace-nowrap";

/**
 * The raw download log — one row per click, newest first. The aggregate cards
 * above answer "how many"; this answers "which ones", so nothing here is
 * bucketed or rounded.
 */
export function DownloadsTable({ rows }: DownloadsTableProps) {
  const titleId = useId();
  const [page, setPage] = useState(0);

  const logRows = useMemo(() => toLogRows(rows), [rows]);
  const pageCount = Math.max(1, Math.ceil(logRows.length / log.pageSize));
  // Clamp rather than reset: a refresh that shrinks the log should land on the
  // last page, not silently jump the reader back to the top.
  const current = Math.min(page, pageCount - 1);
  const start = current * log.pageSize;
  const visible = logRows.slice(start, start + log.pageSize);

  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} className="dash-eyebrow">
          {log.title}
        </CardTitle>
        <span className="text-muted-foreground text-xs">{log.caption}</span>
      </CardHeader>
      <CardContent>
        {logRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">{log.empty}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-border text-muted-foreground border-b text-left">
                    <th scope="col" className={`${CELL} dash-eyebrow`}>
                      {log.columns.time}
                    </th>
                    <th scope="col" className={`${CELL} dash-eyebrow`}>
                      {log.columns.version}
                    </th>
                    <th scope="col" className={`${CELL} dash-eyebrow`}>
                      {log.columns.country}
                    </th>
                    <th scope="col" className={`${CELL} dash-eyebrow`}>
                      {log.columns.ip}
                    </th>
                    <th scope="col" className={`${CELL} dash-eyebrow`}>
                      {log.columns.client}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id} className="border-border/50 hover:bg-muted/40 border-b">
                      <td className={`${CELL} text-muted-foreground font-mono text-xs`}>
                        {r.time}
                      </td>
                      <td className={`${CELL} text-foreground`}>{r.version}</td>
                      <td className={`${CELL} text-muted-foreground`}>{r.country}</td>
                      <td className={`${CELL} text-muted-foreground font-mono text-xs`}>{r.ip}</td>
                      <td className={`${CELL} text-muted-foreground`} title={r.userAgent}>
                        {r.client}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-xs tabular-nums">
                {formatPageStatus(start + 1, start + visible.length, logRows.length)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(current - 1)}
                  disabled={current === 0}
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                  {log.prevLabel}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(current + 1)}
                  disabled={current >= pageCount - 1}
                >
                  {log.nextLabel}
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
