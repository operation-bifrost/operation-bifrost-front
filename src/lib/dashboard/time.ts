export const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Format a `Date`'s UTC calendar fields as "YYYY-MM-DD". */
function formatUtcDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" for the Bangkok (UTC+7) calendar day containing `epochMs`. */
export function bangkokDayKey(epochMs: number): string {
  return formatUtcDayKey(new Date(epochMs + BANGKOK_OFFSET_MS));
}

/** Parse a "YYYY-MM-DD" key into a UTC-midnight epoch ms (timezone-neutral cursor). */
function dayKeyToUtcMs(dayKey: string): number {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Inclusive ascending list of "YYYY-MM-DD" from startDay to endDay. */
export function enumerateDays(startDay: string, endDay: string): string[] {
  const out: string[] = [];
  let cursor = dayKeyToUtcMs(startDay);
  const end = dayKeyToUtcMs(endDay);
  while (cursor <= end) {
    out.push(formatUtcDayKey(new Date(cursor)));
    cursor += 24 * 60 * 60 * 1000;
  }
  return out;
}

/** Day key `days-1` before `todayKey` (so a `days`-length window ends today). */
export function rangeStartDay(todayKey: string, days: number): string {
  const start = dayKeyToUtcMs(todayKey) - (days - 1) * 24 * 60 * 60 * 1000;
  return formatUtcDayKey(new Date(start));
}
