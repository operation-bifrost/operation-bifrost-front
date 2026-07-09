export const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** "YYYY-MM-DD" for the Bangkok (UTC+7) calendar day containing `epochMs`. */
export function bangkokDayKey(epochMs: number): string {
  const shifted = new Date(epochMs + BANGKOK_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
    const dt = new Date(cursor);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const d = String(dt.getUTCDate()).padStart(2, "0");
    out.push(`${y}-${m}-${d}`);
    cursor += 24 * 60 * 60 * 1000;
  }
  return out;
}

/** Day key `days-1` before `todayKey` (so a `days`-length window ends today). */
export function rangeStartDay(todayKey: string, days: number): string {
  const start = dayKeyToUtcMs(todayKey) - (days - 1) * 24 * 60 * 60 * 1000;
  return enumerateDays(bangkokDayKeyFromUtcMidnight(start), bangkokDayKeyFromUtcMidnight(start))[0];
}

/** A UTC-midnight cursor is already date-only; format it directly. */
function bangkokDayKeyFromUtcMidnight(utcMs: number): string {
  const dt = new Date(utcMs);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
